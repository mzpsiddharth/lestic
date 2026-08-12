"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct } from "@/actions/products";

export function DuplicateProductButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);

  async function handleDuplicate() {
    if (busy) return;
    setBusy(true);
    const result = await duplicateProduct(productId);
    if (result?.error) {
      alert(result.error);
      setBusy(false);
    }
    // success → server action redirected
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={busy}
      title="Duplicate listing"
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
    >
      <Copy className="h-3.5 w-3.5" /> Duplicate
    </button>
  );
}

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (busy) return;
    if (!confirm("Delete this laptop permanently? This cannot be undone.")) return;
    setBusy(true);
    await deleteProduct(productId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      title="Delete listing"
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
