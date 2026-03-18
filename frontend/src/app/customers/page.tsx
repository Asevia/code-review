"use client";

import { useEffect, useState } from "react";
import { CustomerDrawer } from "../../components/CustomerDrawer";
import { CustomersTable } from "../../components/CustomersTable";
import { useCustomers } from "../../hooks/useCustomers";
import { updateCustomerNote } from "../../lib/api";
import type { CustomerRow, CustomerSort } from "../../types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CustomerSort>("updatedAt");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null,
  );

  const { customers, loading, error, refresh } = useCustomers({
    search,
    sort,
    page: 1,
  });

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    const freshCustomer = customers.find(
      (customer) => customer.id === selectedCustomer.id,
    );

    if (freshCustomer) {
      setSelectedCustomer(freshCustomer);
    }
  }, [customers, selectedCustomer]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">
            Revenue Ops
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Customer Health</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Review customer accounts powered by curated revenue and billing
            data.
          </p>
        </div>

        <button
          className="rounded-md border border-white/20 px-4 py-2 text-sm"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Search
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company or notes"
            value={search}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Sort
          <select
            className="rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setSort(event.target.value as CustomerSort)}
            value={sort}
          >
            <option value="updatedAt">Recently updated</option>
            <option value="mrr">Highest MRR</option>
            <option value="company">Company</option>
          </select>
        </label>
      </section>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading customers...</p> : null}

      <CustomersTable
        customers={customers}
        onQuickNoteSave={async (customerId, notes) => {
          await updateCustomerNote(customerId, notes);
          await refresh();
        }}
        onSelect={(customer) => setSelectedCustomer(customer)}
        search={search}
      />

      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSaved={refresh}
        open={Boolean(selectedCustomer)}
      />
    </main>
  );
}
