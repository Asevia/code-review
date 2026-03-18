"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "../lib/api";
import type { CustomerFilters, CustomerRow } from "../types";

export function useCustomers(filters: CustomerFilters) {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    setError(null);

    try {
      const response = await getCustomers(filters);
      setCustomers(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  return {
    customers,
    loading,
    error,
    refresh: loadCustomers,
  };
}
