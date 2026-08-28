import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"
import { invalidateNotificationCache } from "@/app/lib/notificationCache"

/**
 * API Route: POST /api/certificates/send
 * Sends certificates to event attendees
 * 
 * Request body:
 * {
 *   eventId: string,    // UUID of the event
 *   sendToAll: boolean, // Whether to send to all attendees or specific ones
 *   userIds: number[]   // Array of user IDs to send to (if sendToAll is false)
 * }
 */
export async function POST(request: NextRequest) {


  // Step 1: Authentication check
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    console.log("❌ Unauthorized - No session")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Step 2: Parse request body
  let requestBody
  try {
    const text = await request.text()
    console.log(`📩 Raw request body: ${text}`)

    if (!text || text.trim() === '') {
      console.log("❌ Empty request body")
      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    try {
      requestBody = JSON.parse(text)
    } catch (parseError) {
      console.log(`❌ JSON parse error: ${parseError instanceof Error ? parseError.message : "Unknown error"}`)
      return NextResponse.json({
        error: "Invalid JSON",
        details: parseError instanceof Error ? parseError.message : "Failed to parse JSON"
      }, { status: 400 })
    }

    if (!requestBody || typeof requestBody !== 'object') {
      console.log("❌ Request body is not an object")
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error reading request body:", error)
    return NextResponse.json({
      error: "Failed to read request body",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 400 })
  }

  // Step 3: Extract and validate parameters
  const { eventId, sendToAll = false, userIds = [] } = requestBody

  console.log(`📋 Request parameters: eventId=${eventId}, sendToAll=${sendToAll}, userIds.length=${userIds.length}`)

  if (!eventId) {
    console.log("❌ Missing eventId parameter")
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  // Step 4: Verify the event exists and user is authorized
  try {
    console.log(`🔍 Looking up event with ID: ${eventId}`)

    const event = await prisma.event.findUnique({
      where: { eventId: eventId },
      select: {
        id: true,
        eventId: true,
        name: true,
        createdById: true,
        status: true
      }
    })

    if (!event) {
      console.log(`❌ Event not found: ${eventId}`)
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    console.log(`✅ Found event: ${event.name} (ID: ${event.id}, UUID: ${event.eventId})`)

    if (event.createdById !== Number(session.user.id)) {
      console.log(`❌ Authorization failed. Event creator: ${event.createdById}, Requester: ${session.user.id}`)
      return NextResponse.json({
        error: "Unauthorized: Only the event creator can send certificates"
      }, { status: 403 })
    }

    // Only allow sending certificates for ENDED events
    if (event.status !== "ENDED") {
      console.log(`❌ Event must be ENDED to send certificates. Current status: ${event.status}`)
      return NextResponse.json({
        error: "Cannot send certificates for events that haven't ended yet",
        details: `Current status: ${event.status}`
      }, { status: 400 })
    }

    console.log(`✅ User authorized to send certificates for event: ${event.name}`)

    // Step 5: Get eligible attendees
    let eligibleAttendees = []
    let numericUserIds: number[] = []

    if (sendToAll) {
      console.log("🔄 Processing certificates for all attendees")

      // Get existing certificates to avoid duplicates
      const existingCertificates = await prisma.certificate.findMany({
        where: { eventId: event.eventId },
        select: { userId: true }
      })

      const existingUserIds = existingCertificates.map(cert => cert.userId)
      console.log(`ℹ️ Found ${existingUserIds.length} existing certificates`)

      // Find attendees who don't have certificates yet
      const attendees = await prisma.eventAttendee.findMany({
        where: {
          eventId: event.eventId,
          ...(existingUserIds.length > 0 ? {
            userId: { notIn: existingUserIds }
          } : {})
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      console.log(`✅ Found ${attendees.length} attendees without certificates`)

      eligibleAttendees = attendees.map(attendee => ({
        userId: attendee.userId,
        name: attendee.user.name || "Unknown",
        email: attendee.user.email
      }))
    } else if (userIds.length > 0) {
      console.log(`🔄 Processing certificates for ${userIds.length} specific attendees`)

      // Ensure all userIds are numbers
      numericUserIds = userIds.map((id: any) => {
        const numId = typeof id === 'string' ? parseInt(id) : Number(id)
        return isNaN(numId) ? null : numId
      }).filter((id: any) => id !== null) as number[]

      if (numericUserIds.length === 0) {
        console.log("❌ No valid user IDs provided")
        return NextResponse.json({ error: "No valid user IDs provided" }, { status: 400 })
      }

      console.log(`🔢 Converted user IDs: ${numericUserIds.join(', ')}`)

      // Find specified attendees who are registered for this event
      const attendees = await prisma.eventAttendee.findMany({
        where: {
          eventId: event.eventId,
          userId: { in: numericUserIds }
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      console.log(`✅ Found ${attendees.length} matching attendees out of ${numericUserIds.length} requested`)

      eligibleAttendees = attendees.map(attendee => ({
        userId: attendee.userId,
        name: attendee.user.name || "Unknown",
        email: attendee.user.email
      }))
    } else {
      console.log("❌ Neither sendToAll nor valid userIds provided")
      return NextResponse.json({ error: "Either sendToAll must be true or userIds must be provided" }, { status: 400 })
    }

    if (eligibleAttendees.length === 0) {
      console.log("ℹ️ No eligible recipients found")
      return NextResponse.json({
        message: "No eligible recipients found. All attendees may already have certificates.",
        success: true,
        sent: 0
      })
    }

    console.log(`🎓 Processing certificates for ${eligibleAttendees.length} attendees`)

    // Step 6: Process certificates one by one
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{
        userId: number;
        name: string;
        email: string;
        result: string;
        error?: string;
      }>
    }

    for (const attendee of eligibleAttendees) {
      try {
        console.log(`🔄 Processing certificate for user ${attendee.userId} (${attendee.name})`)

        // Check if certificate exists first
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            eventId: event.eventId,
            userId: attendee.userId
          }
        })

        if (existingCertificate) {
          // If we're specifically trying to resend to this user, update the certificate
          if (!sendToAll && numericUserIds.includes(attendee.userId)) {
            console.log(`🔄 Updating existing certificate for user ${attendee.userId}`)

            await prisma.certificate.update({
              where: { id: existingCertificate.id },
              data: { createdAt: new Date() }
            })

            // Create a notification for the reissued certificate
            await prisma.notification.create({
              data: {
                userId: attendee.userId,
                type: "CERTIFICATE_AVAILABLE",
                message: `Your certificate for ${event.name} has been reissued. You can download it from your profile.`,
                read: false
              }
            })

            // Invalidate Cache
            await invalidateNotificationCache(attendee.userId)

            results.updated++
            results.details.push({
              userId: attendee.userId,
              name: attendee.name,
              email: attendee.email,
              result: "updated"
            })
          } else {
            console.log(`⏭️ Skipping user ${attendee.userId} - certificate already exists`)

            results.skipped++
            results.details.push({
              userId: attendee.userId,
              name: attendee.name,
              email: attendee.email,
              result: "skipped"
            })
          }
        } else {
          console.log(`✨ Creating new certificate for user ${attendee.userId}`)

          // Create a new certificate
          const certificate = await prisma.certificate.create({
            data: {
              eventId: event.eventId,
              userId: attendee.userId,
              downloadUrl: `/api/certificates/download?eventId=${event.eventId}&userId=${attendee.userId}`
            }
          })

          console.log(`📬 Creating notification for user ${attendee.userId}`)

          // Create a notification
          await prisma.notification.create({
            data: {
              userId: attendee.userId,
              type: "CERTIFICATE_AVAILABLE",
              message: `Your certificate for ${event.name} is now available. You can download it from your profile.`,
              read: false
            }
          })

          // Invalidate Cache
          await invalidateNotificationCache(attendee.userId)

          results.created++
          results.details.push({
            userId: attendee.userId,
            name: attendee.name,
            email: attendee.email,
            result: "created"
          })
        }
      } catch (error) {
        console.error(`❌ Error processing certificate for user ${attendee.userId}:`, error)

        results.errors++
        results.details.push({
          userId: attendee.userId,
          name: attendee.name,
          email: attendee.email,
          result: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    // Step 7: Return results
    console.log(`✅ Certificate processing complete: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`)

    return NextResponse.json({
      success: true,
      message: `Certificates processed: ${results.created} created, ${results.updated} reissued, ${results.skipped} skipped, ${results.errors} errors.`,
      results
    })

  } catch (error) {
    console.error("❌ Error processing certificates:", error)
    return NextResponse.json({
      error: "Failed to process certificates",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
