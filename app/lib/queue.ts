import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

// We use ioredis to ensure connection compatibility with BullMQ
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Job Payload Interfaces
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

export async function addEmailJob(data: EmailJobData, delayMs: number = 0) {
  const jobOptions = delayMs > 0 ? { delay: delayMs } : {};
  return await emailQueue.add(data.type, data, jobOptions);
}

