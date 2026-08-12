import type { Metadata } from "next";
import Link from "next/link";
import {
  Laptop,
  CheckCircle2,
  Ban,
  FileEdit,
  EyeOff,
  Inbox,
  Plus,
  ArrowRight,
  PackageSearch,
} from "lucide-react";
import {
  getDashboardCounts,
  getProducts,
  getLeads,
} from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function AdminDashboard() {
  const [counts, recentProducts, recentLeads] = await Promise.all([
    getDashboardCounts(),
    getProducts({ limit: 6 }),
    getLeads(),
  ]);

  const leads = recentLeads.slice(0, 6);

  const statCards = [
    { label: "Total Listings", value: counts.total, icon: Laptop, color: "text-slate-900" },
    { label: "Available", value: counts.available, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Sold Out", value: counts.sold_out, icon: Ban, color: "text-slate-500" },
    { label: "Drafts", value: counts.drafts, icon: FileEdit, color: "text-amber-600" },
    { label: "Hidden", value: counts.hidden, icon: EyeOff, color: "text-slate-400" },
    { label: "New Leads", value: counts.leadsNew, icon: Inbox, color: "text-blue-600" },
    { label: "Today's Leads", value: counts.leadsToday, icon: Inbox, color: "text-violet-600" },
    { label: "Low Stock (≤3)", value: counts.lowStock, icon: PackageSearch, color: "text-orange-600" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your inventory and customer enquiries.
          </p>
        </div>
        <Link href="/admin/inventory/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add Laptop
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">Recently Added Laptops</h2>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentProducts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/inventory/${p.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatINR(p.price)} · qty {p.quantity}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
            {recentProducts.length === 0 && (
              <li className="p-6 text-center text-sm text-slate-500">
                No products yet. Add your first laptop.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">Recent Leads</h2>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {lead.customer_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {lead.product_title} · {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              </li>
            ))}
            {leads.length === 0 && (
              <li className="p-6 text-center text-sm text-slate-500">
                No leads yet. They will appear here when customers book laptops.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
