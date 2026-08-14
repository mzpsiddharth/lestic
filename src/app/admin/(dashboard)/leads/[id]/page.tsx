import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  StickyNote,
  CalendarDays,
  User,
  Laptop,
  Hash,
} from "lucide-react";
import { getLeadById } from "@/lib/queries";
import { formatINR, formatDateTime, getInitials } from "@/lib/utils";
import {
  waLinkForCustomer,
  buildSellerMessage,
  buildContactMessage,
} from "@/lib/whatsapp";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { StatusSelector, NotesEditor, DeleteLeadButton } from "@/components/LeadActions";

export const metadata: Metadata = {
  title: "Lead Details",
  robots: { index: false },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const isContact = lead.lead_type === "contact";

  const waLink = waLinkForCustomer(
    lead.whatsapp,
    isContact
      ? buildContactMessage({
          customer_name: lead.customer_name,
          message: lead.message,
        })
      : buildSellerMessage({
          customer_name: lead.customer_name,
          product_title: lead.product_title,
        })
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to leads
        </Link>
        <div className="flex items-center gap-3">
          <LeadStatusBadge status={lead.status} />
          <DeleteLeadButton leadId={lead.id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-lg font-bold text-brand-700">
          {getInitials(lead.customer_name)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.customer_name}</h1>
          <p className="text-sm text-slate-500">
            Lead received {formatDateTime(lead.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full py-3.5 text-base sm:w-auto"
        >
          <MessageCircle className="h-5 w-5" /> Contact on WhatsApp
        </a>
        <p className="mt-2 text-xs text-slate-500">
          Opens WhatsApp with a pre-filled message to {lead.whatsapp}.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <User className="h-4 w-4 text-brand-600" /> Customer Information
          </h2>
          <div className="mt-2 divide-y divide-slate-100">
            <InfoRow icon={Phone} label="WhatsApp / Mobile" value={lead.whatsapp} />
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            {!isContact && <InfoRow icon={MapPin} label="Address" value={lead.address} />}
            {!isContact && (
              <InfoRow
                icon={MapPin}
                label="City / State"
                value={[lead.city, lead.state].filter(Boolean).join(", ") || null}
              />
            )}
            {!isContact && <InfoRow icon={Hash} label="PIN code" value={lead.pin} />}
            {!isContact && (
              <InfoRow icon={Clock} label="Preferred contact time" value={lead.preferred_contact_time} />
            )}
            {isContact && lead.message && (
              <div className="py-2">
                <p className="text-xs text-slate-500">Message</p>
                <p className="mt-0.5 text-sm text-slate-800">{lead.message}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            {isContact ? (
              <>
                <User className="h-4 w-4 text-brand-600" /> General Enquiry
              </>
            ) : (
              <>
                <Laptop className="h-4 w-4 text-brand-600" /> Laptop Information
              </>
            )}
          </h2>

          {isContact ? (
            <div className="mt-3">
              <p className="text-lg font-semibold text-slate-900">General contact enquiry</p>
              <p className="mt-1 text-sm text-slate-600">
                Submitted from the Contact Us page.
              </p>
              {lead.message && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Enquiry message</p>
                  <p className="mt-1 text-sm text-slate-800">{lead.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-lg font-semibold text-slate-900">{lead.product_title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                {lead.product_sku && <span>ID: {lead.product_sku}</span>}
                <span>
                  Price at enquiry:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatINR(lead.price_at_enquiry)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {!isContact && lead.product ? (
            <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              {[
                ["Processor", lead.product.processor],
                ["RAM", lead.product.ram],
                ["Storage", lead.product.storage],
                ["Graphics", lead.product.gpu],
                ["Display", lead.product.display],
                ["Battery health", lead.product.battery_health],
                ["Warranty", lead.product.warranty],
              ].map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          ) : (
            !isContact && (
              <p className="mt-3 text-sm text-slate-500">
                The linked laptop has been deleted.
              </p>
            )
          )}

          {!isContact && lead.product?.slug && (
            <Link
              href={`/laptops/${lead.product.slug}`}
              target="_blank"
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View laptop listing →
            </Link>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <CalendarDays className="h-4 w-4 text-brand-600" /> Lead Status
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusSelector leadId={lead.id} status={lead.status} />
            <span className="text-sm text-slate-500">
              Updated {formatDateTime(lead.updated_at)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <StickyNote className="h-4 w-4 text-brand-600" /> Private Notes
          </h2>
          <div className="mt-3">
            <NotesEditor leadId={lead.id} notes={lead.notes} />
          </div>
        </section>
      </div>
    </div>
  );
}
