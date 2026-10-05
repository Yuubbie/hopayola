"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { scanChatMessage } from "@/lib/chat-guard";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendHelpEnquiry(input: {
  name: string;
  email: string;
  message: string;
}) {
  const name = (input.name || "").trim();
  const email = (input.email || "").trim();
  const message = (input.message || "").trim();
  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }

  const scan = scanChatMessage(message);
  const body = scan.blocked
    ? `${message}\n\n[Flagged: visitor may have tried to share a private contact.]`
    : message;

  const supabase = await createClient();
  await supabase.from("contact_inquiries").insert({
    full_name: name,
    email,
    phone: null,
    role: "homepage_help",
    subject: "Homepage help chat",
    message: body,
  });

  try {
    await resend.emails.send({
      from: "Hopayola Help <notifications@mail.hopayola.com>",
      to: "hopeayoolaoluwa@gmail.com",
      replyTo: email,
      subject: "Homepage help chat",
      text: `From: ${name} (${email})\n\n${body}`,
    });
  } catch {
    // still saved in contact_inquiries
  }

  return { error: null };
}
