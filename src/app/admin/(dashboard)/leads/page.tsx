import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { getLeads } from "@/lib/queries";
import { formatINR, formatDate, getInitials } from "@/lib/utils";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { LEAD_STATUSES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false },
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const leads = await getLeads();

  let filtered = leads;
  if (status && status !== "all") {
    filtered = filtered.filter((l) => l.status === status);
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.customer_name.toLowerCase().includes(query) ||
        l.whatsapp.includes(q) ||
        l.product_title.toLowerCase().includes(query)
    );
  }

  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s.value, leads.filter((l) => l.status === s.value).length])
  ) as Record<string, number>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every booking request from the website. Open a lead to contact the
            customer on WhatsApp.
          </p>
        </div>
        <a href="/admin/export/leads" className="btn-secondary">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/leads"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            !status || status === "all"
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All ({leads.length})
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/leads?status=${s.value}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              status === s.value
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label} ({counts[s.value] ?? 0})
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Laptop</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="group flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                        {getInitials(lead.customer_name)}
                      </span>
                      <span>
                        <span className="block font-medium text-slate-900 group-hover:text-brand-600">
                          {lead.customer_name}
                        </span>
                        <span className="block text-xs text-slate-500">{lead.whatsapp}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    {lead.lead_type === "contact" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        General enquiry
                      </span>
                    ) : (
                      <p className="truncate text-slate-700">{lead.product_title}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {formatINR(lead.price_at_enquiry)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
