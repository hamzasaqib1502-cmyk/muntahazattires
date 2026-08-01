"use client";

import type { Address } from "@/lib/types";

const PROVINCES: Record<string, string[]> = {
  Pakistan: [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Islamabad Capital Territory",
  ],
};

export function AddressForm({
  value,
  onChange,
  savedAddresses,
  onPickSaved,
}: {
  value: Address;
  onChange: (address: Address) => void;
  savedAddresses?: Address[];
  onPickSaved?: (address: Address) => void;
}) {
  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";
  const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500";

  const provinces = PROVINCES[value.country] ?? [];

  return (
    <div className="space-y-4">
      {savedAddresses && savedAddresses.length > 0 && onPickSaved && (
        <div>
          <p className={labelClass}>Saved Addresses</p>
          <ul className="space-y-2">
            {savedAddresses.map((address, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onPickSaved(address)}
                  className="w-full border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-black"
                >
                  {address.line1} — {address.city}, {address.province},{" "}
                  {address.country}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="block">
        <span className={labelClass}>Address Line</span>
        <input
          value={value.line1}
          onChange={(event) => onChange({ ...value, line1: event.target.value })}
          placeholder="House, street, area"
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Country</span>
          <select
            value={value.country}
            onChange={(event) =>
              onChange({
                ...value,
                country: event.target.value,
                province: "",
              })
            }
            className={inputClass}
          >
            <option value="">Select country</option>
            <option value="Pakistan">Pakistan</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Province / State</span>
          {provinces.length > 0 ? (
            <select
              value={value.province}
              onChange={(event) =>
                onChange({ ...value, province: event.target.value })
              }
              className={inputClass}
            >
              <option value="">Select province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={value.province}
              onChange={(event) =>
                onChange({ ...value, province: event.target.value })
              }
              placeholder="Province / state"
              className={inputClass}
            />
          )}
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>City</span>
        <input
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          placeholder="City"
          className={inputClass}
        />
      </label>
    </div>
  );
}
