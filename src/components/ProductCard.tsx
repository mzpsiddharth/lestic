import Link from "next/link";
import { ArrowRight, Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { ProductWithImages } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";
import { StatusBadge } from "@/components/StatusBadge";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithImages;
  priority?: boolean;
}) {
  const images = product.product_images ?? [];
  const cover = images[0]?.url;

  return (
    <Link
      href={`/laptops/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <ProductImage
          src={cover}
          alt={product.title}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-brand-600">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-1 font-semibold text-slate-900">
          {product.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          {product.processor && (
            <span className="inline-flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" />
              {product.processor.replace(/Intel |AMD |\(.*?\)/g, "").trim().split(",")[0]}
            </span>
          )}
          {product.ram && (
            <span className="inline-flex items-center gap-1">
              <MemoryStick className="h-3.5 w-3.5" />
              {product.ram}
            </span>
          )}
          {product.storage && (
            <span className="inline-flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" />
              {product.storage}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-lg font-bold text-slate-900">
              {formatINR(product.price)}
            </p>
            <p className="text-xs text-slate-500">
              {product.quantity > 0 ? "Available" : "Sold out"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
            View <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
