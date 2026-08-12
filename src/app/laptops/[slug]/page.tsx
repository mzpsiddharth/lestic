import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Cpu, HardDrive, MemoryStick, Monitor, Layers } from "lucide-react";
import {
  getVisibleProductBySlug,
  getSimilarProducts,
} from "@/lib/queries";
import { formatINR } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { Gallery } from "@/components/Gallery";
import { ProductCard } from "@/components/ProductCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ViewTracker } from "@/components/ViewTracker";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) return {};

  const specs = [product.ram, product.storage, product.processor]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${product.title} — ${formatINR(product.price)}`,
    description:
      `${product.brand} ${product.model} pre-owned laptop. ${specs}. Battery health ${product.battery_health ?? "n/a"}, warranty ${product.warranty ?? "n/a"}. ` +
      `Browse, book and talk to ${SITE_NAME} on WhatsApp.`,
    openGraph: {
      title: `${product.title} — ${formatINR(product.price)}`,
      description: `Quality pre-owned ${product.title}. ${specs}.`,
      type: "website",
      images: product.product_images?.[0]?.url
        ? [{ url: product.product_images[0].url }]
        : undefined,
    },
  };
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-slate-100 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(product);
  const available = product.status === "available";

  return (
    <div>
      <ViewTracker productId={product.id} />

      <div className="container-lestic py-6">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/laptops" className="hover:text-brand-600">Laptops</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-700">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Gallery images={product.product_images ?? []} />

          <div>
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={product.status} />
              {product.sku && (
                <span className="text-xs text-slate-400">{product.sku}</span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-3xl font-extrabold text-slate-900">
                {formatINR(product.price)}
              </p>
              {product.quantity > 0 && (
                <p className="text-sm text-emerald-600">
                  {product.quantity} unit{product.quantity > 1 ? "s" : ""} available
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Cpu, label: "Processor", value: product.processor?.split(",")[0] },
                { icon: MemoryStick, label: "RAM", value: product.ram },
                { icon: HardDrive, label: "Storage", value: product.storage },
                { icon: Monitor, label: "Display", value: product.display },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                  <item.icon className="h-4 w-4 text-brand-600" />
                  <p className="mt-1.5 text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            {product.description && (
              <p className="mt-6 text-slate-600">{product.description}</p>
            )}

            <div className="mt-8 space-y-3">
              {available ? (
                <>
                  <Link href={`/book/${product.slug}`} className="btn-primary w-full py-3 text-base">
                    Book This Laptop
                  </Link>
                  <p className="text-center text-xs text-slate-500">
                    Submit your details — Lestic contacts you on WhatsApp. No
                    payment online.
                  </p>
                </>
              ) : (
                <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
                  This laptop is currently sold out.{" "}
                  <Link href="/laptops" className="font-medium text-brand-600 hover:underline">
                    Browse other laptops
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Layers className="h-5 w-5 text-brand-600" /> Full Specifications
            </h2>
            <dl className="mt-4">
              <SpecRow label="Brand" value={product.brand} />
              <SpecRow label="Model" value={product.model} />
              <SpecRow label="Processor" value={product.processor} />
              <SpecRow label="RAM" value={product.ram} />
              <SpecRow label="Storage" value={product.storage} />
              <SpecRow label="Graphics" value={product.gpu} />
              <SpecRow label="Display" value={product.display} />
              <SpecRow label="Resolution" value={product.resolution} />
              <SpecRow label="Refresh rate" value={product.refresh_rate} />
              <SpecRow label="Operating system" value={product.os} />
              <SpecRow label="Battery health" value={product.battery_health} />
              <SpecRow label="Condition grade" value={product.condition_grade ? `Grade ${product.condition_grade}` : undefined} />
              <SpecRow label="Physical condition" value={product.condition} />
              <SpecRow label="Warranty" value={product.warranty} />
              <SpecRow label="Accessories included" value={product.accessories} />
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Buying process</h2>
            <ol className="mt-4 space-y-4">
              {[
                { n: 1, t: "Book this laptop", d: "Submit your details through this page." },
                { n: 2, t: "Talk to Lestic", d: "We contact you on WhatsApp for questions, inspection and negotiation." },
                { n: 3, t: "Inspect", d: "Get photos, videos or a video call to verify the laptop." },
                { n: 4, t: "Buy directly", d: "Payment and delivery happen directly between you and Lestic." },
              ].map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.t}</p>
                    <p className="text-sm text-slate-600">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="container-lestic">
            <h2 className="text-xl font-bold text-slate-900">You may also like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
