import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(1, "WhatsApp number is required")
  .regex(/^[+\d][\d\s-]{8,14}$/, "Enter a valid WhatsApp number");

export const bookingSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  whatsapp: phoneSchema,
  address: z.string().min(5, "Please enter your address").max(300),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  pin: z
    .string()
    .regex(/^\d{6}$/, "PIN code should be 6 digits")
    .optional()
    .or(z.literal("")),
  preferred_contact_time: z.string().max(100).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  product_id: z.string().uuid("Invalid product"),
  website: z.string().max(0, "Spam detected"), // honeypot
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200).or(z.literal("")),
  whatsapp: phoneSchema,
  message: z.string().min(5).max(2000),
  website: z.string().max(0, "Spam detected"), // honeypot
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
