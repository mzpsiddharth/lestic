"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ProductStatus } from "@/lib/types";

const productSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  brand: z.string().max(100).optional().or(z.literal("")),
  model: z.string().max(100).optional().or(z.literal("")),
  sku: z.string().max(50).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0).max(100000000),
  quantity: z.coerce.number().int().min(0).max(100000),
  status: z.enum(["draft", "available", "sold_out", "hidden"]),
  featured: z.coerce.boolean().optional(),
  use_case: z.string().max(50).optional().or(z.literal("")),
  processor: z.string().max(200).optional().or(z.literal("")),
  ram: z.string().max(100).optional().or(z.literal("")),
  storage: z.string().max(100).optional().or(z.literal("")),
  gpu: z.string().max(200).optional().or(z.literal("")),
  display: z.string().max(100).optional().or(z.literal("")),
  resolution: z.string().max(100).optional().or(z.literal("")),
  refresh_rate: z.string().max(50).optional().or(z.literal("")),
  os: z.string().max(100).optional().or(z.literal("")),
  battery_health: z.string().max(100).optional().or(z.literal("")),
  condition: z.string().max(200).optional().or(z.literal("")),
  condition_grade: z.enum(["A", "B", "C"]).optional().or(z.literal("")),
  warranty: z.string().max(100).optional().or(z.literal("")),
  accessories: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  images_json: z.string().optional().or(z.literal("")),
});

function parseForm(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    status: formData.get("status"),
    featured: formData.has("featured"),
    use_case: formData.get("use_case"),
    processor: formData.get("processor"),
    ram: formData.get("ram"),
    storage: formData.get("storage"),
    gpu: formData.get("gpu"),
    display: formData.get("display"),
    resolution: formData.get("resolution"),
    refresh_rate: formData.get("refresh_rate"),
    os: formData.get("os"),
    battery_health: formData.get("battery_health"),
    condition: formData.get("condition"),
    condition_grade: formData.get("condition_grade"),
    warranty: formData.get("warranty"),
    accessories: formData.get("accessories"),
    description: formData.get("description"),
    images_json: formData.get("images_json"),
  };
  return productSchema.safeParse(raw);
}

function clean<T extends Record<string, unknown>>(data: T): T {
  for (const key of Object.keys(data)) {
    const v = data[key];
    if (v === "" || v === undefined || v === null) delete data[key];
  }
  return data;
}

function deriveStatus(status: ProductStatus, quantity: number): ProductStatus {
  if (status === "draft" || status === "hidden") return status;
  return quantity > 0 ? "available" : "sold_out";
}

export async function createProduct(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  const data = clean(parsed.data);
  const quantity = data.quantity as number;
  const status = deriveStatus(data.status as ProductStatus, quantity);

  const supabase = await createClient();
  const baseSlug = slugify(data.title as string);
  const sku = (data.sku as string) || `LST-${Date.now().toString().slice(-6)}`;

  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const images = parseImages(data.images_json as string | undefined);

  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...data, slug, sku, status, quantity })
    .select("id")
    .single();

  if (error || !product) {
    return { error: `Could not save the laptop: ${error?.message ?? "unknown error"}` };
  }

  if (images.length > 0) {
    const { error: imgError } = await supabase.from("product_images").insert(
      images.map((img, i) => ({
        product_id: product.id,
        url: img.url,
        position: img.position ?? i,
      }))
    );
    if (imgError) console.error("Image insert failed:", imgError.message);
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/laptops");
  redirect(`/admin/inventory/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  const data = clean(parsed.data);
  const quantity = data.quantity as number;
  const status = deriveStatus(data.status as ProductStatus, quantity);

  const supabase = await createClient();
  const images = parseImages(data.images_json as string | undefined);

  const { error } = await supabase
    .from("products")
    .update({ ...data, status, quantity })
    .eq("id", id);

  if (error) {
    return { error: `Could not save changes: ${error.message}` };
  }

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", id);

  if (!deleteError && images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img, i) => ({
        product_id: id,
        url: img.url,
        position: img.position ?? i,
      }))
    );
  }

  revalidatePath(`/admin/inventory/${id}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/laptops");

  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .single();
  if (product?.slug) revalidatePath(`/laptops/${product.slug}`);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/inventory");
  revalidatePath("/laptops");
  redirect("/admin/inventory");
}

export async function duplicateProduct(id: string) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return { error: "Product not found." };

  const title = `${product.title} (Copy)`;
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("url, position")
    .eq("product_id", id);

  const { data: copy, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      sku: `LST-${Date.now().toString().slice(-6)}`,
      brand: product.brand,
      model: product.model,
      price: product.price,
      quantity: product.quantity,
      status: "draft",
      featured: false,
      use_case: product.use_case,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      gpu: product.gpu,
      display: product.display,
      resolution: product.resolution,
      refresh_rate: product.refresh_rate,
      os: product.os,
      battery_health: product.battery_health,
      condition: product.condition,
      condition_grade: product.condition_grade,
      warranty: product.warranty,
      accessories: product.accessories,
      description: product.description,
    })
    .select("id")
    .single();

  if (error || !copy) {
    return { error: `Could not duplicate: ${error?.message ?? "unknown error"}` };
  }

  if (images && images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img, i) => ({
        product_id: copy.id,
        url: img.url,
        position: img.position ?? i,
      }))
    );
  }

  revalidatePath("/admin/inventory");
  redirect(`/admin/inventory/${copy.id}`);
}

function parseImages(json?: string): { url: string; position?: number }[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((img) => img && typeof img.url === "string" && img.url.trim())
      .map((img) => ({ url: img.url, position: img.position }));
  } catch {
    return [];
  }
}
