# easiEMI Storefront

A responsive product catalogue and EMI-plan selector. The app lists phones at `/`, gives every product its own stable URL, loads catalogue data through Next.js APIs, and shows a non-persistent confirmation after a plan is chosen.

## Stack and architecture

- **Frontend:** Next.js 16 App Router, React 19, Tailwind import plus custom responsive CSS.
- **Backend for frontend:** Next.js Route Handlers under `app/api`. Browser components never query Supabase directly.
- **Database and image host:** Supabase PostgreSQL and a public Supabase Storage bucket.
- **Tests:** Node's built-in test runner exercises the EMI calculation without adding a test framework dependency.

The public Supabase URL and publishable key are deliberately safe to expose to the browser. Security comes from PostgreSQL Row Level Security: anonymous users can read only active catalogue rows and cannot write to any table.

## Run locally

### 1. Install dependencies

Use Node.js 22 or newer.

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root (the two variables are already configured for this project):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Do not add a service-role key. The app performs only public, RLS-protected reads.

### 3. Apply the Supabase migrations

The migrations must run in this order:

1. `supabase/migrations/0001_catalog_schema.sql`
2. `supabase/migrations/0002_catalog_seed.sql`
3. `supabase/migrations/0003_expand_variant_matrix.sql`

The simplest option is to paste each file into the Supabase Dashboard SQL Editor and run it in order. With the Supabase CLI linked to the project, use:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The first migration creates the public `product-images` Storage bucket. Upload all six original images from `supabase/storage-assets/` to the **root** of that bucket, preserving these exact filenames:

```text
iphone-17-pro-silver.png
iphone-17-pro-cosmic-orange.png
galaxy-s24-ultra-gray.png
galaxy-s24-ultra-titanium-violet.png
pixel-9-pro-porcelain.png
pixel-9-pro-obsidian.png
```

The seed data stores only object paths; the API turns them into public Storage URLs. This prevents project-specific URLs from being baked into SQL. If you already ran the first two migrations, run only `0003_expand_variant_matrix.sql` and upload the three new color images.

### 4. Start and verify

```bash
npm run dev
npm run lint
npm run test
npm run build
```

Open [http://localhost:3000](http://localhost:3000). If a constrained Windows environment blocks Turbopack's CSS child process, verify with webpack instead:

```bash
npm run build -- --webpack
```

## Data model and design choices

| Table | Responsibility | Why it is separate |
| --- | --- | --- |
| `products` | Product identity, copy, unique slug and active state. | A stable product URL must not depend on price or stock. |
| `product_options`, `product_option_values` | Flexible attributes such as Color and Storage. | New option types do not require a database migration. |
| `product_variants` | SKU and price for the exact purchasable configuration. | Prices can differ by storage/color without duplicating product content. |
| `variant_option_values` | Links a SKU to its chosen option values. | It prevents invalid combinations and keeps the variant model normalized. |
| `variant_images` | Ordered images and Storage paths per variant. | Product imagery can change independently of pricing. |
| `emi_plan_templates` | Reusable tenure, annual interest rate, cashback and display order. | EMI rule inputs are defined once. |
| `product_emi_plans` | Which reusable plans each product offers. | Plan eligibility is explicit and does not duplicate finance inputs. |

Money is stored as integer `*_paise` columns and interest is stored as basis points. For example, ₹1,27,400 is `12740000`, and 10.5% is `1050`. This avoids float precision errors. The API derives a zero-interest instalment by dividing price by tenure; for non-zero rates it uses the standard reducing-balance EMI formula. Cashback is displayed separately and never silently changes the loan principal.

The seed creates three product URLs. Each has a complete two-color × two-storage matrix (four purchasable SKUs):

- `/products/iphone-17-pro`
- `/products/samsung-s24-ultra`
- `/products/google-pixel-9-pro`

## API reference

### `GET /api/products`

Returns active product-card data for the home catalogue.

```json
{
  "data": [
    {
      "slug": "iphone-17-pro",
      "brand": "Apple",
      "name": "iPhone 17 Pro",
      "description": "A polished flagship experience...",
      "fromPricePaise": 12740000,
      "image": {
        "url": "https://YOUR_PROJECT.supabase.co/storage/v1/object/public/product-images/iphone-17-pro-silver.png",
        "alt": "Silver iPhone 17 Pro front and back",
        "position": 0
      }
    }
  ]
}
```

### `GET /api/products/[slug]`

Returns the full selectable product data. The server calculates `monthlyInstallmentPaise` for each plan and each variant, so the browser only renders values from the API.

```json
{
  "data": {
    "product": {
      "slug": "iphone-17-pro",
      "brand": "Apple",
      "name": "iPhone 17 Pro",
      "description": "A polished flagship experience..."
    },
    "options": [
      {
        "code": "color",
        "label": "Color",
        "values": [{ "id": "...", "label": "Silver", "swatchHex": "#D9D8D2" }]
      }
    ],
    "variants": [
      {
        "id": "...",
        "sku": "IPH17P-SIL-256",
        "optionValueIds": ["..."],
        "mrpPaise": 13490000,
        "salePricePaise": 12740000,
        "images": [],
        "emiPlans": [
          {
            "id": "...",
            "tenureMonths": 6,
            "annualInterestRateBps": 0,
            "cashbackPaise": 750000,
            "monthlyInstallmentPaise": 2123333
          }
        ]
      }
    ]
  }
}
```

An invalid slug gets `400`; a well-formed unknown slug gets `404`; database/configuration failures return a generic `500` without leaking Supabase details.

## UI behavior

- The first active SKU and EMI plan are selected by default.
- Each Color × Storage choice resolves to one exact SKU. All four combinations are in stock for every seeded product.
- A color change preserves the selected storage and swaps to that finish's image. A storage change preserves the selected color and updates the SKU price, savings, and calculated EMI cards.
- The primary action opens an accessible demo confirmation dialog. It never creates a customer record, payment, or loan application.
- The page switches from a two-column gallery/purchase layout on desktop to a vertical touch-friendly layout on mobile.

## Verification checklist

Automated tests cover zero-interest calculation, 10.5% reducing-balance calculation, price changes, rounding, and invalid inputs. Before submitting, also check:

1. `/api/products` returns exactly three seeded products.
2. Each product URL returns `200`; `/products/not-a-product` shows the not-found state.
3. Each Color and Storage control remains selectable; changing Color swaps the gallery image, and changing Storage updates the active SKU, price, and EMI cards.
4. Selecting a different EMI card updates the highlighted plan and confirmation summary.
5. Mobile layout has no horizontal scroll and every control is keyboard reachable.
6. `npm run lint`, `npm run test`, and `npm run build` succeed.
