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

function fromHopayola() {
  return "Hopayola <noreply@hopayola.com>";
}

export async function emailArtisanWelcome(name: string, to: string) {
  const resend = mail();
  if (!resend || !to) return;
  const n = name.trim() || "there";
  try {
    await resend.emails.send({
      from: fromHopayola(),
      to,
      subject: `Welcome to Hopayola, ${n}! The Fashion Network and Coordinator for your business.`,
      text: `Hi ${n},

Welcome to Hopayola! We are excited to partner with top-tier Nigerian artisans to deliver exceptional custom wear.

To help you succeed on the platform, keep these core guidelines in mind:

Complete Your Profile: Finish setting up your profile, upload your valid ID, and add your details so you can start claiming client projects smoothly.

Handle Projects with Care: Treat every job professionally to ensure top-notch quality and avoid negative reviews.

Communicate via the Chatroom: Always use the Hopayola chatroom to get client consent before making any changes to styles or measurements.

Hopayola Boxes: Note that branded Hopayola packaging boxes will be provided for premium client deliveries to elevate the presentation of your work.

Need help? Reach out to support at support@hopayola.com or WhatsApp +234 702 688 8665.

Best regards,
The Hopayola Team`,
    });
  } catch (err) {
    console.error("Failed artisan welcome email:", err);
  }
}

export async function emailArtisanVerified(name: string, to: string) {
  const resend = mail();
  if (!resend || !to) return;
  const n = name.trim() || "there";
  try {
    await resend.emails.send({
      from: fromHopayola(),
      to,
      subject: `Congratulations, ${n}! You are now verified on Hopayola`,
      text: `Hi ${n},

Great news! Your profile and credentials have been successfully reviewed and verified.

You are now fully set up to start claiming and accepting client tailoring projects on Hopayola.

What's Next? Keep your eye on your dashboard for incoming client requests.

A Quick Reminder: Always maintain high-quality craftsmanship, treat every project with care, and use the built-in chatroom to confirm updates and measurements directly with clients.

Welcome aboard, and let's grow together!

Best regards,
The Hopayola Team`,
    });
  } catch (err) {
    console.error("Failed artisan verified email:", err);
  }
}

export async function emailClientFirstComplete(name: string, to: string) {
  const resend = mail();
  if (!resend || !to) return;
  const n = name.trim() || "there";
  try {
    await resend.emails.send({
      from: fromHopayola(),
      to,
      subject: `How do you love your new look, ${n}?`,
      text: `Hi ${n},

Your very first Hopayola project is officially complete, and we hope your new custom outfit fits you like a glove!

To keep your fabric looking fresh:

Care gently for your piece (dry cleaning or hand washing is recommended for embellished or delicate fabrics).

Store it properly in a cool, dry place.

Because you trusted us with your first piece, we want to make your next style journey even sweeter. Here is 10% off your next order using the code: HOPAYOLAN23.

Whenever you have your next event or asoebi fabric ready, we'll be right here to bring it to life.

Warmly,
The Hopayola Team`,
    });
  } catch (err) {
    console.error("Failed first complete email:", err);
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
