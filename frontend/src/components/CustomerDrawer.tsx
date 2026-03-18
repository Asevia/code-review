"use client";

import { useState } from "react";
import { updateCustomerNote } from "../lib/api";
import type { CustomerRow } from "../types";

type CustomerDrawerProps = {
  customer: CustomerRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export function CustomerDrawer({
  customer,
  open,
  onClose,
  onSaved,
}: CustomerDrawerProps) {
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [saving, setSaving] = useState(false);

  if (!open || !customer) {
    return null;
  }

  async function handleSave() {
    setSaving(true);
    await updateCustomerNote(customer.id, notes);
    await onSaved();
    setSaving(false);
    onClose();
  }

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Customer</p>
          <h2 className="text-xl font-semibold text-slate-900">
            {customer.company}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{customer.owner}</p>
        </div>
        <button className="text-slate-500" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            Last contact: <strong>{customer.lastContactAt}</strong>
          </p>
          <p>
            Last update: <strong>{customer.updatedAt}</strong>
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Internal notes
          <textarea
            className="min-h-40 rounded-lg border border-slate-200 p-3 text-sm"
            defaultValue={customer.notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            className="rounded-md border border-slate-200 px-4 py-2 text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-white"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </aside>
  );
}
