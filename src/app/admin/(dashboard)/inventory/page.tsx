import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, Download } from "lucide-react";
import { getProducts } from "@/lib/queries";
import { formatINR } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteProductButton, DuplicateProductButton } from "@/components/DeleteProductButton";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false },
};

export default async function InventoryPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} listing{products.length === 1 ? "" : "s"} — add,
            edit and manage your laptop catalog.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/inventory/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add Laptop
          </Link>
          <a href="/admin/export/products" className="btn-secondary" download>
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Laptop</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inventory/${p.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {p.sku} · {p.brand}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                    {formatINR(p.price)}
                  </td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.view_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/inventory/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <DuplicateProductButton productId={p.id} />
                      <DeleteProductButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No laptops in inventory yet.{" "}
                    <Link href="/admin/inventory/new" className="font-medium text-brand-600">
                      Add your first laptop
                    </Link>
                    .
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
