"use client";

import { useEffect, useState } from "react";
import {
  getNigerianBanks,
  resolveBankAccount,
  saveArtisanBankDetails,
} from "@/app/actions/paystack-banking";

type Bank = { name: string; code: string };

type Props = {
  artisanId: string;
  initialBankCode: string | null;
  initialAccountNumber: string | null;
  initialAccountName: string | null;
};

export default function ArtisanBankDetailsForm({
  artisanId,
  initialBankCode,
  initialAccountNumber,
  initialAccountName,
}: Props) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankCode, setBankCode] = useState(initialBankCode || "");
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber || "");
  const [verifiedName, setVerifiedName] = useState(initialAccountName || "");

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getNigerianBanks()
      .then(setBanks)
      .catch(() => setError("Could not load bank list. Please refresh and try again."))
      .finally(() => setBanksLoading(false));
  }, []);

  function handleAccountOrBankChange() {
    setVerifiedName("");
    setSaved(false);
    setError(null);
  }

  async function handleVerify() {
    setError(null);
    if (!bankCode || accountNumber.length !== 10) {
      setError("Select a bank and enter a valid 10-digit account number.");
      return;
    }

    setVerifying(true);
    try {
      const result = await resolveBankAccount(accountNumber, bankCode);
      setVerifiedName(result.accountName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify this account.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const bank = banks.find((b) => b.code === bankCode);
      await saveArtisanBankDetails(
        artisanId,
        accountNumber,
        bankCode,
        bank?.name || "",
        verifiedName
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-stone rounded-2xl p-6">
      <h2 className="font-display text-lg mb-2">Payout details</h2>
      <p className="text-ink/50 text-sm mb-4">
        This is where Hopayola will send your milestone payouts. We verify
        the account name with your bank before saving.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="bank">
            Bank
          </label>
          <select
            id="bank"
            value={bankCode}
            onChange={(e) => {
              setBankCode(e.target.value);
              handleAccountOrBankChange();
            }}
            disabled={banksLoading}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm bg-paper"
          >
            <option value="" disabled>
              {banksLoading ? "Loading banks..." : "Select your bank"}
            </option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="account-number">
            Account number
          </label>
          <input
            id="account-number"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, ""));
              handleAccountOrBankChange();
            }}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            placeholder="10-digit account number"
          />
        </div>

        {!verifiedName ? (
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || !bankCode || accountNumber.length !== 10}
            className="border border-royal text-royal rounded-lg px-4 py-2 text-sm hover:bg-royal/5 transition-colors disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "Verify account"}
          </button>
        ) : (
          <div className="bg-royal/5 border border-royal/20 rounded-lg px-4 py-3 text-sm">
            <span className="text-ink/50">Account name: </span>
            <span className="font-medium">{verifiedName}</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-sm text-green-700 border border-green-200 bg-green-50 rounded-lg px-4 py-3">
            Payout details saved.
          </p>
        )}

        {verifiedName && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-royal text-paper rounded-lg py-3 text-sm font-medium hover:bg-royal-deep transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save payout details"}
          </button>
        )}
      </div>
    </section>
  );
}