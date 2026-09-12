"use client";

import { useState } from "react";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  label?: string;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  required,
  minLength,
  label = "Password",
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-stone rounded-lg px-4 py-2.5 pr-12 focus:border-royal outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18" />
              <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
              <path d="M9.88 4.24A9.94 9.94 0 0 1 12 4c5 0 9.27 3.11 11 7.5a11.7 11.7 0 0 1-2.42 3.68M6.61 6.61A11.7 11.7 0 0 0 1 11.5C2.73 15.89 7 19 12 19a9.9 9.9 0 0 0 4.24-.94" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 11.5C2.73 7.11 7 4 12 4s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 15.89 1 11.5z" />
              <circle cx="12" cy="11.5" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}