import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { DashboardCounts, ProductWithImages, LeadWithProduct } from "@/lib/types";

const productSelect = `
  *,
  product_images (
    id,
    product_id,
    url,
    position
  )
`;

export async function getProducts(extra: {
  limit?: number;
  featured?: boolean;
} = {}): Promise<ProductWithImages[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(productSelect)
    .order("created_at", { ascending: false });

  if (extra.featured) query = query.eq("featured", true);
  if (extra.limit) query = query.limit(extra.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getAvailableProductCount(): Promise<number> {
  if (!hasSupabaseEnv()) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "available")
    .gt("quantity", 0);

  if (error) throw error;
  return count ?? 0;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithImages) ?? null;
}

export async function getVisibleProductBySlug(
  slug: string
): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .in("status", ["available", "sold_out"])
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithImages) ?? null;
}

export async function getProductById(id: string): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithImages) ?? null;
}

export async function getSimilarProducts(
  product: ProductWithImages,
  limit = 3
): Promise<ProductWithImages[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(productSelect)
    .neq("id", product.id)
    .in("status", ["available", "sold_out"])
    .eq("brand", product.brand)
    .limit(limit);

  if (data && data.length > 0) return data as ProductWithImages[];

  const { data: fallback } = await supabase
    .from("products")
    .select(productSelect)
    .neq("id", product.id)
    .in("status", ["available", "sold_out"])
    .limit(limit);

  return (fallback ?? []) as ProductWithImages[];
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { row_id: id });
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const empty: DashboardCounts = {
    total: 0,
    available: 0,
    sold_out: 0,
    drafts: 0,
    hidden: 0,
    leadsNew: 0,
    leadsToday: 0,
    lowStock: 0,
  };
  if (!hasSupabaseEnv()) return empty;
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [products, leads, leadsToday] = await Promise.all([
    supabase.from("products").select("status, quantity"),
    supabase.from("leads").select("status"),
    supabase
      .from("leads")
      .select("id")
      .gte("created_at", todayStart.toISOString()),
  ]);

  const statuses = (products.data ?? []).map((p) => p.status as string);

  return {
    total: products.data?.length ?? 0,
    available: statuses.filter((s) => s === "available").length,
    sold_out: statuses.filter((s) => s === "sold_out").length,
    drafts: statuses.filter((s) => s === "draft").length,
    hidden: statuses.filter((s) => s === "hidden").length,
    leadsNew: (leads.data ?? []).filter((l) => l.status === "new").length,
    leadsToday: leadsToday.data?.length ?? 0,
    lowStock: (products.data ?? []).filter(
      (p) => p.status === "available" && p.quantity <= 3
    ).length,
  };
}

const leadSelect = `
  *,
  product:products (
    id, title, slug, sku, price, processor, ram, storage, gpu, display,
    condition_grade, warranty, battery_health
  )
`;

export async function getLeads(): Promise<LeadWithProduct[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LeadWithProduct[];
}

export async function getLeadById(id: string): Promise<LeadWithProduct | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as LeadWithProduct) ?? null;
}
