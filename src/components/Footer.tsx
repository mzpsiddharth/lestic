import Link from "next/link";
import { Laptop, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-lestic py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Laptop className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-slate-900">Lestic</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-600">
              Quality pre-owned laptops, tested and inspected. Browse the
              catalog, book a laptop and talk to us directly on WhatsApp — no
              complicated online checkout.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Browse</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/laptops" className="hover:text-brand-600">
                  All Laptops
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-600">
                  About Lestic
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  className="inline-flex items-center gap-1.5 hover:text-brand-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600">
                  Send an enquiry
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Lestic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
