import { Worker } from "bullmq";
import { connection, EmailJobData } from "./app/lib/queue";
import { sendEmail } from "./app/lib/email";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

console.log("👷 Starting BullMQ Worker...");

const worker = new Worker<EmailJobData>(
  "emailQueue",
  async (job) => {
    const data = job.data;
    console.log(`⏳ Processing job ${job.id} of type ${data.type}`);

    try {
      switch (data.type) {
        case "CERTIFICATE":
          await sendEmail(
            data.email,
            `Your Certificate for ${data.eventName}`,
            `<p>Hi ${data.name},</p>
             <p>Your certificate for the event <strong>${data.eventName}</strong> has been issued.</p>
             <p>You can download it <a href="${process.env.NEXTAUTH_URL}${data.certificateLink}">here</a>.</p>`
          );
          break;

        case "EVENT_CREATED":
          await sendEmail(
            data.email,
            `Event Created: ${data.eventName}`,
            `<p>Hi ${data.name},</p>
             <p>You have successfully created the event <strong>${data.eventName}</strong>.</p>
             <p>It is scheduled for: ${data.eventDate}.</p>`
          );
          break;

        case "EVENT_JOINED":
          await sendEmail(
            data.email,
            `Event Joined: ${data.eventName}`,
            `<p>Hi ${data.name},</p>
             <p>You have successfully joined the event <strong>${data.eventName}</strong>.</p>
             <p>It is scheduled for: ${data.eventDate}.</p>`
          );
          break;

        case "EVENT_REMINDER":
          await sendEmail(
            data.email,
            `Reminder: ${data.eventName} is starting soon!`,
            `<p>Hi ${data.name},</p>
             <p>This is a reminder that the event <strong>${data.eventName}</strong> is starting in 2 minutes!</p>
             <p><a href="${process.env.NEXTAUTH_URL}${data.eventLink}">Click here to join</a></p>`
          );
          break;

        default:
          console.warn(`Unknown job type received: ${(data as any).type}`);
      }
      console.log(`✅ Job ${job.id} processed successfully`);
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection,
  }
);

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});
