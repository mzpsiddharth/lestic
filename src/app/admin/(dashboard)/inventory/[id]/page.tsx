import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getProductById } from "@/lib/queries";
import { ProductForm } from "@/components/ProductForm";
import { DuplicateProductButton } from "@/components/DeleteProductButton";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = {
  title: "Edit Laptop",
  robots: { index: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const visible = product.status === "available" || product.status === "sold_out";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to inventory
        </Link>
        <div className="flex items-center gap-2">
          {visible && (
            <Link
              href={`/laptops/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View page
            </Link>
          )}
          <DuplicateProductButton productId={product.id} />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{product.title}</h1>
        <StatusBadge status={product.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {product.sku} · {product.brand}
      </p>

      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
