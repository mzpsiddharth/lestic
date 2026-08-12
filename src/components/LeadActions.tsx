"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { updateLeadStatus, updateLeadNotes, deleteLead } from "@/actions/leads";
import { LEAD_STATUSES } from "@/lib/constants";
import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusSelector({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await updateLeadStatus(leadId, e.target.value);
          router.refresh();
        })
      }
      className="input-lestic w-auto"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export function NotesEditor({ leadId, notes }: { leadId: string; notes: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(notes ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateLeadNotes(leadId, value);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={4}
        className="input-lestic"
        placeholder="Private notes — e.g. Customer wants delivery. Called at 4 PM. Wants battery health info."
      />
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="btn-secondary mt-2"
      >
        <Save className="h-4 w-4" /> {saved ? "Saved" : "Save notes"}
      </button>
    </div>
  );
}

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this lead permanently?")) return;
    startTransition(async () => {
      await deleteLead(leadId);
      router.push("/admin/leads");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      )}
    >
      <Trash2 className="h-4 w-4" /> Delete
    </button>
  );
}
