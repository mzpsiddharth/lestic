import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { seedProducts } from "../src/lib/seed-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing environment variables. Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(url, key);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Seeding products...");

  let inserted = 0;
  let skipped = 0;

  for (const [i, p] of seedProducts.entries()) {
    const slug = slugify(p.title);
    const sku = `LST-${String(1000 + i)}`;

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      skipped++;
      console.log(`  skip ${slug} (already exists)`);
      continue;
    }

    const { error } = await supabase.from("products").insert({
      slug,
      sku,
      title: p.title,
      brand: p.brand,
      model: p.model,
      price: p.price,
      quantity: p.quantity,
      status: p.quantity > 0 ? "available" : "sold_out",
      featured: p.featured,
      use_case: p.use_case,
      processor: p.processor,
      ram: p.ram,
      storage: p.storage,
      gpu: p.gpu,
      display: p.display,
      resolution: p.resolution,
      os: p.os,
      battery_health: p.battery_health,
      condition_grade: p.condition_grade,
      warranty: p.warranty,
      accessories: p.accessories,
      description: p.description,
    });

    if (error) {
      console.error(`  error inserting ${slug}:`, error.message);
    } else {
      inserted++;
      console.log(`  inserted ${slug} (${sku}, ₹${p.price}, qty ${p.quantity})`);
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
}

main();
