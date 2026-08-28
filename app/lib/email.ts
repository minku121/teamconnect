import nodemailer from "nodemailer";

// Retrieve configuration from environment variables
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

/**
 * Send an email using the configured transporter.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!gmailUser || !gmailPass) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set. Logging email instead:");
    console.log(`To: ${to}\nSubject: ${subject}\nBody: ${html}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"EventConnect" <${gmailUser}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    throw error;
  }
}
