"use server";

import { createClient } from "@/lib/supabase/server";

const PAYSTACK_BASE = "https://api.paystack.co";

function paystackHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function getNigerianBanks() {
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
  const res = await fetch(
    `${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: paystackHeaders() }
  );

  const json = await res.json();

  if (!json.status) {
    throw new Error(json.message || "Could not verify this account. Check the details and try again.");
  }

  return {
    accountName: json.data.account_name as string,
    accountNumber: json.data.account_number as string,
  };
}

export async function saveArtisanBankDetails(
  artisanId: string,
  accountNumber: string,
  bankCode: string,
  bankName: string,
  accountName: string
) {
  const recipientRes = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const recipientJson = await recipientRes.json();

  if (!recipientJson.status) {
    throw new Error(recipientJson.message || "Could not register this bank account with Paystack.");
  }

  const recipientCode = recipientJson.data.recipient_code as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("artisan_profiles")
    .update({
      bank_account_number: accountNumber,
      bank_code: bankCode,
      bank_account_name: accountName,
      paystack_recipient_code: recipientCode,
    })
    .eq("id", artisanId);

  if (error) {
    throw new Error(`Bank details verified but could not save: ${error.message}`);
  }

  return { success: true, recipientCode };
}