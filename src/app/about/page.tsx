import type { Metadata } from "next";
import { ShieldCheck, BadgeCheck, Search, HeartHandshake } from "lucide-react";
import { CONDITION_GRADES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Lestic",
  description:
    "Lestic sells quality pre-owned laptops that are tested and inspected. Learn how we work and what our condition grades mean.",
};

export default function AboutPage() {
  return (
    <div className="container-lestic max-w-4xl py-14">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About Lestic</h1>
      <p className="mt-4 text-lg text-slate-600">
        Lestic is a second-hand / refurbished laptop business. We buy used
        business laptops, test them thoroughly, and sell them at fair prices —
        with no hidden surprises.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {[
          {
            icon: ShieldCheck,
            title: "Tested before listing",
            text: "Every laptop is checked for display, keyboard, trackpad, ports, camera, speakers, battery and performance before it appears on the site.",
          },
          {
            icon: BadgeCheck,
            title: "Honest condition grades",
            text: "We grade each laptop A, B or C so you know exactly what physical condition to expect.",
          },
          {
            icon: Search,
            title: "Inspect before you buy",
            text: "Ask us for photos, videos or a video call. We encourage you to verify the laptop yourself before paying.",
          },
          {
            icon: HeartHandshake,
            title: "Direct, human buying",
            text: "No bots, no complicated checkout. You talk to us on WhatsApp, agree on the deal, and buy directly.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <item.icon className="h-7 w-7 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-bold text-slate-900">Condition Grades</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {CONDITION_GRADES.map((g, i) => (
            <div
              key={g.value}
              className={`flex items-center gap-4 p-5 ${i > 0 ? "border-t border-slate-100" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
                {g.value}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{g.label}</p>
                <p className="text-sm text-slate-600">{g.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Every listing shows its grade. If you have questions about a specific
          laptop, ask us on WhatsApp — we are happy to explain.
        </p>
      </div>
    </div>
  );
}
