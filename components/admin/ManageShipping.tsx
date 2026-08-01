"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateAll } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/formatCurrency";

type Rate = {
  id: string;
  country: string;
  province: string | null;
  cost: number;
};

export function ManageShipping({ initial }: { initial: Rate[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [rates, setRates] = useState<Rate[]>(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Rate | null>(null);
  const [country, setCountry] = useState("Pakistan");
  const [province, setProvince] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    await revalidateAll();
    router.refresh();
  }

  function openCreate() {
    setEditing(null);
    setCountry("Pakistan");
    setProvince("");
    setCost("");
    setError(null);
    setFormOpen(true);
  }

  function openEdit(rate: Rate) {
    setEditing(rate);
    setCountry(rate.country);
    setProvince(rate.province ?? "");
    setCost(String(rate.cost));
    setError(null);
    setFormOpen(true);
  }

  async function save() {
    const parsedCost = Number(cost);
    if (!Number.isInteger(parsedCost) || parsedCost < 0) {
      setError("Cost must be a whole number of rupees.");
      return;
    }
    setBusy(true);
    setError(null);

    const payload = {
      country: country.trim(),
      province: province.trim() || null,
      cost: parsedCost,
    };

    if (editing) {
      const { error: updateError } = await supabase
        .from("shipping_rates")
        .update(payload)
        .eq("id", editing.id);
      if (updateError) {
        setError(updateError.message);
        setBusy(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("shipping_rates")
        .insert(payload);
      if (insertError) {
        setError(insertError.message);
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    setFormOpen(false);
    await refresh();
  }

  async function remove(rate: Rate) {
    const { error } = await supabase
      .from("shipping_rates")
      .delete()
      .eq("id", rate.id);
    if (!error) {
      setRates((current) => current.filter((r) => r.id !== rate.id));
      await refresh();
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-black">
          Shipping Rates
        </h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      {rates.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No shipping rates yet — checkout shows &ldquo;contact us&rdquo; for
          uncovered locations.
        </p>
      ) : (
        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="py-2.5 font-medium">Country</th>
              <th className="py-2.5 font-medium">Province</th>
              <th className="py-2.5 font-medium">Cost</th>
              <th className="py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rates.map((rate) => (
              <tr key={rate.id}>
                <td className="py-3 text-black">{rate.country}</td>
                <td className="py-3 text-gray-600">{rate.province ?? "All provinces"}</td>
                <td className="py-3 font-medium text-black">
                  {formatCurrency(rate.cost)}
                </td>
                <td className="py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(rate)}
                      className="p-1.5 text-sm text-gray-500 transition-colors hover:text-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void remove(rate)}
                      aria-label={`Delete rate for ${rate.country}${rate.province ? ` ${rate.province}` : ""}`}
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
        title={editing ? "Edit Shipping Rate" : "Add Shipping Rate"}
      >
        <div className="space-y-4">
          <Input
            label="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Pakistan"
          />
          <Input
            label="Province (leave empty for country default)"
            value={province}
            onChange={(event) => setProvince(event.target.value)}
            placeholder="e.g. Punjab"
          />
          <Input
            label="Cost (Rs.)"
            type="number"
            min={0}
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="e.g. 250"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
