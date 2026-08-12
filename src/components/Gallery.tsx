"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";

export function Gallery({ images }: { images: { url: string }[] }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ url: "" }];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <ProductImage src={list[active].url} alt="Laptop photo" priority />
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-600" : "border-transparent"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`Photo ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
