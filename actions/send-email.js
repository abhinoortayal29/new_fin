"use server";

import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing");
  }
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is missing");
  }

  try {
    const htmlContent = await render(react);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "Finance App", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API error:", data);
      throw new Error(`Brevo failed: ${data.message || "Unknown error"}`);
    }

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    // Re-throw so Inngest marks the step as failed (unchanged behavior)
    throw error;
  }
}

export default sendEmail;