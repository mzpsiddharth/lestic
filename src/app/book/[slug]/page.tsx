import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck } from "lucide-react";
import { getVisibleProductBySlug } from "@/lib/queries";
import { formatINR } from "@/lib/utils";
import { BookingForm } from "@/components/BookingForm";
import { SITE_NAME } from "@/lib/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) return {};
  return {
    title: `Book ${product.title}`,
    description: `Book the ${product.title} (${formatINR(product.price)}) from ${SITE_NAME}. Submit your details and we will contact you on WhatsApp.`,
    robots: { index: false },
  };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) notFound();

  if (product.status !== "available") {
    return (
      <div className="container-lestic max-w-xl py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            This laptop is currently sold out
          </h1>
          <p className="mt-2 text-slate-600">
            {product.title} is not available for booking right now. Browse the
            catalog for other laptops or contact us on WhatsApp.
          </p>
          <Link href="/laptops" className="btn-primary mt-6">
            Browse other laptops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-lestic max-w-2xl py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Book This Laptop
      </h1>
      <p className="mt-2 text-slate-600">
        Fill in your details and Lestic will contact you on WhatsApp shortly.
        No account needed.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <BookingForm product={product} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">No payment online</p>
            <p className="text-xs text-slate-600">
              This is a booking request. Payment happens directly with Lestic
              after inspection.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Delivery support</p>
            <p className="text-xs text-slate-600">
              Discuss delivery or pickup with Lestic directly on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
