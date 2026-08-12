import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { waLinkForSeller } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Request Received",
  robots: { index: false },
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;

  return (
    <div className="container-lestic max-w-xl py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Request Received!
        </h1>
        <p className="mt-3 text-slate-600">
          {name ? `Thank you, ${name}! ` : "Thank you! "}Lestic has received
          your booking request and will contact you on WhatsApp shortly.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Please keep your phone reachable. This is an enquiry request — the
          laptop is not reserved until Lestic confirms it with you directly.
        </p>

        <a
          href={waLinkForSeller("Hello Lestic! I just submitted a booking request on the website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6 w-full"
        >
          <MessageCircle className="h-5 w-5" /> Chat with Lestic on WhatsApp
        </a>

        <Link
          href="/laptops"
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Continue browsing laptops
        </Link>
      </div>
    </div>
  );
}
