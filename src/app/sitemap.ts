import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/laptops`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const products = await getProducts();
    const productRoutes = products
      .filter((p) => p.status !== "hidden" && p.status !== "draft")
      .map((p) => ({
        url: `${SITE_URL}/laptops/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
