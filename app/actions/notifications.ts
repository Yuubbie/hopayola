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

function hopayolaEmailHtml(heading: string, innerHtml: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAF8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8E5DE;">
          <tr>
            <td style="background:#2E1B4D;padding:28px 32px;text-align:center;">
              <img src="https://hopayola.com/images/logo.png" alt="Hopayola" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:8px;" />
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#FAFAF8;letter-spacing:0.12em;text-transform:uppercase;">Hopayola</p>
            </td>
          </tr>
          <tr>
            <td style="height:6px;background:#5B2A86;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#0A0A0A;font-size:15px;line-height:1.6;">
              <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#2E1B4D;font-weight:normal;">${heading}</h1>
              ${innerHtml}
              <p style="margin:28px 0 0;color:#5B2A86;font-size:14px;">The Hopayola Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#2E1B4D;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#D8C2F0;">
                support@hopayola.com · WhatsApp +234 702 688 8665
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendUserMail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const resend = mail();
  if (!resend || !to) return false;
  const froms = [
    "Hopayola <noreply@hopayola.com>",
    "Hopayola <notifications@mail.hopayola.com>",
  ];
  for (const from of froms) {
    try {
      const { error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });
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
The Hopayola Team`,
    hopayolaEmailHtml(
      `Welcome, ${n}`,
      `<p>Hi ${n},</p>
<p>Welcome to Hopayola. We partner with Nigerian artisans to deliver exceptional custom wear.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">Complete your profile</p>
<p>Finish your profile, upload a valid ID, and add your details so you can claim client projects.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">Handle projects with care</p>
<p>Treat every job professionally so quality stays high and reviews stay strong.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">Use the chatroom</p>
<p>Always use the Hopayola chatroom to get client consent before changing styles or measurements.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">Hopayola boxes</p>
<p>Branded Hopayola packaging will be provided for premium client deliveries.</p>
<p>Need help? <a href="mailto:support@hopayola.com" style="color:#5B2A86;">support@hopayola.com</a> or WhatsApp +234 702 688 8665.</p>`
    )
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
The Hopayola Team`,
    hopayolaEmailHtml(
      `You are verified, ${n}`,
      `<p>Hi ${n},</p>
<p>Great news. Your profile and credentials have been reviewed and verified.</p>
<p>You can now claim and accept client tailoring projects on Hopayola.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">What is next</p>
<p>Watch your dashboard for incoming client requests.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">A quick reminder</p>
<p>Keep craftsmanship high, treat every project with care, and use the chatroom to confirm updates and measurements with clients.</p>
<p>Welcome aboard. Let's grow together.</p>`
    )
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
The Hopayola Team`,
    hopayolaEmailHtml(
      `How do you love your new look, ${n}?`,
      `<p>Hi ${n},</p>
<p>Your first Hopayola project is complete. We hope the outfit fits like a glove.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">Care</p>
<p>Dry clean or hand wash embellished or delicate fabrics. Store in a cool, dry place.</p>
<p style="margin:20px 0 8px;color:#5B2A86;font-weight:bold;">10% off your next order</p>
<p>Use code <strong style="color:#5B2A86;">HOPAYOLAN23</strong> on your next piece.</p>
<p>Whenever you have your next event or asoebi fabric ready, we will bring it to life.</p>`
    )
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
