"use server";

export async function submitInquiry(formData: FormData) {
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const role = formData.get("role");
  const subject = formData.get("subject");
  const message = formData.get("message");

  // Placeholder: inquiries are not yet stored or emailed anywhere.
  // Once Hope confirms where these should go (Supabase table, email, etc.)
  // this function will be updated to actually save/send the inquiry.
  console.log("Contact inquiry received (not yet persisted):", {
    fullName,
    email,
    phone,
    role,
    subject,
    message,
  });
}