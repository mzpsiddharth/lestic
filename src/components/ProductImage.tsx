"use client";

import Image from "next/image";
import { Laptop } from "lucide-react";
import { useState } from "react";

export function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
      >
        <Laptop className="h-10 w-10" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      priority={priority}
      onError={() => setError(true)}
      className={`object-cover ${className}`}
    />
  );
}
