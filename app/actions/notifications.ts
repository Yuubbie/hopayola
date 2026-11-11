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

async function sendUserMail(to: string, subject: string, text: string) {
  const resend = mail();
  if (!resend || !to) return false;
  const froms = [
    "Hopayola <noreply@hopayola.com>",
    "Hopayola <notifications@mail.hopayola.com>",
  ];
  for (const from of froms) {
    try {
      const { error } = await resend.emails.send({ from, to, subject, text });
      if (!error) return true;
      console.error("Resend from failed", from, error);
    } catch (err) {
      console.error("Resend from failed", from, err);
    }
  }
  return false;
}

export async function emailArtisanWelcome(name: string, to: string) {
  const n = name.trim() || "there";
  await sendUserMail(
    to,
    `Welcome to Hopayola, ${n}! The Fashion Network and Coordinator for your business.`,
    `Hi ${n},

Welcome to Hopayola! We are excited to partner with top-tier Nigerian artisans to deliver exceptional custom wear.

To help you succeed on the platform, keep these core guidelines in mind:

Complete Your Profile: Finish setting up your profile, upload your valid ID, and add your details so you can start claiming client projects smoothly.

Handle Projects with Care: Treat every job professionally to ensure top-notch quality and avoid negative reviews.

Communicate via the Chatroom: Always use the Hopayola chatroom to get client consent before making any changes to styles or measurements.

Hopayola Boxes: Note that branded Hopayola packaging boxes will be provided for premium client deliveries to elevate the presentation of your work.

Need help? Reach out to support at support@hopayola.com or WhatsApp +234 702 688 8665.

Best regards,
The Hopayola Team`
  );
}

export async function sendArtisanWelcomeOnce(
  artisanId: string,
  name: string,
  to: string
) {
  if (!artisanId || !to) return;
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  const { data: row } = await service
    .from("artisan_profiles")
    .select("welcome_email_sent_at")
    .eq("id", artisanId)
    .maybeSingle();
  if (row?.welcome_email_sent_at) return;
  await emailArtisanWelcome(name, to);
  await service
    .from("artisan_profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", artisanId);
}

export async function emailArtisanVerified(name: string, to: string) {
  const n = name.trim() || "there";
  await sendUserMail(
    to,
    `Congratulations, ${n}! You are now verified on Hopayola`,
    `Hi ${n},

Great news! Your profile and credentials have been successfully reviewed and verified.

You are now fully set up to start claiming and accepting client tailoring projects on Hopayola.

What's Next? Keep your eye on your dashboard for incoming client requests.

A Quick Reminder: Always maintain high-quality craftsmanship, treat every project with care, and use the built-in chatroom to confirm updates and measurements directly with clients.

Welcome aboard, and let's grow together!

Best regards,
The Hopayola Team`
  );
}

export async function emailClientFirstComplete(name: string, to: string) {
  const n = name.trim() || "there";
  await sendUserMail(
    to,
    `How do you love your new look, ${n}?`,
    `Hi ${n},

Your very first Hopayola project is officially complete, and we hope your new custom outfit fits you like a glove!

To keep your fabric looking fresh:

Care gently for your piece (dry cleaning or hand washing is recommended for embellished or delicate fabrics).

Store it properly in a cool, dry place.

Because you trusted us with your first piece, we want to make your next style journey even sweeter. Here is 10% off your next order using the code: HOPAYOLAN23.

Whenever you have your next event or asoebi fabric ready, we'll be right here to bring it to life.

Warmly,
The Hopayola Team`
  );
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
