"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, contactSchema } from "@/lib/validation";
import { clientIp, rateLimit, persistentRateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/whatsapp";

export async function trackView(productId: string) {
  const headersStore = await headers();
  const ip = clientIp(headersStore);
  const supabase = await createClient();

  const allowed = await persistentRateLimit(supabase, `views:${ip}`, 30, 60);
  if (!allowed) return;

  try {
    await supabase.rpc("increment_view_count", { row_id: productId });
  } catch (err) {
    console.error("trackView failed:", err);
  }
}

export async function submitBooking(
  prevState: { error?: string; fieldErrors?: Record<string, string[]> } | undefined,
  formData: FormData
) {
  const raw = {
    customer_name: formData.get("customer_name"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    pin: formData.get("pin"),
    preferred_contact_time: formData.get("preferred_contact_time"),
    message: formData.get("message"),
    product_id: formData.get("product_id"),
    website: formData.get("website"),
  };

  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { error: "Submission rejected." };
  }

  const headersStore = await headers();
  const ip = clientIp(headersStore);
  if (!rateLimit(`booking:${ip}`, 5)) {
    return { error: "Too many requests. Please try again later." };
  }

  const supabase = await createClient();

  const phoneKey = `phone:${normalizePhone(parsed.data.whatsapp)}`;
  if (!(await persistentRateLimit(supabase, phoneKey, 3, 3600))) {
    return { error: "Too many requests. Please try again later." };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, title, sku, slug, price, status")
    .eq("id", parsed.data.product_id)
    .single();

  if (productError || !product) {
    return { error: "This laptop is no longer available. Please pick another." };
  }

  if (product.status !== "available") {
    return { error: "Sorry, this laptop is not currently available for booking." };
  }

  const { error: leadError } = await supabase.from("leads").insert({
    product_id: product.id,
    product_title: product.title,
    product_sku: product.sku,
    product_slug: product.slug,
    price_at_enquiry: product.price,
    customer_name: parsed.data.customer_name,
    whatsapp: normalizePhone(parsed.data.whatsapp),
    address: parsed.data.address || null,
    city: parsed.data.city || null,
    state: parsed.data.state || null,
    pin: parsed.data.pin || null,
    preferred_contact_time: parsed.data.preferred_contact_time || null,
    message: parsed.data.message || null,
  });

  if (leadError) {
    console.error("Lead insert failed:", leadError.message);
    return { error: "Something went wrong. Please try again." };
  }

  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    try {
      await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_title: product.title,
          product_sku: product.sku,
          price_at_enquiry: product.price,
          customer_name: parsed.data.customer_name,
          whatsapp: normalizePhone(parsed.data.whatsapp),
          address: parsed.data.address,
          city: parsed.data.city,
          state: parsed.data.state,
          pin: parsed.data.pin,
        }),
      }).catch((e) => console.error("Sheets webhook failed:", e.message));
    } catch {
      // Non-blocking — DB remains the source of truth.
    }
  }

  revalidatePath("/admin/leads");
  redirect(`/book/${product.slug}/success?name=${encodeURIComponent(parsed.data.customer_name)}`);
}

export async function submitContact(
  prevState: { error?: string; fieldErrors?: Record<string, string[]> } | undefined,
  formData: FormData
) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    message: formData.get("message"),
    website: formData.get("website"),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { error: "Submission rejected." };
  }

  const headersStore = await headers();
  const ip = clientIp(headersStore);
  if (!rateLimit(`contact:${ip}`, 5)) {
    return { error: "Too many requests. Please try again later." };
  }

  const supabase = await createClient();

  const phoneKey = `phone:${normalizePhone(parsed.data.whatsapp)}`;
  if (!(await persistentRateLimit(supabase, phoneKey, 3, 3600))) {
    return { error: "Too many requests. Please try again later." };
  }

  const { error: leadError } = await supabase.from("leads").insert({
    lead_type: "contact",
    product_title: "General enquiry",
    customer_name: parsed.data.name,
    whatsapp: normalizePhone(parsed.data.whatsapp),
    email: parsed.data.email || null,
    message: parsed.data.message,
  });

  if (leadError) {
    console.error("Contact lead insert failed:", leadError.message);
    return { error: "Something went wrong. Please try again." };
  }

  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_title: "General enquiry",
        customer_name: parsed.data.name,
        whatsapp: normalizePhone(parsed.data.whatsapp),
        email: parsed.data.email || "",
        message: parsed.data.message,
      }),
    }).catch(() => {});
  }

  revalidatePath("/admin/leads");

  return { success: true };
}
