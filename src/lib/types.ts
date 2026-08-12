export type ProductStatus = "draft" | "available" | "sold_out" | "hidden";
export type LeadStatus = "new" | "contacted" | "inspection" | "negotiation" | "purchased" | "lost";

export interface Product {
  id: string;
  slug: string;
  sku: string | null;
  title: string;
  brand: string | null;
  model: string | null;
  price: number;
  quantity: number;
  status: ProductStatus;
  featured: boolean;
  use_case: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  display: string | null;
  resolution: string | null;
  refresh_rate: string | null;
  os: string | null;
  battery_health: string | null;
  condition: string | null;
  condition_grade: string | null;
  warranty: string | null;
  accessories: string | null;
  description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface ProductWithImages extends Product {
  product_images: ProductImage[];
}

export interface Lead {
  id: string;
  product_id: string | null;
  product_title: string;
  product_sku: string | null;
  product_slug: string | null;
  price_at_enquiry: number | null;
  customer_name: string;
  whatsapp: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithProduct extends Lead {
  product: Pick<
    Product,
    "id" | "title" | "slug" | "sku" | "price" | "processor" | "ram" | "storage" | "gpu" | "display" | "condition_grade" | "warranty" | "battery_health"
  > | null;
}

export interface DashboardCounts {
  total: number;
  available: number;
  sold_out: number;
  drafts: number;
  hidden: number;
  leadsNew: number;
  leadsToday: number;
  lowStock: number;
}
