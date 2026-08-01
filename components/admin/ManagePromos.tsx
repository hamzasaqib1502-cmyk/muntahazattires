"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateAll } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type Promo = {
  code: string;
  type: "percent" | "flat";
  value: number;
  active: boolean;
};

export function ManagePromos({ initial }: { initial: Promo[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [promos, setPromos] = useState<Promo[]>(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    await revalidateAll();
    router.refresh();
  }

  async function save() {
    const parsedValue = Number(value);
    if (!code.trim()) {
      setError("Code is required.");
      return;
    }
    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
      setError("Value must be a whole number.");
      return;
    }
    setBusy(true);
    setError(null);

    const { error: insertError } = await supabase.from("promo_codes").insert({
      code: code.trim().toUpperCase(),
      type,
      value: parsedValue,
      active: true,
    });

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    setFormOpen(false);
    await refresh();
  }

  async function toggleActive(promo: Promo) {
    setPromos((current) =>
      current.map((p) =>
        p.code === promo.code ? { ...p, active: !p.active } : p,
      ),
    );
    const { error } = await supabase
      .from("promo_codes")
      .update({ active: !promo.active })
      .eq("code", promo.code);
    if (error) {
      setPromos((current) =>
        current.map((p) => (p.code === promo.code ? { ...p, active: promo.active } : p)),
      );
    }
    await refresh();
  }

  async function remove(promo: Promo) {
    const { error } = await supabase
      .from("promo_codes")
      .delete()
      .eq("code", promo.code);
    if (!error) {
      setPromos((current) => current.filter((p) => p.code !== promo.code));
      await refresh();
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-black">
          Promo Codes
        </h2>
        <Button
          onClick={() => {
            setCode("");
            setType("percent");
            setValue("");
            setError(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Promo
        </Button>
      </div>

      {promos.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No promo codes yet.
        </p>
      ) : (
        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="py-2.5 font-medium">Code</th>
              <th className="py-2.5 font-medium">Type</th>
              <th className="py-2.5 font-medium">Value</th>
              <th className="py-2.5 font-medium">Active</th>
              <th className="py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promos.map((promo) => (
              <tr key={promo.code}>
                <td className="py-3 font-medium uppercase text-black">
                  {promo.code}
                </td>
                <td className="py-3 text-gray-600">{promo.type}</td>
                <td className="py-3 text-gray-600">
                  {promo.type === "percent" ? `${promo.value}%` : `Rs. ${promo.value}`}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => void toggleActive(promo)}
                    aria-label={`${promo.active ? "Deactivate" : "Activate"} ${promo.code}`}
                    className="flex items-center gap-2 text-gray-700 transition-colors hover:text-black"
                  >
                    <span
                      className={`relative h-5 w-9 border ${
                        promo.active ? "border-black bg-black" : "border-gray-300 bg-gray-100"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-3.5 w-3.5 bg-white transition-all ${
                          promo.active ? "left-4" : "left-0.5"
                        }`}
                      />
                    </span>
                    {promo.active ? "On" : "Off"}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => void remove(promo)}
                      aria-label={`Delete ${promo.code}`}
                      className="p-1.5 text-gray-500 transition-colors hover:text-black"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Promo Code"
      >
        <div className="space-y-4">
          <Input
            label="Code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="WELCOME10"
          />
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Type
              </span>
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "percent" | "flat")
                }
                className="border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat (Rs.)</option>
              </select>
            </label>
            <Input
              label={type === "percent" ? "Value (%)" : "Value (Rs.)"}
              type="number"
              min={0}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={type === "percent" ? "10" : "500"}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
