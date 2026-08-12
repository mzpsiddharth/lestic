import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  MousePointerClick,
  Search,
  ShieldCheck,
  Star,
  ClipboardList,
} from "lucide-react";
import { getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { WHATSAPP_NUMBER, SITE_TAGLINE } from "@/lib/constants";

export const metadata = {
  title: "Quality Pre-Owned Laptops",
  description:
    "Browse quality pre-owned laptops, tested and inspected by Lestic. Book a laptop and talk to us directly on WhatsApp.",
};

const whyPoints = [
  {
    icon: ShieldCheck,
    title: "Quality-checked",
    text: "Every laptop is tested and inspected before it is listed.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent specifications",
    text: "Real specs — processor, RAM, storage, display and battery health.",
  },
  {
    icon: ClipboardList,
    title: "Inspection available",
    text: "Ask for photos, videos or a video call before you decide.",
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    text: "Talk to the actual seller on WhatsApp. No middlemen, no bots.",
  },
  {
    icon: Star,
    title: "No online checkout",
    text: "No complicated payments. You inspect, agree and buy directly.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Browse",
    text: "Find a laptop from the catalog.",
  },
  {
    icon: MousePointerClick,
    title: "Choose",
    text: "View specs, condition, photos and price.",
  },
  {
    icon: ClipboardList,
    title: "Book / Enquire",
    text: "Submit your details through the website.",
  },
  {
    icon: MessageCircle,
    title: "Talk to Lestic",
    text: "We contact you on WhatsApp to arrange inspection and purchase.",
  },
];

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    featured = await getProducts({ limit: 8 });
  } catch {
    featured = [];
  }

  const available = featured.filter((p) => p.status === "available");

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-lestic py-20 text-center lg:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Browse our tested and inspected pre-owned laptops, see exactly what
            you are getting, and talk to us directly on WhatsApp. No
            complicated online checkout — just trustworthy laptops from a real
            seller.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/laptops" className="btn-primary text-base">
              Browse Laptops <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/contact" className="btn-secondary text-base">
              Contact Lestic
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            {available.length} laptops currently available
          </p>
        </div>
      </section>

      <section className="container-lestic py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Latest Laptops
            </h2>
            <p className="mt-1 text-slate-600">
              Freshly listed, quality-checked machines.
            </p>
          </div>
          <Link
            href="/laptops"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No laptops published yet. Check back soon.
          </p>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="container-lestic">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Why Lestic?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <point.icon className="h-7 w-7 text-brand-600" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lestic py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          How It Works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6">
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-slate-100">
                {i + 1}
              </span>
              <step.icon className="h-7 w-7 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 py-16">
        <div className="container-lestic text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Found something you like?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Browse the full catalog or reach out to us on WhatsApp — we are
            happy to help you find the right laptop.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/laptops"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              Browse Laptops <ArrowRight className="h-4 w-4" />
            </Link>
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
