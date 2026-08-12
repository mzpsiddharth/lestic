"use client";

import { useEffect, useRef } from "react";
import { trackView } from "@/actions/public";

export function ViewTracker({ productId }: { productId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackView(productId);
  }, [productId]);

  return null;
}
