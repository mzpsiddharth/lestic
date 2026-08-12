import { Suspense } from "react";
import { getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { FilterPanel, SortSelect } from "@/components/FilterPanel";
import { PRICE_RANGES } from "@/lib/constants";

export const metadata = {
  title: "Browse Laptops",
  description:
    "Browse our full catalog of quality pre-owned laptops. Search, filter by price, brand, RAM, storage and processor, then book a laptop in seconds.",
};

function matchRange(price: number, rangeKey: string): boolean {
  const range = PRICE_RANGES.find((r) => r.value === rangeKey);
  if (!range) return false;
  if (range.min !== null && price < range.min) return false;
  if (range.max !== null && price >= range.max) return false;
  return true;
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : (v ?? "");
  };

  const q = get("q").toLowerCase();
  const brand = get("brand");
  const ram = get("ram");
  const storage = get("storage");
  const processor = get("processor");
  const price = get("price");
  const useCase = get("use_case");
  const sort = get("sort") || "newest";

  let products = await getProducts();

  if (q) {
    products = products.filter((p) =>
      [p.title, p.brand, p.model, p.processor, p.sku, p.ram, p.storage]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }
  if (brand) products = products.filter((p) => p.brand === brand);
  if (useCase) products = products.filter((p) => p.use_case === useCase);
  if (ram) products = products.filter((p) => p.ram?.includes(ram));
  if (storage) products = products.filter((p) => p.storage?.includes(storage));
  if (processor)
    products = products.filter((p) => p.processor?.toLowerCase().includes(processor.toLowerCase()));
  if (price) products = products.filter((p) => matchRange(p.price, price));

  switch (sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      products.sort((a, b) => b.view_count - a.view_count);
      break;
    default:
      products.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  const totalListings = products.length;
  const available = products.filter((p) => p.status === "available").length;

  return (
    <div className="container-lestic py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Browse Laptops</h1>
        <p className="mt-2 text-slate-600">
          {totalListings} laptop{totalListings === 1 ? "" : "s"} listed —{" "}
          {available} currently available. Every laptop is tested and
          inspected before it is listed.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {products.length} result{products.length === 1 ? "" : "s"}
            </p>
            <SortSelect />
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-semibold text-slate-700">No laptops match your filters</p>
              <p className="mt-1 text-sm text-slate-500">
                Try removing some filters or searching for something else.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LaptopsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="container-lestic py-10 text-center text-slate-500">
          Loading catalog…
        </div>
      }
    >
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}
