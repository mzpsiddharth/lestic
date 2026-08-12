import "dotenv/config";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config({ path: [".env.local", ".env"] });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing environment variables. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first."
  );
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters long.");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const already = existing?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId = already?.id;

  if (already) {
    console.log(`Auth user exists for ${email}.`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create auth user:", error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created auth user ${email}.`);
  }

  const { error: insertError } = await admin
    .from("admin_users")
    .upsert({ user_id: userId, email: email.toLowerCase() }, { onConflict: "user_id" });

  if (insertError) {
    console.error("Failed to add admin user:", insertError.message);
    process.exit(1);
  }

  console.log(`Admin access granted for ${email}. You can now log in at /admin/login.`);
}

main();
