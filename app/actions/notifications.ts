"use server";

import { Resend } from "resend";

function mail() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function notifyWaitlistSignup(email: string, interest: string) {
  const resend = mail();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Hopayola Waitlist <notifications@mail.hopayola.com>",
      to: "hopeayoolaoluwa@gmail.com",
      subject: "New waitlist signup",
      text: `New waitlist signup:

Email: ${email}
Interest: ${interest}`,
    });
  } catch (err) {
    console.error("Failed to send waitlist notification:", err);
  }
}

export async function notifySignup(
  fullName: string,
  email: string,
  accountType: "client" | "artisan"
) {
  const resend = mail();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Hopayola Sign-ups <notifications@mail.hopayola.com>",
      to: "hopeayoolaoluwa@gmail.com",
      subject: `New ${accountType} sign-up`,
      text: `New ${accountType} account created:

Name: ${fullName}
Email: ${email}`,
    });
  } catch (err) {
    console.error("Failed to send sign-up notification:", err);
  }
}

export async function notifyProjectSubmission(
  clientName: string,
  clientEmail: string,
  garmentType: string,
  occasion: string
) {
  const resend = mail();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Hopayola Projects <notifications@mail.hopayola.com>",
      to: "hopeayoolaoluwa@gmail.com",
      subject: "New project submission",
      text: `New project submitted:

Client: ${clientName} (${clientEmail})
Garment: ${garmentType || "Not specified"}
Occasion: ${occasion || "Not specified"}`,
    });
  } catch (err) {
    console.error("Failed to send project submission notification:", err);
  }
}
