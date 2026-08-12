"use client";

import { useActionState } from "react";
import { submitBooking } from "@/actions/public";
import { formatINR } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/types";

export function BookingForm({ product }: { product: ProductWithImages }) {
  const [state, formAction, pending] = useActionState(submitBooking, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="product_id" value={product.id} />

      <div
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          You are enquiring about
        </p>
        <p className="mt-1 font-semibold text-slate-900">{product.title}</p>
        <p className="text-sm text-slate-600">
          {formatINR(product.price)} · {product.sku ?? product.slug}
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="customer_name" className="label-lestic">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          className="input-lestic"
          placeholder="e.g. Rahul Sharma"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="label-lestic">
          WhatsApp / mobile number <span className="text-red-500">*</span>
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          className="input-lestic"
          placeholder="e.g. +91 98765 43210"
        />
        <p className="mt-1 text-xs text-slate-500">
          Lestic will contact you on this number.
        </p>
      </div>

      <div>
        <label htmlFor="address" className="label-lestic">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={2}
          className="input-lestic"
          placeholder="House / street / area"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="label-lestic">
            City
          </label>
          <input id="city" name="city" className="input-lestic" />
        </div>
        <div>
          <label htmlFor="state" className="label-lestic">
            State
          </label>
          <input id="state" name="state" className="input-lestic" />
        </div>
      </div>

      <div>
        <label htmlFor="pin" className="label-lestic">
          PIN code
        </label>
        <input
          id="pin"
          name="pin"
          inputMode="numeric"
          maxLength={6}
          className="input-lestic"
          placeholder="6 digit PIN"
        />
      </div>

      <div>
        <label htmlFor="preferred_contact_time" className="label-lestic">
          Preferred contact time
        </label>
        <input
          id="preferred_contact_time"
          name="preferred_contact_time"
          className="input-lestic"
          placeholder="e.g. After 6 PM"
        />
      </div>

      <div>
        <label htmlFor="message" className="label-lestic">
          Message / requirements <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="input-lestic"
          placeholder="Anything you want us to know — delivery, battery info, etc."
        />
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
        {pending ? "Submitting…" : "Submit Booking Request"}
      </button>

      <p className="text-center text-xs text-slate-500">
        This is an enquiry request, not an online purchase. Lestic will contact
        you on WhatsApp to arrange inspection and payment directly.
      </p>
    </form>
  );
}
