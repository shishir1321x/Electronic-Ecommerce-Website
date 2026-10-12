# Voltara — Electronics Store

A complete online store for a fictional electronics brand: phones, tablets, computers, audio,
wearables, cameras, gaming gear and accessories. It's built with plain HTML, CSS and
JavaScript (no build step) and uses a free [Supabase](https://supabase.com) database for
products, orders and customer accounts.

Landing page: https://votarastore.saifulalams814.workers.dev/

## Features

- **Apple-inspired design:** frosted-glass navigation with a dropdown menu for every category, large type, and layouts that adapt down to phone screens.
- **27 products in 8 categories,** each with its own page, plus category pages, side-by-side comparison, search, filters and sorting.
- **Animated real-world backgrounds:** northern lights, a starry sky, clouds, sunbeams, an ocean sunset, city lights, rain and snow, drawn on canvas over real photos. Scenes pause when off-screen and stay still for visitors who prefer reduced motion.
- **Product configurator:** pick a finish plus storage, memory or size, with live pricing.
- **Bag and checkout:** delivery or store pickup, promo code `VOLT10` (10% off a customer's first order), and pay on delivery.
- **Order tracking** by order number and email, with a progress bar that follows the status you set in the database.
- **Customer accounts** (sign up and sign in) that list the customer's own orders.
- **Secure backend:** the database recalculates prices, options and stock at checkout, and row-level security keeps each customer's orders private.
- **Demo mode:** with no database configured, everything still works and orders are saved in the browser.

## Tech stack

| Part | Uses |
|---|---|
| Front end | HTML, CSS, vanilla JavaScript, Canvas 2D |
| Database and accounts | Supabase (Postgres, Auth, row-level security) via `supabase-js` 2.115.0 |
| Hosting | Any static host: Cloudflare, GitHub Pages, Netlify |
| Fonts and photos | Inter (Google Fonts), photos from Unsplash |

## Run it locally

No install needed: open `index.html` in a browser.

To serve it like a real website instead, run any static server from the project folder, for example:

```bash
npx serve .
# or
python -m http.server 8000
```

## Connect the database

1. Create a free Supabase project.
2. In its **SQL Editor**, run [`supabase/setup.sql`](supabase/setup.sql). It creates the tables, security rules and checkout function, and loads the 27 products.
3. Put your project URL and **publishable** key in [`assets/config.js`](assets/config.js).

The publishable key is meant to be public, so it's fine to commit it. **Never commit the secret (`service_role`) key.**

The full walkthrough, including hosting and running the store from the Supabase dashboard, is in [DEPLOY.md](DEPLOY.md).

## Project structure

```text
├── index.html           Home page
├── category.html        Category pages        category.html?c=phones
├── product.html         Product pages         product.html?id=nova-x-pro
├── compare.html         Compare models        compare.html?c=audio
├── checkout.html        Checkout
├── page.html            Support, account, order status and other pages   page.html?p=support
├── assets/
│   ├── config.js        Supabase project URL and publishable key
│   ├── data.js          Catalog, categories, menus and links
│   ├── db.js            Database layer (Supabase)
│   ├── core.js          Shared navigation, dropdowns, search, bag and footer
│   ├── fx.js            Animated backgrounds
│   ├── home.js, catalog.js, product.js, info.js, checkout.js   Page scripts
│   ├── styles.css, pages.css
│   └── img/             Product and scenery photos
├── supabase/setup.sql   Database tables, security rules, checkout function and starter catalog
└── DEPLOY.md            Hosting and database guide
```

## Managing the store

Everything happens in the Supabase **Table Editor**: change an order's `status` (customers see
the progress bar update), edit product `price` and `stock` (`0` = sold out), hide a product by
unticking `active`, and read messages sent from the contact form. See
[DEPLOY.md](DEPLOY.md#running-the-store-from-the-supabase-dashboard) for details.

## Credits and license

- Product and scenery photos from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license). Voltara and all product names are fictional; the photos show real devices for illustration only.
- [Inter](https://rsms.me/inter/) font via Google Fonts, and [supabase-js](https://github.com/supabase/supabase-js) (MIT).
- The code is released under the [MIT License](LICENSE). The photos in `assets/img/` are not covered by it.

This is a demo store: it doesn't take real payments.


