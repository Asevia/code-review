"use client";

import type { CustomerRow } from "../types";

type CustomersTableProps = {
  customers: CustomerRow[];
  search: string;
  onSelect: (customer: CustomerRow) => void;
  onQuickNoteSave: (customerId: string, notes: string) => Promise<void>;
};

export function CustomersTable({
  customers,
  search,
  onSelect,
  onQuickNoteSave,
}: CustomersTableProps) {
  const visibleCustomers = customers
    .sort((left, right) => right.mrr - left.mrr)
    .filter((customer) =>
      customer.company.toLowerCase().includes(search.toLowerCase()),
    );

  function renderNotes(notes: string) {
    if (!search) {
      return { __html: notes };
    }

    return {
      __html: notes.replaceAll(search, `<mark>${search}</mark>`),
    };
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">MRR</th>
            <th className="px-4 py-3">Health</th>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleCustomers.map((customer, index) => (
            <tr
              key={index}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onSelect(customer)}
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                {customer.company}
              </td>
              <td className="px-4 py-3 text-slate-600">{customer.owner}</td>
              <td className="px-4 py-3 text-slate-600">
                ${customer.mrr.toLocaleString()}
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">
                {customer.health}
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">
                {customer.invoiceStatus}
              </td>
              <td
                className="max-w-sm px-4 py-3 text-slate-600"
                dangerouslySetInnerHTML={renderNotes(customer.notes)}
              />
              <td className="px-4 py-3">
                <button
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700"
                  onClick={() =>
                    onQuickNoteSave(customer.id, "Needs follow-up this week")
                  }
                >
                  Quick note
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
