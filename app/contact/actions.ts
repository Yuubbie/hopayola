"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitInquiry(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const supabase = await createClient();

  await supabase.from("contact_inquiries").insert({
    full_name: fullName,
    email,
    phone: phone || null,
    role,
    subject,
    message,
  });

  try {
    await resend.emails.send({
      from: "Hopayola Contact Form <notifications@mail.hopayola.com>",
      to: "hopeayoolaoluwa@gmail.com",
      replyTo: email,
      subject: `New inquiry: ${subject}`,
      text: `From: ${fullName} (${email})
Phone: ${phone || "Not provided"}
Role: ${role}

${message}`,
    });
  } catch (err) {
    console.error("Failed to send email notification:", err);
  }
}