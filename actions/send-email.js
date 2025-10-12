

import { Resend } from "resend";
console.log("send-email module loaded");

export async function sendEmailImpl({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  return await resend.emails.send({
    from: "Finance App <onboarding@resend.dev>",
    to,
    subject,
    react,
  });
}

// Optional wrapper that returns a uniform { success, data } payload and can be used as a server action elsewhere
export async function sendEmail({ to, subject, react }) {
  try {
    const data = await sendEmailImpl({ to, subject, react });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// default export for convenience
export default sendEmail;

