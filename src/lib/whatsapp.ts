import { WHATSAPP_NUMBER } from "@/lib/constants";

export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function isValidPhone(input: string): boolean {
  const digits = input.replace(/[^\d]/g, "");
  const normalized = normalizePhone(digits);
  return /^91[6-9]\d{9}$/.test(normalized);
}

export function waLinkForCustomer(number: string, message: string): string {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`;
}

export function waLinkForSeller(message: string): string {
  if (!WHATSAPP_NUMBER) return "#";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildSellerMessage(lead: {
  customer_name: string;
  product_title: string;
}): string {
  return `Hello ${lead.customer_name}, this is Lestic regarding your enquiry for the ${lead.product_title}.`;
}

export function buildContactMessage(lead: {
  customer_name: string;
  message?: string | null;
}): string {
  return `Hello ${lead.customer_name}, this is Lestic. We received your enquiry${
    lead.message ? `: "${lead.message}"` : ""
  }. How can we help?`;
}
