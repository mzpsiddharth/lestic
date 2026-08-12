"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct } from "@/actions/products";
import { USE_CASES, PRODUCT_STATUSES } from "@/lib/constants";
import type { ProductWithImages } from "@/lib/types";

interface ImageItem {
  url: string;
  position: number;
}

export function ProductForm({ product }: { product?: ProductWithImages }) {
  const router = useRouter();
  const isEdit = !!product;
  const [images, setImages] = useState<ImageItem[]>(
    product?.product_images?.map((img, i) => ({ url: img.url, position: i })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          setError(`Could not upload ${file.name}: ${error.message}`);
          continue;
        }
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploaded.push({ url: urlData.publicUrl, position: images.length + uploaded.length });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, position: i }));
    });
  }

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i })));
  }

  const imagesJson = JSON.stringify(
    images.map((img, i) => ({ url: img.url, position: i }))
  );

  function handleSubmit(formData: FormData) {
    formData.set("images_json", imagesJson);
    setError(null);
    startTransition(async () => {
      if (isEdit) {
        const result = await updateProduct(product!.id, formData);
        if (result?.error) setError(result.error);
        else router.refresh();
      } else {
        const result = await createProduct(formData);
        if (result?.error) setError(result.error);
      }
    });
  }

  const fieldValue = (name: string): string => {
    const value = product?.[name as keyof typeof product];
    if (typeof value === "string" || typeof value === "number") return String(value);
    return "";
  };

  const input = (name: string, label: string, opts?: {
    placeholder?: string;
    type?: string;
    required?: boolean;
    hint?: string;
    step?: string;
  }) => (
    <div>
      <label htmlFor={name} className="label-lestic">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={opts?.type ?? "text"}
        step={opts?.step}
        placeholder={opts?.placeholder}
        required={opts?.required}
        defaultValue={fieldValue(name)}
        className="input-lestic"
      />
      {opts?.hint && <p className="mt-1 text-xs text-slate-500">{opts.hint}</p>}
    </div>
  );

  const select = (
    name: string,
    label: string,
    options: { value: string; label: string }[],
    allowEmpty = true
  ) => (
    <div>
      <label htmlFor={name} className="label-lestic">{label}</label>
      <select
        id={name}
        name={name}
        defaultValue={fieldValue(name)}
        className="input-lestic"
      >
        {allowEmpty && <option value="">— Select —</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const textarea = (name: string, label: string, rows = 4) => (
    <div>
      <label htmlFor={name} className="label-lestic">{label}</label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={fieldValue(name)}
        className="input-lestic"
      />
    </div>
  );

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {input("title", "Product title", { required: true, placeholder: "e.g. Dell Latitude 5420", hint: "Shown to customers and used for the page URL." })}
          <div className="grid gap-4 sm:grid-cols-2">
            {input("brand", "Brand", { placeholder: "e.g. Dell" })}
            {input("model", "Model", { placeholder: "e.g. Latitude 5420" })}
          </div>
          {input("sku", "SKU / internal ID", { placeholder: "Auto-generated if left empty" })}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="label-lestic">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                required
                defaultValue={product?.price ?? ""}
                className="input-lestic"
                placeholder="29000"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="label-lestic">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                required
                defaultValue={product?.quantity ?? ""}
                className="input-lestic"
              />
              <p className="mt-1 text-xs text-slate-500">
                Becomes Sold Out automatically at 0.
              </p>
            </div>
          </div>
          <div>
            {select("status", "Status", PRODUCT_STATUSES)}
            <p className="mt-1 text-xs text-slate-500">
              Available/Sold Out are set automatically from quantity unless you
              choose Draft or Hidden.
            </p>
          </div>
          <div>
            {select("use_case", "Use case", USE_CASES)}
          </div>
          <label className="flex items-center gap-2 pt-6 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Show on homepage (featured)
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Hardware</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {input("processor", "Processor", { placeholder: "e.g. Intel Core i5-1135G7" })}
          {input("ram", "RAM", { placeholder: "e.g. 16 GB DDR4" })}
          {input("storage", "Storage", { placeholder: "e.g. 512 GB NVMe SSD" })}
          {input("gpu", "Graphics card", { placeholder: "e.g. Intel Iris Xe" })}
          {input("display", "Display", { placeholder: "e.g. 14 inch FHD" })}
          {input("resolution", "Resolution", { placeholder: "e.g. 1920 x 1080" })}
          {input("refresh_rate", "Refresh rate", { placeholder: "e.g. 60Hz" })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Condition & Other</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {input("os", "Operating system", { placeholder: "e.g. Windows 11 Pro" })}
          {input("battery_health", "Battery health", { placeholder: "e.g. Above 80%" })}
          <div>
            {select("condition_grade", "Condition grade", [
              { value: "A", label: "Grade A — Excellent" },
              { value: "B", label: "Grade B — Good" },
              { value: "C", label: "Grade C — Visible use" },
            ])}
          </div>
          {input("warranty", "Warranty", { placeholder: "e.g. 180 days" })}
          {input("accessories", "Included accessories", { placeholder: "e.g. OEM Charger" })}
          {input("condition", "Physical condition notes", { placeholder: "e.g. Minor scratches on lid" })}
        </div>
        <div className="mt-4">
          {textarea("description", "Description", 5)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Photos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select multiple images — front, back, keyboard, display, ports,
          damage marks. Upload, then reorder with the arrows. The first image
          is the cover photo.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.url} className="relative group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200">
                <Image src={img.url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded bg-white p-1 shadow hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="rounded bg-white p-1 shadow hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute bottom-1 right-1 rounded bg-red-600 p-1 text-white opacity-0 transition hover:bg-red-700 group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading…" : "Upload photos"}
            </span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input type="hidden" name="images_json" value={imagesJson} readOnly />
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={pending || uploading} className="btn-primary">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>{isEdit ? "Save Changes" : "Create Laptop"}</>
          )}
        </button>
      </div>
    </form>
  );
}
