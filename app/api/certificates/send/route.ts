import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"
import { invalidateNotificationCache } from "@/app/lib/notificationCache"
import { addEmailJob } from "@/app/lib/queue"
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
    
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Step 2: Parse request body
  let requestBody
  try {
    const text = await request.text()
    

    if (!text || text.trim() === '') {
      
      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    try {
      requestBody = JSON.parse(text)
    } catch (parseError) {
      
      return NextResponse.json({
        error: "Invalid JSON",
        details: parseError instanceof Error ? parseError.message : "Failed to parse JSON"
      }, { status: 400 })
    }

    if (!requestBody || typeof requestBody !== 'object') {
      
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 })
    }
  } catch (error) {
    
    return NextResponse.json({
      error: "Failed to read request body",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 400 })
  }

  // Step 3: Extract and validate parameters
  const { eventId, sendToAll = false, userIds = [] } = requestBody

  

  if (!eventId) {
    
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  // Step 4: Verify the event exists and user is authorized
  try {
    

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
      
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.createdById !== Number(session.user.id)) {
      
      return NextResponse.json({
        error: "Unauthorized: Only the event creator can send certificates"
      }, { status: 403 })
    }

    // Only allow sending certificates for ENDED events
    if (event.status !== "ENDED") {
      
      return NextResponse.json({
        error: "Cannot send certificates for events that haven't ended yet",
        details: `Current status: ${event.status}`
      }, { status: 400 })
    }

    

    // Step 5: Get eligible attendees
    let eligibleAttendees = []
    let numericUserIds: number[] = []

    if (sendToAll) {
      

      // Get existing certificates to avoid duplicates
      const existingCertificates = await prisma.certificate.findMany({
        where: { eventId: event.eventId },
        select: { userId: true }
      })

      const existingUserIds = existingCertificates.map(cert => cert.userId)
      

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

      

      eligibleAttendees = attendees.map(attendee => ({
        userId: attendee.userId,
        name: attendee.user.name || "Unknown",
        email: attendee.user.email
      }))
    } else if (userIds.length > 0) {
      

      // Ensure all userIds are numbers
      numericUserIds = userIds.map((id: any) => {
        const numId = typeof id === 'string' ? parseInt(id) : Number(id)
        return isNaN(numId) ? null : numId
      }).filter((id: any) => id !== null) as number[]

      if (numericUserIds.length === 0) {
        
        return NextResponse.json({ error: "No valid user IDs provided" }, { status: 400 })
      }

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

      

      eligibleAttendees = attendees.map(attendee => ({
        userId: attendee.userId,
        name: attendee.user.name || "Unknown",
        email: attendee.user.email
      }))
    } else {
      
      return NextResponse.json({ error: "Either sendToAll must be true or userIds must be provided" }, { status: 400 })
    }

    if (eligibleAttendees.length === 0) {
      
      return NextResponse.json({
        message: "No eligible recipients found. All attendees may already have certificates.",
        success: true,
        sent: 0
      })
    }

    

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

            // Send email
            await addEmailJob({
              type: "CERTIFICATE",
              email: attendee.email,
              name: attendee.name,
              eventName: event.name,
              certificateLink: existingCertificate.downloadUrl
            })

            results.updated++
            results.details.push({
              userId: attendee.userId,
              name: attendee.name,
              email: attendee.email,
              result: "updated"
            })
          } else {
            

            results.skipped++
            results.details.push({
              userId: attendee.userId,
              name: attendee.name,
              email: attendee.email,
              result: "skipped"
            })
          }
        } else {
          

          // Create a new certificate
          const certificate = await prisma.certificate.create({
            data: {
              eventId: event.eventId,
              userId: attendee.userId,
              downloadUrl: `/api/certificates/download?eventId=${event.eventId}&userId=${attendee.userId}`
            }
          })

          

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

          // Send email
          await addEmailJob({
            type: "CERTIFICATE",
            email: attendee.email,
            name: attendee.name,
            eventName: event.name,
            certificateLink: certificate.downloadUrl
          })

          results.created++
          results.details.push({
            userId: attendee.userId,
            name: attendee.name,
            email: attendee.email,
            result: "created"
          })
        }
      } catch (error) {
        

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
    

    return NextResponse.json({
      success: true,
      message: `Certificates processed: ${results.created} created, ${results.updated} reissued, ${results.skipped} skipped, ${results.errors} errors.`,
      results
    })

  } catch (error) {
    
    return NextResponse.json({
      error: "Failed to process certificates",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
