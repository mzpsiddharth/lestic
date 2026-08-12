"use client";

import { useActionState } from "react";
import { submitContact } from "@/actions/public";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-3 font-semibold text-emerald-800">
          Message sent! We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="label-lestic">Your name</label>
        <input id="name" name="name" required className="input-lestic" />
      </div>
      <div>
        <label htmlFor="email" className="label-lestic">
          Email <span className="text-slate-400">(optional)</span>
        </label>
        <input id="email" name="email" type="email" className="input-lestic" />
      </div>
      <div>
        <label htmlFor="whatsapp" className="label-lestic">WhatsApp number</label>
        <input id="whatsapp" name="whatsapp" type="tel" required className="input-lestic" />
      </div>
      <div>
        <label htmlFor="message" className="label-lestic">Message</label>
        <textarea id="message" name="message" rows={4} required className="input-lestic" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
