import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

function escapeCSV(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return new Response("Supabase not configured", { status: 503 });
  }

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const headers = [
    "SKU",
    "Title",
    "Brand",
    "Model",
    "Price (INR)",
    "Quantity",
    "Status",
    "Featured",
    "Processor",
    "RAM",
    "Storage",
    "GPU",
    "Display",
    "Resolution",
    "OS",
    "Battery Health",
    "Condition Grade",
    "Warranty",
    "Use Case",
    "Views",
    "Created",
  ];

  const rows = (products ?? []).map((p) => [
    p.sku,
    p.title,
    p.brand,
    p.model,
    p.price,
    p.quantity,
    p.status,
    p.featured ? "yes" : "no",
    p.processor,
    p.ram,
    p.storage,
    p.gpu,
    p.display,
    p.resolution,
    p.os,
    p.battery_health,
    p.condition_grade,
    p.warranty,
    p.use_case,
    p.view_count,
    p.created_at,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lestic-products-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
