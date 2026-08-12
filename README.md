# Lestic — Second-Hand Laptop Catalog & Lead Management

Lestic is a website for a second-hand / refurbished laptop business. It has two sides:

- **Public website** — an attractive laptop catalog where customers browse listings, view specifications and submit a **"Book This Laptop"** enquiry.
- **Admin dashboard** — where the seller manages inventory, images, prices, quantities, and customer leads, and contacts customers on WhatsApp.

Lestic is **not e-commerce**. There is no online checkout. Customers enquire, Lestic contacts them on WhatsApp, and the transaction happens directly.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend/Backend | Next.js 15 (App Router) + TypeScript |
| Styling        | Tailwind CSS                        |
| Database       | Supabase (PostgreSQL)               |
| Auth           | Supabase Auth (email/password)      |
| Image storage  | Supabase Storage                    |
| Hosting        | Vercel (free tier)                  |
| Spreadsheet    | Google Sheets (optional webhook)    |
| WhatsApp       | `wa.me` deep links (WhatsApp Business) |

---

## Getting Started

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project (free tier).
2. Open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates all tables, row-level security policies, and the image storage bucket.
3. Open **Project Settings → API** and copy:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (secret — keep it server-side only)

### 2. Configure the project

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

### 3. Create an admin account

```bash
npm install
npm run create-admin -- owner@lestic.in yourpassword
```

This creates a login for `/admin/login`.

### 4. Load your current stock

```bash
npm run seed
```

This loads the 9 laptops from the current stock sheet (ThinkPads, Dell Latitude, etc.) into the catalog.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000 (public) and http://localhost:3000/admin (admin).

---

## Deployment (Vercel)

1. Push the project to GitHub and import it into [Vercel](https://vercel.com) (free tier).
2. In **Vercel → Project → Settings → Environment Variables**, add all values from `.env.local` (including the `NEXT_PUBLIC_` ones).
3. Deploy. The free Supabase tier is enough to start.

---

## Google Sheets Sync (optional)

The database is the source of truth. Spreadsheets are a secondary record.

**Quick manual export:** Admin → Leads → **Export CSV**, and Admin → Inventory → **Export CSV**. Open the file in Google Sheets/Excel.

**Automatic sync:** every new lead can be pushed to a Google Sheet via a webhook:

1. In Google Sheets, open **Extensions → Apps Script**.
2. Paste the script below, set `SHEET_NAME`, save and **Deploy → New deployment → Web app** with access *Anyone*.
3. Copy the web app URL into `GOOGLE_SHEETS_WEBHOOK_URL` in `.env.local` (or Vercel env vars).

```javascript
const SHEET_NAME = "Leads";
const headers = ["Lead ID","Date","Customer Name","WhatsApp Number","Address","City","State","PIN","Laptop","Product ID","Price","Lead Status","Notes"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return ContentService.createTextOutput("no sheet");
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    "", new Date().toISOString(), d.customer_name, d.whatsapp, d.address,
    d.city, d.state, d.pin, d.product_title, d.product_sku,
    d.price_at_enquiry ?? "", d.status ?? "new", d.notes ?? ""
  ]);
  return ContentService.createTextOutput("ok");
}
```

If the spreadsheet is unavailable or edited by hand, the website keeps working — the database is never replaced by the sheet.

---

## WhatsApp Integration

- **Lead page (admin):** a **Contact on WhatsApp** button opens `wa.me` chat with the customer's number and a pre-filled message.
- **Booking confirmation (customer):** a **Chat with Lestic on WhatsApp** button opens the seller's number.
- No paid API needed for the MVP. When the business needs automated messages, the lead/notification flow can be extended with the official WhatsApp Business API.

---

## How the business flow works

```
Customer browses → views laptop → "Book This Laptop" → submits form
   → lead stored in database → appears in admin → (optional Sheets sync)
   → seller opens lead → "Contact on WhatsApp" → inspection/discussion
   → offline sale → seller reduces quantity → Sold Out at 0
```

### Inventory vs Leads

- **Product** — a catalog listing (e.g. Dell Latitude 5420 i5/16GB/512GB).
- **Quantity** — how many physical units of that specification are available.
- **Lead** — a customer who enquired about a product.
- **Sale** — a completed offline transaction (tracked via the lead status `Purchased`).

Products with `quantity = 0` automatically show as **Sold Out**. Status can also be **Draft** (not public) or **Hidden** (removed from the site but kept in inventory).

---

## Project Structure

```
src/
  app/
    page.tsx                     # Homepage
    laptops/                     # Catalog + product pages
    book/[slug]/                 # Booking form + confirmation
    about/  contact/
    admin/
      login/                     # Admin login (no sidebar)
      (dashboard)/
        page.tsx                 # Dashboard
        layout.tsx               # Auth guard + sidebar
        inventory/               # List, add, edit
        leads/                   # List, detail
        export/                  # CSV export routes
        settings/
  actions/                       # Server actions (booking, auth, products, leads)
  components/                    # Shared UI
  lib/
    supabase/                    # Browser + server clients
    queries.ts                   # Data access
    constants.ts  utils.ts  whatsapp.ts  validation.ts  rate-limit.ts
supabase/
  schema.sql                     # Tables, RLS, storage bucket
scripts/
  seed.ts                        # Load current stock
  create-admin.ts                # Create admin login
```

---

## Security

- Admin area is protected by Supabase Auth + an `admin_users` table and **row-level security** (RLS) on every table.
- Customer leads are **never publicly readable** — only admins can view them.
- All server keys are kept server-side (`NEXT_PUBLIC_` prefix only for safe public keys).
- Server-side validation with Zod on every form (booking, contact, product forms).
- Rate limiting + honeypot anti-spam on public forms.
- Booking URLs and lead pages are excluded from search engine indexing.

## Useful Commands

```bash
npm run dev              # Start the dev server
npm run build            # Production build
npm run typecheck        # TypeScript check
npm run seed             # Load current stock into the database
npm run create-admin -- email password   # Add an admin account
```

---

## Future Features (not in MVP)

Comparison, "Find me a laptop", inspection reports, advanced analytics, customer reviews, online payments, WhatsApp API automation, multi-vendor support. The schema keeps room for `sales`, `inspection_reports`, `categories`, `brands` and `analytics_events` later.
