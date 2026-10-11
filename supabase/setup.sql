-- =====================================================================
--  Voltara store database
--  Run ONCE in Supabase: SQL Editor -> New query -> paste this file -> Run.
--  Safe to re-run: tables use IF NOT EXISTS and the seed never overwrites
--  rows you have edited.
-- =====================================================================

-- ---------- Catalog ----------
create table if not exists public.products (
  id          text primary key,
  category    text not null,                    -- phones, tablets, computers, audio, wearables, cameras, gaming, accessories
  name        text not null,
  type        text not null default 'phone',
  price       numeric(10,2) not null check (price >= 0),
  is_new      boolean not null default false,
  tagline     text not null default '',
  description text not null default '',
  highlights  jsonb not null default '[]',      -- [["6.7″", "ProMotion OLED display"], ...]
  finishes    text[] not null default '{}',     -- finish keys, e.g. {black,silver}
  image       text,                             -- optional image URL; empty = assets/img/<id>.jpg
  image_pos   text,                             -- optional crop focus, e.g. '50% 40%'
  no_options  boolean not null default false,   -- true = ignore the category's storage/size options
  stock       integer check (stock >= 0),       -- null = unlimited
  active      boolean not null default true,    -- false = hidden from the store
  sort        integer not null default 0
);

create table if not exists public.option_groups (
  category text not null,
  position integer not null,                    -- 0-based order of the option group
  label    text not null,                       -- e.g. 'Storage'
  choices  jsonb not null,                      -- [["128GB", 0], ["256GB", 100], ...] = [name, extra price]
  primary key (category, position)
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  order_no   text unique not null,
  user_id    uuid references auth.users (id) on delete set null,
  email      text not null,
  name       text not null,
  phone      text,
  address    jsonb not null default '{}',
  delivery   text not null default 'delivery' check (delivery in ('delivery', 'pickup')),
  payment    text not null default 'pay_on_delivery',
  promo      text,
  subtotal   numeric(10,2) not null,
  discount   numeric(10,2) not null default 0,
  total      numeric(10,2) not null,
  status     text not null default 'placed' check (status in ('placed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  name       text not null,
  finish     text not null,
  options    text not null default '',
  unit_price numeric(10,2) not null,
  qty        integer not null check (qty between 1 and 10)
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_email_idx on public.orders (email);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- Contact form ----------
create table if not exists public.contact_messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 200),
  message    text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security: who may read or write what ----------
alter table public.products         enable row level security;
alter table public.option_groups    enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Catalog is public" on public.products;
create policy "Catalog is public" on public.products for select using (active);

drop policy if exists "Options are public" on public.option_groups;
create policy "Options are public" on public.option_groups for select using (true);

drop policy if exists "Customers read their own orders" on public.orders;
create policy "Customers read their own orders" on public.orders
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Customers read their own order items" on public.order_items;
create policy "Customers read their own order items" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);

-- Orders are never written directly from the browser: only through place_order() below.

-- ---------- Checkout: prices come from the database, never from the browser ----------
create or replace function public.place_order(p_items jsonb, p_customer jsonb, p_promo text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  it        jsonb;
  prod      public.products%rowtype;
  grp       record;
  v_email   text := lower(trim(coalesce(p_customer ->> 'email', '')));
  v_name    text := trim(coalesce(p_customer ->> 'name', ''));
  v_promo   text := nullif(upper(trim(coalesce(p_promo, ''))), '');
  v_qty     integer;
  v_idx     integer;
  v_unit    numeric(10,2);
  v_opts    text;
  v_finish  text;
  v_sub     numeric(10,2) := 0;
  v_disc    numeric(10,2) := 0;
  v_lines   jsonb := '[]';
  v_order   uuid;
  v_no      text;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address.'; end if;
  if v_name = '' or char_length(v_name) > 100 then raise exception 'Please enter your name.'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your bag is empty.'; end if;
  if jsonb_array_length(p_items) > 30 then raise exception 'Too many items in one order.'; end if;

  for it in select value from jsonb_array_elements(p_items) loop
    select * into prod from public.products where id = it ->> 'id' and active for update;
    if not found then raise exception 'An item in your bag is no longer available.'; end if;

    v_qty := case when (it ->> 'qty') ~ '^\d{1,2}$' then (it ->> 'qty')::integer else 0 end;
    if v_qty not between 1 and 10 then raise exception 'Quantity must be between 1 and 10.'; end if;
    if prod.stock is not null then
      if prod.stock < v_qty then raise exception '% is out of stock.', prod.name; end if;
      update public.products set stock = stock - v_qty where id = prod.id;
    end if;

    v_idx := case when (it ->> 'f') ~ '^\d{1,2}$' then (it ->> 'f')::integer else 0 end;
    if v_idx >= coalesce(array_length(prod.finishes, 1), 0) then v_idx := 0; end if;
    v_finish := coalesce(prod.finishes[v_idx + 1], 'standard');

    v_unit := prod.price;
    v_opts := '';
    if not prod.no_options then
      for grp in select position, choices from public.option_groups where category = prod.category order by position loop
        v_idx := case when (it -> 'o' ->> grp.position) ~ '^\d{1,2}$' then (it -> 'o' ->> grp.position)::integer else 0 end;
        if v_idx >= jsonb_array_length(grp.choices) then v_idx := 0; end if;
        v_unit := v_unit + (grp.choices -> v_idx ->> 1)::numeric;
        v_opts := v_opts || case when v_opts = '' then '' else ' · ' end || (grp.choices -> v_idx ->> 0);
      end loop;
    end if;

    v_sub := v_sub + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object('product_id', prod.id, 'name', prod.name, 'finish', v_finish,
                                             'options', v_opts, 'unit_price', v_unit, 'qty', v_qty);
  end loop;

  -- VOLT10: 10% off, first order per email address only
  if v_promo = 'VOLT10' and not exists (select 1 from public.orders where email = v_email and promo = 'VOLT10') then
    v_disc := round(v_sub * 0.10, 2);
  else
    v_promo := null;
  end if;

  loop
    v_no := 'W' || lpad(floor(random() * 1000000000)::bigint::text, 9, '0');
    exit when not exists (select 1 from public.orders where order_no = v_no);
  end loop;

  insert into public.orders (order_no, user_id, email, name, phone, address, delivery, promo, subtotal, discount, total)
  values (v_no, auth.uid(), v_email, v_name, nullif(trim(coalesce(p_customer ->> 'phone', '')), ''),
          coalesce(p_customer -> 'address', '{}'),
          case when p_customer ->> 'delivery' = 'pickup' then 'pickup' else 'delivery' end,
          v_promo, v_sub, v_disc, v_sub - v_disc)
  returning id into v_order;

  insert into public.order_items (order_id, product_id, name, finish, options, unit_price, qty)
  select v_order, l ->> 'product_id', l ->> 'name', l ->> 'finish', l ->> 'options', (l ->> 'unit_price')::numeric, (l ->> 'qty')::integer
  from jsonb_array_elements(v_lines) as l;

  return jsonb_build_object('order_no', v_no, 'subtotal', v_sub, 'discount', v_disc, 'total', v_sub - v_disc,
                            'promo_applied', v_promo is not null);
end;
$$;

-- ---------- Order lookup for guests: needs the order number AND the email ----------
create or replace function public.get_order(p_order_no text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'order_no', o.order_no, 'created_at', o.created_at, 'status', o.status, 'delivery', o.delivery,
    'subtotal', o.subtotal, 'discount', o.discount, 'total', o.total,
    'items', coalesce((select jsonb_agg(jsonb_build_object('product_id', i.product_id, 'name', i.name, 'finish', i.finish,
                                                           'options', i.options, 'unit_price', i.unit_price, 'qty', i.qty) order by i.id)
                       from public.order_items i where i.order_id = o.id), '[]'::jsonb))
  from public.orders o
  where o.order_no = upper(trim(p_order_no)) and o.email = lower(trim(p_email));
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public;
revoke all on function public.get_order(text, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;
grant execute on function public.get_order(text, text) to anon, authenticated;

-- ---------- Starter catalog: edit prices, stock and text later in Table Editor ----------
insert into public.products (id, category, name, type, price, is_new, tagline, description, highlights, finishes, image_pos, no_options, stock, sort) values
  ('nova-x-pro', 'phones', 'Nova X Pro', 'phone', 999, true, 'Titanium. Brilliant. Pro.', 'A titanium design, a 6.7″ ProMotion display and a 50MP camera system tuned for low light.', '[["6.7″","ProMotion OLED display"],["50MP","triple camera system"],["29 hr","video playback"],["1TB","maximum storage"]]'::jsonb, array['titanium', 'blueTi', 'black', 'white']::text[], '38% 50%', false, 100, 1),
  ('nova-x', 'phones', 'Nova X', 'phone', 799, true, 'A total powerhouse.', 'An aluminium design, a super-bright 6.1″ display and a dual camera that nails every shot.', '[["6.1″","Super-bright OLED"],["48MP","dual camera system"],["22 hr","video playback"],["512GB","maximum storage"]]'::jsonb, array['black', 'pink', 'sky', 'green']::text[], null, false, 100, 2),
  ('nova-x-mini', 'phones', 'Nova X Mini', 'phone', 649, false, 'Small wonder.', 'Everything you love about Nova in a size that fits any pocket.', '[["5.4″","OLED display"],["48MP","main camera"],["18 hr","video playback"],["256GB","maximum storage"]]'::jsonb, array['starlight', 'purple', 'black']::text[], null, false, 100, 3),
  ('nova-se', 'phones', 'Nova SE', 'phone', 429, false, 'Serious value.', 'The essentials, done brilliantly, at a price that makes sense.', '[["6.1″","LCD display"],["12MP","advanced camera"],["20 hr","video playback"],["256GB","maximum storage"]]'::jsonb, array['black', 'white', 'coral']::text[], null, false, 100, 4),
  ('orbit-pad-pro', 'tablets', 'Orbit Pad Pro', 'tablet', 999, true, 'Thinpossible.', 'Our thinnest tablet ever, with a tandem OLED display and laptop-class performance.', '[["13″","Tandem OLED display"],["5.1mm","impossibly thin"],["10 hr","battery life"],["2TB","maximum storage"]]'::jsonb, array['black', 'silver']::text[], null, false, 100, 5),
  ('orbit-pad-air', 'tablets', 'Orbit Pad Air', 'tablet', 599, true, 'Serious power. Seriously light.', 'A bright 11″ Liquid display, all-day battery and support for stylus and keyboard.', '[["11″","Liquid display"],["462g","featherlight"],["10 hr","battery life"],["1TB","maximum storage"]]'::jsonb, array['black', 'sky', 'purple', 'starlight']::text[], null, false, 100, 6),
  ('orbit-pad-mini', 'tablets', 'Orbit Pad Mini', 'tablet', 499, false, 'Mega power. Mini sized.', 'All the power of Orbit in an 8.3″ design you can hold in one hand.', '[["8.3″","Liquid display"],["293g","one-hand light"],["10 hr","battery life"],["512GB","maximum storage"]]'::jsonb, array['starlight', 'pink', 'purple']::text[], null, false, 100, 7),
  ('nova-book-14', 'computers', 'Nova Book 14', 'laptop', 1299, true, 'Light. Bright. Full of might.', 'Impossibly thin, with a 3K Liquid display and up to 22 hours of battery life.', '[["22 hr","battery life"],["3K","120Hz Liquid display"],["16-core","neural engine"],["1.2kg","ultralight design"]]'::jsonb, array['silver', 'black', 'starlight', 'sky']::text[], null, false, 100, 8),
  ('nova-book-pro-16', 'computers', 'Nova Book Pro 16', 'laptop', 2499, true, 'Pro to the max.', 'Our most powerful laptop, with a 16″ XDR display and desktop-class graphics.', '[["16″","XDR display"],["24 hr","battery life"],["40-core","GPU"],["128GB","unified memory"]]'::jsonb, array['black', 'silver']::text[], null, false, 100, 9),
  ('nova-one', 'computers', 'Nova One', 'monitor', 1299, false, 'All-in-one. All in colour.', 'A strikingly thin all-in-one with a 24″ 4.5K display in seven vibrant colours.', '[["24″","4.5K Liquid display"],["11.5mm","thin design"],["12MP","Center Stage camera"],["6","speaker sound system"]]'::jsonb, array['sky', 'green', 'pink', 'purple', 'orange']::text[], null, false, 100, 10),
  ('lumen-display-27', 'computers', 'Lumen Display 27', 'monitor', 1599, false, 'A 5K view of everything.', 'A 27″ 5K display with factory-calibrated colour and single-cable USB-C connectivity.', '[["5K","Retina-class display"],["600","nits brightness"],["96W","USB-C charging"],["P3","wide colour"]]'::jsonb, array['silver']::text[], null, true, 100, 11),
  ('aether-max', 'audio', 'Aether Max', 'headphones', 449, true, 'Hear every detail. Hear nothing else.', 'Over-ear headphones with adaptive noise cancellation, spatial audio and a 40-hour battery.', '[["40 hr","listening time"],["2×","more noise cancellation"],["3D","spatial audio"],["5 min","charge = 4 hr play"]]'::jsonb, array['black', 'silver', 'sky', 'coral']::text[], null, false, 100, 12),
  ('pulse-buds-pro', 'audio', 'Pulse Buds Pro', 'earbuds', 249, true, 'Rebuilt for sound.', 'Pro-level noise cancellation, adaptive audio and a case you can find anywhere.', '[["2×","noise cancellation"],["30 hr","with the case"],["IP54","dust and water"],["H3","audio chip"]]'::jsonb, array['white']::text[], '55% 45%', false, 100, 13),
  ('pulse-buds', 'audio', 'Pulse Buds', 'earbuds', 179, false, 'Tiny buds. Huge sound.', 'True wireless earbuds with active noise cancellation and a wireless charging case.', '[["ANC","noise cancelling"],["30 hr","with the case"],["IPX4","sweat resistant"],["Qi","wireless charging"]]'::jsonb, array['white', 'black']::text[], null, false, 100, 14),
  ('quanta-sound-one', 'audio', 'Quanta Sound One', 'speaker', 299, false, 'Fills the room. Not the shelf.', 'A smart speaker with 360° sound and room-sensing that tunes itself to your space.', '[["360°","room-filling sound"],["7","beam-forming tweeters"],["Auto","room calibration"],["Multi","room pairing"]]'::jsonb, array['chalk', 'coral', 'black', 'sage']::text[], null, false, 100, 15),
  ('halo-watch-ultra', 'wearables', 'Halo Watch Ultra', 'watch', 799, true, 'Next-level adventure.', 'A rugged titanium case, a 3000-nit display and up to 72 hours of battery for every expedition.', '[["49mm","titanium case"],["3000","nits brightness"],["72 hr","battery life"],["100m","water resistance"]]'::jsonb, array['black', 'titanium']::text[], '70% 50%', false, 100, 16),
  ('halo-watch-3', 'wearables', 'Halo Watch 3', 'watch', 399, false, 'Smarter. Brighter. Mightier.', 'Advanced health features, an always-on display and dual-band GPS in a featherlight case.', '[["ECG","heart health"],["2000","nits brightness"],["36 hr","battery life"],["GPS","dual-band precision"]]'::jsonb, array['black', 'silver', 'rose', 'starlight']::text[], null, false, 100, 17),
  ('halo-watch-se', 'wearables', 'Halo Watch SE', 'watch', 249, false, 'A great deal to love.', 'Essential health and fitness features at an exceptional price.', '[["24/7","heart rate"],["Crash","detection"],["18 hr","battery life"],["50m","water resistance"]]'::jsonb, array['white', 'black', 'silver']::text[], null, false, 100, 18),
  ('lumen-z7', 'cameras', 'Lumen Z7', 'camera', 1899, false, 'Every frame, a masterpiece.', 'A full-frame mirrorless camera with 8K video and in-body image stabilisation.', '[["45MP","full-frame sensor"],["8K","video recording"],["8-stop","stabilisation"],["30fps","burst shooting"]]'::jsonb, array['black', 'silver']::text[], null, false, 100, 19),
  ('lumen-z5', 'cameras', 'Lumen Z5', 'camera', 1199, true, 'Big sensor. Small body.', 'Full-frame image quality in a travel-friendly body that weighs just 480 grams.', '[["33MP","full-frame sensor"],["4K120","video recording"],["480g","travel weight"],["AI","subject tracking"]]'::jsonb, array['black', 'silver']::text[], '42% 40%', false, 100, 20),
  ('aether-sky', 'cameras', 'Aether Sky Drone', 'drone', 799, true, 'The world, from above.', 'A foldable 4K drone under 250 g with omnidirectional obstacle sensing.', '[["4K60","HDR camera"],["249g","no registration"],["34 min","flight time"],["20 km","video range"]]'::jsonb, array['silver', 'black']::text[], '45% 50%', false, 100, 21),
  ('vertex-console', 'gaming', 'Vertex Console', 'console', 499, true, 'Next-gen. Now.', 'Ray-traced 4K gaming at 120fps with a lightning-fast SSD and whisper-quiet cooling.', '[["4K120","ray-traced gaming"],["2TB","ultra-fast SSD"],["8K","output ready"],["0.5s","load times"]]'::jsonb, array['black', 'white']::text[], null, false, 100, 22),
  ('vertex-vision', 'gaming', 'Vertex Vision VR', 'vr', 699, true, 'Step inside the game.', 'A wireless headset with dual 4K micro-OLED displays and precise hand tracking.', '[["2×4K","micro-OLED displays"],["120Hz","refresh rate"],["Hands","tracking, no controllers"],["2 hr","battery life"]]'::jsonb, array['white', 'black']::text[], null, false, 100, 23),
  ('vertex-controller', 'gaming', 'Vertex Controller', 'gamepad', 79, false, 'Precision in your palms.', 'A pro wireless controller with hall-effect sticks and remappable back paddles.', '[["0","stick drift"],["4","back paddles"],["40 hr","battery life"],["1ms","wireless latency"]]'::jsonb, array['white', 'black', 'coral']::text[], '60% 50%', true, 100, 24),
  ('vertex-keys', 'accessories', 'Vertex Keys', 'keyboard', 149, false, 'Type beautifully.', 'A slim wireless keyboard with a satisfying low-profile feel and month-long battery.', '[["1 mo","battery life"],["3","paired devices"],["Touch","fingerprint key"],["USB-C","charging"]]'::jsonb, array['black', 'silver']::text[], null, false, 100, 25),
  ('volt-mouse', 'accessories', 'Volt Mouse', 'mouse', 99, false, 'Glides like a dream.', 'A Multi-Touch surface and an optimised foot design for smooth, precise tracking.', '[["Multi","Touch surface"],["2 mo","battery life"],["8K","DPI sensor"],["99g","lightweight"]]'::jsonb, array['black', 'white']::text[], null, false, 100, 26),
  ('volt-charger', 'accessories', 'Volt MagCharge 3-in-1', 'charger', 129, true, 'Charge everything. Beautifully.', 'Charge your phone, watch and earbuds at once on one elegant magnetic pad.', '[["3","devices at once"],["25W","fast charging"],["Mag","snap-on alignment"],["Fold","travel design"]]'::jsonb, array['white', 'black']::text[], null, false, 100, 27)
on conflict (id) do nothing;

insert into public.option_groups (category, position, label, choices) values
  ('phones', 0, 'Storage', '[["128GB",0],["256GB",100],["512GB",300],["1TB",500]]'::jsonb),
  ('tablets', 0, 'Storage', '[["128GB",0],["256GB",100],["512GB",300],["1TB",500]]'::jsonb),
  ('tablets', 1, 'Connectivity', '[["Wi‑Fi",0],["Wi‑Fi + 5G",150]]'::jsonb),
  ('computers', 0, 'Memory', '[["16GB",0],["24GB",200],["32GB",400]]'::jsonb),
  ('computers', 1, 'Storage', '[["512GB",0],["1TB",200],["2TB",600]]'::jsonb),
  ('wearables', 0, 'Case size', '[["41mm",0],["45mm",30]]'::jsonb),
  ('wearables', 1, 'Connectivity', '[["GPS",0],["GPS + Cellular",100]]'::jsonb),
  ('cameras', 0, 'Kit', '[["Body only",0],["With 24–70mm lens",600]]'::jsonb),
  ('gaming', 0, 'Storage', '[["1TB",0],["2TB",150]]'::jsonb)
on conflict (category, position) do nothing;
