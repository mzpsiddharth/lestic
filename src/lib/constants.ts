export const SITE_NAME = "Lestic";
export const SITE_TAGLINE = "Quality Pre-Owned Laptops. Tested. Transparent. Affordable.";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BRANDS = ["Dell", "HP", "Lenovo", "ASUS", "Acer", "Apple", "MSI", "Other"];

export const USE_CASES: { value: string; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "office", label: "Office / Work" },
  { value: "programming", label: "Programming" },
  { value: "gaming", label: "Gaming" },
  { value: "design", label: "Design / Editing" },
  { value: "premium", label: "Premium / Ultrabook" },
  { value: "general", label: "General Use" },
];

export const RAM_OPTIONS = ["4 GB", "8 GB", "16 GB", "32 GB"];

export const STORAGE_OPTIONS = ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];

export const PROCESSOR_OPTIONS = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "AMD Ryzen 3",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
];

export const CONDITION_GRADES: { value: string; label: string; description: string }[] = [
  {
    value: "A",
    label: "Grade A",
    description: "Excellent physical condition with minimal signs of use.",
  },
  {
    value: "B",
    label: "Grade B",
    description: "Good condition with normal signs of use.",
  },
  {
    value: "C",
    label: "Grade C",
    description: "Visible signs of use but fully functional.",
  },
];

export const PRODUCT_STATUSES: { value: string; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "sold_out", label: "Sold Out" },
  { value: "hidden", label: "Hidden" },
  { value: "draft", label: "Draft" },
];

export const LEAD_STATUSES: { value: string; label: string; dot: string }[] = [
  { value: "new", label: "New", dot: "bg-blue-500" },
  { value: "contacted", label: "Contacted", dot: "bg-amber-500" },
  { value: "inspection", label: "Inspection", dot: "bg-violet-500" },
  { value: "negotiation", label: "Negotiation", dot: "bg-orange-500" },
  { value: "purchased", label: "Purchased", dot: "bg-emerald-500" },
  { value: "lost", label: "Closed / Lost", dot: "bg-gray-400" },
];

export const PRICE_RANGES: { value: string; label: string; min: number | null; max: number | null }[] = [
  { value: "0-20000", label: "Under ₹20,000", min: 0, max: 20000 },
  { value: "20000-30000", label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { value: "30000-40000", label: "₹30,000 – ₹40,000", min: 30000, max: 40000 },
  { value: "40000-50000", label: "₹40,000 – ₹50,000", min: 40000, max: 50000 },
  { value: "50000-null", label: "₹50,000+", min: 50000, max: null },
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];
