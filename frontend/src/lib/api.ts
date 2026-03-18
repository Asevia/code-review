import type { CustomerFilters, CustomersResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getCustomers(
  filters: CustomerFilters,
): Promise<CustomersResponse> {
  const query = new URLSearchParams({
    search: filters.search,
    sort: filters.sort,
    page: String(filters.page),
  });

  const response = await fetch(`${API_URL}/api/customers?${query.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load customers: ${await response.text()}`);
  }

  return response.json();
}

export async function updateCustomerNote(customerId: string, notes: string) {
  const response = await fetch(`${API_URL}/api/customers/${customerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error(`Could not update customer ${customerId}`);
  }

  return response.json();
}
