import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Lestic",
  description:
    "Get in touch with Lestic. Chat with us on WhatsApp or send a message through the website.",
};

export default function ContactPage() {
  return (
    <div className="container-lestic max-w-4xl py-14">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Lestic</h1>
      <p className="mt-3 text-slate-600">
        Have a question about a laptop, or need help choosing? Send us a
        message and we will get back to you.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Send a message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MessageCircle className="h-7 w-7 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">WhatsApp</h2>
            <p className="mt-1 text-sm text-slate-600">
              The fastest way to reach us.
            </p>
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">What we ask for</h2>
            <p className="mt-1 text-sm text-slate-600">
              Share your budget, the kind of work you do (studies, office,
              programming, design) and any specs you prefer — RAM, storage,
              battery life. We will recommend the right laptop from our stock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
