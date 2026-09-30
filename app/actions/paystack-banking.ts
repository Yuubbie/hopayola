"use server";

import { createClient } from "@/lib/supabase/server";

const PAYSTACK_BASE = "https://api.paystack.co";

function paystackHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

async function requireArtisan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artisan" && profile?.role !== "admin") {
    throw new Error("Not authorized.");
  }
  return { supabase, user };
}

export async function getNigerianBanks() {
  await requireArtisan();
  const res = await fetch(`${PAYSTACK_BASE}/bank?country=nigeria&currency=NGN`, {
    headers: paystackHeaders(),
  });

  const json = await res.json();

  if (!json.status) {
    throw new Error(json.message || "Could not fetch bank list.");
  }

  return (json.data as { name: string; code: string }[])
    .map((bank) => ({ name: bank.name, code: bank.code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveBankAccount(accountNumber: string, bankCode: string) {
  await requireArtisan();
  const digits = accountNumber.replace(/\D/g, "");
  const code = bankCode.replace(/\D/g, "");
  if (digits.length !== 10 || !code) {
    throw new Error("Select a bank and enter a valid 10-digit account number.");
  }

  const res = await fetch(
    `${PAYSTACK_BASE}/bank/resolve?account_number=${encodeURIComponent(digits)}&bank_code=${encodeURIComponent(code)}`,
    { headers: paystackHeaders() }
  );

  const json = await res.json();

  if (!json.status) {
    throw new Error(
      json.message || "Could not verify this account. Check the details and try again."
    );
  }

  return {
    accountName: json.data.account_name as string,
    accountNumber: json.data.account_number as string,
  };
}

export async function saveArtisanBankDetails(
  _artisanId: string,
  accountNumber: string,
  bankCode: string,
  _bankName: string,
  accountName: string
) {
  const { supabase, user } = await requireArtisan();
  const digits = accountNumber.replace(/\D/g, "");
  const code = bankCode.replace(/\D/g, "");
  if (digits.length !== 10 || !code || !accountName.trim()) {
    throw new Error("Invalid bank details.");
  }

  const recipientRes = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name: accountName.trim(),
      account_number: digits,
      bank_code: code,
      currency: "NGN",
    }),
  });

  const recipientJson = await recipientRes.json();

  if (!recipientJson.status) {
    throw new Error(
      recipientJson.message || "Could not register this bank account with Paystack."
    );
  }

  const recipientCode = recipientJson.data.recipient_code as string;

  const { error } = await supabase
    .from("artisan_profiles")
    .update({
      bank_account_number: digits,
      bank_code: code,
      bank_account_name: accountName.trim(),
      paystack_recipient_code: recipientCode,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Bank details verified but could not save: ${error.message}`);
  }

  return { success: true, recipientCode };
}
