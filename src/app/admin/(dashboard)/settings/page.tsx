import type { Metadata } from "next";
import { MessageCircle, FileSpreadsheet, Users, ExternalLink } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default function SettingsPage() {
  const sheetsConfigured = !!process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Business configuration for Lestic.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <MessageCircle className="h-4 w-4 text-brand-600" /> WhatsApp
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your WhatsApp Business number used for &ldquo;Chat with Lestic&rdquo;
            buttons on the website and booking confirmations.
          </p>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
            {WHATSAPP_NUMBER || "Not configured — set NEXT_PUBLIC_WHATSAPP_NUMBER in your environment."}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Set the environment variable{" "}
            <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_WHATSAPP_NUMBER</code>{" "}
            to your number with the country code, e.g. 919876543210.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <FileSpreadsheet className="h-4 w-4 text-brand-600" /> Spreadsheet sync
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every new lead is stored in the database first, then optionally
            forwarded to your Google Sheet.
          </p>
          <p className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                sheetsConfigured
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {sheetsConfigured ? "Webhook configured" : "Not configured"}
            </span>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            To enable, create a Google Apps Script that appends a row on POST
            and set{" "}
            <code className="rounded bg-slate-100 px-1">GOOGLE_SHEETS_WEBHOOK_URL</code>.
            See the README for step-by-step instructions. You can also export
            leads to CSV from the Leads page at any time.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Users className="h-4 w-4 text-brand-600" /> Admin accounts
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add another admin with the command line:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-100">
            {`npm run create-admin -- name@example.com password123`}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Requires the Supabase service role key in your environment file.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <ExternalLink className="h-4 w-4 text-brand-600" /> Live website
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Open the public website to see exactly what customers see.
          </p>
          <a href="/" target="_blank" className="btn-secondary mt-4">
            Open public website
          </a>
        </section>
      </div>
    </div>
  );
}
