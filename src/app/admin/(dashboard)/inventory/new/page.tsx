import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";

export const metadata: Metadata = {
  title: "Add Laptop",
  robots: { index: false },
};

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" /> Back to inventory
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Add Laptop</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fill in the details and press &ldquo;Create Laptop&rdquo;. You can save as
        a draft and publish later.
      </p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
