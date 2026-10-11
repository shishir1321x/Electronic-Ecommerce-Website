# Putting Voltara online (free)

The site is plain HTML/CSS/JS, so it can live on any free static host. The database is
**Supabase** (free Postgres). Total cost: $0. Time: about 20 minutes.

| Piece | Service | What it does |
|---|---|---|
| Website | Cloudflare (or GitHub Pages) | Serves the pages and photos worldwide |
| Database | Supabase | Products, prices, stock, orders, customer accounts, contact messages |

> Until you finish step 2, the site runs in **demo mode**: everything works, but orders are
> saved only in the visitor's browser.

---

## 1. Create the database (Supabase)

1. Go to **https://supabase.com**, sign up (GitHub login works) and click **New project**.
   Pick a name, set a database password (save it somewhere), choose the region closest to
   your customers, and wait for the project to start (1–2 minutes).
2. Open **SQL Editor → New query**, paste the whole contents of `supabase/setup.sql`
   from this folder, and click **Run**. You should see *Success*.
   This creates the tables, the security rules and the checkout function, and loads the
   27 products. It is safe to run again; it never overwrites your edits.
3. Find two values:
   - the **Project URL**. The surest way: look at your browser's address bar while the
     project is open. The code after `/project/` is your project ID, and the URL is
     `https://<project-id>.supabase.co`. (The **Connect** button at the top of the dashboard
     also shows it.) Don't include `/rest/v1/` at the end.
   - the **Publishable key**, under **Project Settings → API Keys** (starts with
     `sb_publishable_`; older projects call it the **anon / public** key).
4. Paste both into `assets/config.js`:

   ```js
   window.VOLTARA_CONFIG = {
     supabaseUrl: 'https://abcdefgh.supabase.co',
     supabaseAnonKey: 'paste-the-anon-or-publishable-key-here',
   };
   ```

   These two values are meant to be public. **Never** paste the `service_role` / secret key
   into the website.

5. Open `index.html` on your computer to check it works: the checkout page no longer shows
   the yellow "Demo mode" note, and orders you place appear in Supabase under
   **Table Editor → orders**.

## 2. Put the website online

### Option A: Cloudflare

1. Sign up at **https://dash.cloudflare.com** (free).
2. Go to **Workers & Pages → Create application → Upload your static files**.
   (For a `something.pages.dev` address instead, click **Continue to Pages** at the bottom of
   that screen, then **Upload assets**.)
3. Give the project a name, e.g. `voltara-store`.
4. Drag in the whole project folder (or a zip of it) and click **Deploy**.
5. Open the address Cloudflare shows, e.g. `https://voltara-store.<your-subdomain>.workers.dev`
   or `https://voltara-store.pages.dev`. Done.

**To update the site later:** open the project in Cloudflare and upload the folder again as a
new deployment.

### Option B: GitHub Pages

If the code is in a GitHub repository, GitHub can host it for free and update the site on
every push: in the repository open **Settings → Pages**, set **Source** to
**Deploy from a branch**, choose **`main`** and **`/ (root)`**, and click **Save**. After a
minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.
Free GitHub accounts need a public repository for this.

Netlify Drop (app.netlify.com/drop) also works, but its free plan runs on monthly credits,
so heavy traffic can pause the site.

## 3. Finish the account settings (Supabase → Authentication)

1. **URL Configuration:** set **Site URL** to your live address (your Cloudflare or GitHub
   Pages link) and add it under **Redirect URLs**. Confirmation emails will then link back
   to your store.
2. **Email confirmation:** by default new customers must click a link in an email before
   they can sign in. Supabase's built-in email sender only sends a few emails per hour and is
   meant for testing. For a demo or class project you can switch off **Confirm email**
   (Authentication → Sign In / Providers → Email). For a real store, connect your own email
   provider under **Authentication → Emails → SMTP Settings**.

---

## Running the store from the Supabase dashboard

Everything is in **Table Editor**:

| Table | What you can do |
|---|---|
| `orders` | See every order. Change **status** to `processing`, `shipped`, `delivered` or `cancelled`; customers see the progress bar update on the Order Status page. |
| `order_items` | The products, options and prices in each order. |
| `products` | Change **price**, **stock** (empty = unlimited, `0` = sold out), **active** (untick to hide), **is_new**, names and taglines. Changes show on the site at the next page load. |
| `option_groups` | Storage/size/memory choices and their extra prices, per category. |
| `contact_messages` | Messages sent from the Contact Us page. |

Customer accounts are under **Authentication → Users**.

**Adding a new product:** insert a row in `products` with a unique `id` (e.g. `nova-x-ultra`),
one of the existing categories (`phones`, `tablets`, `computers`, `audio`, `wearables`,
`cameras`, `gaming`, `accessories`), a `price`, and finish keys such as `{black,silver}`
(the full list is at the top of `assets/data.js`). For its photo, upload an image to
**Storage** (a public bucket) and paste the image's public URL into the `image` column.

## How it is protected

- Prices are never trusted from the browser. Checkout calls the database function
  `place_order`, which looks up every price and option itself, checks stock, applies the
  VOLT10 code (first order per email only) and saves the order in one step.
- Row Level Security: visitors can read the catalog and send messages, but cannot read or
  change orders. Signed-in customers can read only their own orders. Guests can look up an
  order only with both the order number and the email used.
- Payment is "pay on delivery"; the site never collects card details. To take real card
  payments later, add Stripe Checkout through a Supabase Edge Function.
- Anyone can submit the checkout and contact forms. For a real store, consider adding a
  CAPTCHA and email notifications.

## Free plan limits worth knowing

- Supabase pauses free projects after **7 days without any activity**. Open the dashboard and
  click **Restore** to wake it. The free plan also caps the database at 500 MB, plenty for a
  small store.
- Cloudflare's free plan allows up to 20,000 files per site and 25 MiB per file; this site
  uses under 100 files and its largest file is about 1.2 MB.
- Limits change over time, so check each provider's pricing page before relying on them for
  a real business.
