import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

function escapeCSV(value: string | number | null): string {
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

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const headers = [
    "Lead ID",
    "Date",
    "Customer Name",
    "WhatsApp Number",
    "Email",
    "Lead Type",
    "Address",
    "City",
    "State",
    "PIN",
    "Laptop",
    "Product ID",
    "Price",
    "Lead Status",
    "Notes",
  ];

  const rows = (leads ?? []).map((l) => [
    l.id,
    l.created_at,
    l.customer_name,
    l.whatsapp,
    l.email ?? "",
    l.lead_type,
    l.address,
    l.city,
    l.state,
    l.pin,
    l.product_title,
    l.product_sku,
    l.price_at_enquiry,
    l.status,
    l.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lestic-leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
