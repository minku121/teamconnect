import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import nodemailer from "nodemailer";

const redisUrl = process.env.REDIS_URL;
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

// 1. Redis Connection
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// 2. Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  if (!gmailUser || !gmailPass) {
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"EventConnect" <${gmailUser}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    throw error;
  }
}

// 3. Types
export interface CertificateEmailData {
  type: "CERTIFICATE";
  email: string;
  name: string;
  eventName: string;
  certificateLink: string;
}
export interface EventCreatedEmailData {
  type: "EVENT_CREATED";
  email: string;
  name: string;
  eventName: string;
  eventDate: string;
}
export interface EventJoinedEmailData {
  type: "EVENT_JOINED";
  email: string;
  name: string;
  eventName: string;
  eventDate: string;
}
export interface EventReminderEmailData {
  type: "EVENT_REMINDER";
  email: string;
  name: string;
  eventName: string;
  eventLink: string;
}

export type EmailJobData =
  | CertificateEmailData
  | EventCreatedEmailData
  | EventJoinedEmailData
  | EventReminderEmailData;

// 4. Worker Setup

const worker = new Worker<EmailJobData>(
  "emailQueue",
  async (job) => {
    const data = job.data;

    try {
      const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      switch (data.type) {
        case "CERTIFICATE":
          await sendEmail(
            data.email,
            `Your Certificate for ${data.eventName}`,
            `<p>Hi ${data.name},</p>
             <p>Your certificate for the event <strong>${data.eventName}</strong> has been issued.</p>
             <p>You can download it <a href="${nextAuthUrl}${data.certificateLink}">here</a>.</p>`
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
             <p><a href="${nextAuthUrl}${data.eventLink}">Click here to join</a></p>`
          );
          break;

        default:
      }
    } catch (error) {
      throw error;
    }
  },
  {
    connection,
  }
);

worker.on("error", (err) => {
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
