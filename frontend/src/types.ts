export type CustomerHealth = "healthy" | "watch" | "risk";

export type InvoiceStatus = "paid" | "pending" | "overdue";

export type CustomerSort = "company" | "mrr" | "updatedAt";

export type CustomerRow = {
  id: string;
  company: string;
  owner: string;
  mrr: number;
  health: CustomerHealth;
  invoiceStatus: InvoiceStatus;
  lastContactAt: string;
  updatedAt: string;
  notes: string;
  tags: string[];
};

export type CustomerFilters = {
  search: string;
  sort: CustomerSort;
  page: number;
};

export type CustomersResponse = {
  items: CustomerRow[];
  total: number;
};
