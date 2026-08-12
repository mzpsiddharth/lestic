"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["new", "contacted", "inspection", "negotiation", "purchased", "lost"]);

export async function updateLeadStatus(id: string, status: string) {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status: parsed.data }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ notes: notes.trim() || null })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
