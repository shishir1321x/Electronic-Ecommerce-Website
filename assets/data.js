/* ================= Catalog data ================= */
const F = {
  titanium: { name: 'Natural Titanium', c: ['#d6d1c8', '#8c877f'] },
  blueTi: { name: 'Blue Titanium', c: ['#56637a', '#2c3444'] },
  black: { name: 'Midnight', c: ['#4a4b50', '#1c1c1e'] },
  silver: { name: 'Silver', c: ['#eceef1', '#a7abb3'] },
  starlight: { name: 'Starlight', c: ['#f4ece0', '#c9bda8'] },
  white: { name: 'White', c: ['#ffffff', '#d1d1d6'] },
  rose: { name: 'Rose Gold', c: ['#f4d3c8', '#c48e7d'] },
  sky: { name: 'Sky Blue', c: ['#cfe0f0', '#8aa7c4'] },
  coral: { name: 'Coral', c: ['#ffb199', '#e8573f'] },
  sage: { name: 'Sage', c: ['#d5e0cf', '#8ea283'] },
  purple: { name: 'Purple', c: ['#d9cdf0', '#9b84c7'] },
  pink: { name: 'Pink', c: ['#f8d7e3', '#d993ad'] },
  green: { name: 'Alpine Green', c: ['#cfe3d4', '#7fa78b'] },
  orange: { name: 'Sunset Orange', c: ['#ffc9a3', '#f07b3f'] },
  chalk: { name: 'Chalk Gray', c: ['#d9d9d6', '#9a9a96'] },
};

/* fx = the animated "world" behind each category's pages */
const CATS = [
  { slug: 'phones', name: 'Phones', fx: 'aurora', dark: 1, tagline: 'Designed to be loved.', hero: 'nova-x-pro' },
  { slug: 'tablets', name: 'Tablets', fx: 'clouds', tagline: 'Lovable. Drawable. Magical.', hero: 'orbit-pad-pro' },
  { slug: 'computers', name: 'Computers', fx: 'rays', dark: 1, tagline: 'Power to the pros. And everyone else.', hero: 'nova-book-14' },
  { slug: 'audio', name: 'Audio', fx: 'waves', dark: 1, tagline: 'Sound that moves you.', hero: 'aether-max' },
  { slug: 'wearables', name: 'Wearables', fx: 'bokeh', dark: 1, tagline: 'Your health, on your wrist.', hero: 'halo-watch-ultra' },
  { slug: 'cameras', name: 'Cameras', fx: 'stars', dark: 1, tagline: 'Capture the universe.', hero: 'lumen-z7' },
  { slug: 'gaming', name: 'Gaming', fx: 'rain', dark: 1, tagline: 'Play without limits.', hero: 'vertex-console' },
  { slug: 'accessories', name: 'Accessories', fx: 'snow', tagline: 'The perfect companions.', hero: 'volt-charger' },
];

const P = (id, name, cat, type, price, isNew, tagline, fin, desc, hl, extra = {}) =>
  ({ id, name, cat, type, price, isNew, tagline, finishes: fin.map((k) => F[k]), desc, hl, img: `assets/img/${id}.jpg`, imgS: `assets/img/${id}-s.jpg`, ...extra });

const PRODUCTS = [
  P('nova-x-pro', 'Nova X Pro', 'phones', 'phone', 999, 1, 'Titanium. Brilliant. Pro.', ['titanium', 'blueTi', 'black', 'white'], 'A titanium design, a 6.7″ ProMotion display and a 50MP camera system tuned for low light.', [['6.7″', 'ProMotion OLED display'], ['50MP', 'triple camera system'], ['29 hr', 'video playback'], ['1TB', 'maximum storage']]),
  P('nova-x', 'Nova X', 'phones', 'phone', 799, 1, 'A total powerhouse.', ['black', 'pink', 'sky', 'green'], 'An aluminium design, a super-bright 6.1″ display and a dual camera that nails every shot.', [['6.1″', 'Super-bright OLED'], ['48MP', 'dual camera system'], ['22 hr', 'video playback'], ['512GB', 'maximum storage']]),
  P('nova-x-mini', 'Nova X Mini', 'phones', 'phone', 649, 0, 'Small wonder.', ['starlight', 'purple', 'black'], 'Everything you love about Nova in a size that fits any pocket.', [['5.4″', 'OLED display'], ['48MP', 'main camera'], ['18 hr', 'video playback'], ['256GB', 'maximum storage']]),
  P('nova-se', 'Nova SE', 'phones', 'phone', 429, 0, 'Serious value.', ['black', 'white', 'coral'], 'The essentials, done brilliantly, at a price that makes sense.', [['6.1″', 'LCD display'], ['12MP', 'advanced camera'], ['20 hr', 'video playback'], ['256GB', 'maximum storage']]),

  P('orbit-pad-pro', 'Orbit Pad Pro', 'tablets', 'tablet', 999, 1, 'Thinpossible.', ['black', 'silver'], 'Our thinnest tablet ever, with a tandem OLED display and laptop-class performance.', [['13″', 'Tandem OLED display'], ['5.1mm', 'impossibly thin'], ['10 hr', 'battery life'], ['2TB', 'maximum storage']]),
  P('orbit-pad-air', 'Orbit Pad Air', 'tablets', 'tablet', 599, 1, 'Serious power. Seriously light.', ['black', 'sky', 'purple', 'starlight'], 'A bright 11″ Liquid display, all-day battery and support for stylus and keyboard.', [['11″', 'Liquid display'], ['462g', 'featherlight'], ['10 hr', 'battery life'], ['1TB', 'maximum storage']]),
  P('orbit-pad-mini', 'Orbit Pad Mini', 'tablets', 'tablet', 499, 0, 'Mega power. Mini sized.', ['starlight', 'pink', 'purple'], 'All the power of Orbit in an 8.3″ design you can hold in one hand.', [['8.3″', 'Liquid display'], ['293g', 'one-hand light'], ['10 hr', 'battery life'], ['512GB', 'maximum storage']]),

  P('nova-book-14', 'Nova Book 14', 'computers', 'laptop', 1299, 1, 'Light. Bright. Full of might.', ['silver', 'black', 'starlight', 'sky'], 'Impossibly thin, with a 3K Liquid display and up to 22 hours of battery life.', [['22 hr', 'battery life'], ['3K', '120Hz Liquid display'], ['16-core', 'neural engine'], ['1.2kg', 'ultralight design']]),
  P('nova-book-pro-16', 'Nova Book Pro 16', 'computers', 'laptop', 2499, 1, 'Pro to the max.', ['black', 'silver'], 'Our most powerful laptop, with a 16″ XDR display and desktop-class graphics.', [['16″', 'XDR display'], ['24 hr', 'battery life'], ['40-core', 'GPU'], ['128GB', 'unified memory']]),
  P('nova-one', 'Nova One', 'computers', 'monitor', 1299, 0, 'All-in-one. All in colour.', ['sky', 'green', 'pink', 'purple', 'orange'], 'A strikingly thin all-in-one with a 24″ 4.5K display in seven vibrant colours.', [['24″', '4.5K Liquid display'], ['11.5mm', 'thin design'], ['12MP', 'Center Stage camera'], ['6', 'speaker sound system']]),
  P('lumen-display-27', 'Lumen Display 27', 'computers', 'monitor', 1599, 0, 'A 5K view of everything.', ['silver'], 'A 27″ 5K display with factory-calibrated colour and single-cable USB-C connectivity.', [['5K', 'Retina-class display'], ['600', 'nits brightness'], ['96W', 'USB-C charging'], ['P3', 'wide colour']], { noOpt: 1 }),

  P('aether-max', 'Aether Max', 'audio', 'headphones', 449, 1, 'Hear every detail. Hear nothing else.', ['black', 'silver', 'sky', 'coral'], 'Over-ear headphones with adaptive noise cancellation, spatial audio and a 40-hour battery.', [['40 hr', 'listening time'], ['2×', 'more noise cancellation'], ['3D', 'spatial audio'], ['5 min', 'charge = 4 hr play']]),
  P('pulse-buds-pro', 'Pulse Buds Pro', 'audio', 'earbuds', 249, 1, 'Rebuilt for sound.', ['white'], 'Pro-level noise cancellation, adaptive audio and a case you can find anywhere.', [['2×', 'noise cancellation'], ['30 hr', 'with the case'], ['IP54', 'dust and water'], ['H3', 'audio chip']]),
  P('pulse-buds', 'Pulse Buds', 'audio', 'earbuds', 179, 0, 'Tiny buds. Huge sound.', ['white', 'black'], 'True wireless earbuds with active noise cancellation and a wireless charging case.', [['ANC', 'noise cancelling'], ['30 hr', 'with the case'], ['IPX4', 'sweat resistant'], ['Qi', 'wireless charging']]),
  P('quanta-sound-one', 'Quanta Sound One', 'audio', 'speaker', 299, 0, 'Fills the room. Not the shelf.', ['chalk', 'coral', 'black', 'sage'], 'A smart speaker with 360° sound and room-sensing that tunes itself to your space.', [['360°', 'room-filling sound'], ['7', 'beam-forming tweeters'], ['Auto', 'room calibration'], ['Multi', 'room pairing']]),

  P('halo-watch-ultra', 'Halo Watch Ultra', 'wearables', 'watch', 799, 1, 'Next-level adventure.', ['black', 'titanium'], 'A rugged titanium case, a 3000-nit display and up to 72 hours of battery for every expedition.', [['49mm', 'titanium case'], ['3000', 'nits brightness'], ['72 hr', 'battery life'], ['100m', 'water resistance']]),
  P('halo-watch-3', 'Halo Watch 3', 'wearables', 'watch', 399, 0, 'Smarter. Brighter. Mightier.', ['black', 'silver', 'rose', 'starlight'], 'Advanced health features, an always-on display and dual-band GPS in a featherlight case.', [['ECG', 'heart health'], ['2000', 'nits brightness'], ['36 hr', 'battery life'], ['GPS', 'dual-band precision']]),
  P('halo-watch-se', 'Halo Watch SE', 'wearables', 'watch', 249, 0, 'A great deal to love.', ['white', 'black', 'silver'], 'Essential health and fitness features at an exceptional price.', [['24/7', 'heart rate'], ['Crash', 'detection'], ['18 hr', 'battery life'], ['50m', 'water resistance']]),

  P('lumen-z7', 'Lumen Z7', 'cameras', 'camera', 1899, 0, 'Every frame, a masterpiece.', ['black', 'silver'], 'A full-frame mirrorless camera with 8K video and in-body image stabilisation.', [['45MP', 'full-frame sensor'], ['8K', 'video recording'], ['8-stop', 'stabilisation'], ['30fps', 'burst shooting']]),
  P('lumen-z5', 'Lumen Z5', 'cameras', 'camera', 1199, 1, 'Big sensor. Small body.', ['black', 'silver'], 'Full-frame image quality in a travel-friendly body that weighs just 480 grams.', [['33MP', 'full-frame sensor'], ['4K120', 'video recording'], ['480g', 'travel weight'], ['AI', 'subject tracking']]),
  P('aether-sky', 'Aether Sky Drone', 'cameras', 'drone', 799, 1, 'The world, from above.', ['silver', 'black'], 'A foldable 4K drone under 250 g with omnidirectional obstacle sensing.', [['4K60', 'HDR camera'], ['249g', 'no registration'], ['34 min', 'flight time'], ['20 km', 'video range']]),

  P('vertex-console', 'Vertex Console', 'gaming', 'console', 499, 1, 'Next-gen. Now.', ['black', 'white'], 'Ray-traced 4K gaming at 120fps with a lightning-fast SSD and whisper-quiet cooling.', [['4K120', 'ray-traced gaming'], ['2TB', 'ultra-fast SSD'], ['8K', 'output ready'], ['0.5s', 'load times']]),
  P('vertex-vision', 'Vertex Vision VR', 'gaming', 'vr', 699, 1, 'Step inside the game.', ['white', 'black'], 'A wireless headset with dual 4K micro-OLED displays and precise hand tracking.', [['2×4K', 'micro-OLED displays'], ['120Hz', 'refresh rate'], ['Hands', 'tracking, no controllers'], ['2 hr', 'battery life']]),
  P('vertex-controller', 'Vertex Controller', 'gaming', 'gamepad', 79, 0, 'Precision in your palms.', ['white', 'black', 'coral'], 'A pro wireless controller with hall-effect sticks and remappable back paddles.', [['0', 'stick drift'], ['4', 'back paddles'], ['40 hr', 'battery life'], ['1ms', 'wireless latency']], { noOpt: 1 }),

  P('vertex-keys', 'Vertex Keys', 'accessories', 'keyboard', 149, 0, 'Type beautifully.', ['black', 'silver'], 'A slim wireless keyboard with a satisfying low-profile feel and month-long battery.', [['1 mo', 'battery life'], ['3', 'paired devices'], ['Touch', 'fingerprint key'], ['USB-C', 'charging']]),
  P('volt-mouse', 'Volt Mouse', 'accessories', 'mouse', 99, 0, 'Glides like a dream.', ['black', 'white'], 'A Multi-Touch surface and an optimised foot design for smooth, precise tracking.', [['Multi', 'Touch surface'], ['2 mo', 'battery life'], ['8K', 'DPI sensor'], ['99g', 'lightweight']]),
  P('volt-charger', 'Volt MagCharge 3-in-1', 'accessories', 'charger', 129, 1, 'Charge everything. Beautifully.', ['white', 'black'], 'Charge your phone, watch and earbuds at once on one elegant magnetic pad.', [['3', 'devices at once'], ['25W', 'fast charging'], ['Mag', 'snap-on alignment'], ['Fold', 'travel design']]),
];

/* Photos: Unsplash (Unsplash License), stored in assets/img. Each product has a large (1800w)
   and a small (700w, "-s") version. POS sets the focal point when a photo is cropped. */
const POS = { 'nova-x-pro': '38% 50%', 'halo-watch-ultra': '70% 50%', 'aether-sky': '45% 50%', 'lumen-z5': '42% 40%', 'vertex-controller': '60% 50%', 'pulse-buds-pro': '55% 45%' };
PRODUCTS.forEach((p) => { p.pos = POS[p.id] || '50% 50%'; });
const WORLD = Object.fromEntries(['aurora', 'stars', 'clouds', 'rays', 'waves', 'bokeh', 'rain', 'snow'].map((k) => [k, `assets/img/w-${k}.jpg`]));
const pic = (p, large = 0) =>
  `<img class="pic" src="${large ? p.img : p.imgS}" alt="${p.name}" loading="${large ? 'eager' : 'lazy'}" decoding="async" style="object-position:${p.pos}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'">`;

/* Configurable options per category: [label, [[choice, priceDelta], ...]] */
const OPTS = {
  phones: [['Storage', [['128GB', 0], ['256GB', 100], ['512GB', 300], ['1TB', 500]]]],
  tablets: [['Storage', [['128GB', 0], ['256GB', 100], ['512GB', 300], ['1TB', 500]]], ['Connectivity', [['Wi‑Fi', 0], ['Wi‑Fi + 5G', 150]]]],
  computers: [['Memory', [['16GB', 0], ['24GB', 200], ['32GB', 400]]], ['Storage', [['512GB', 0], ['1TB', 200], ['2TB', 600]]]],
  wearables: [['Case size', [['41mm', 0], ['45mm', 30]]], ['Connectivity', [['GPS', 0], ['GPS + Cellular', 100]]]],
  cameras: [['Kit', [['Body only', 0], ['With 24–70mm lens', 600]]]],
  gaming: [['Storage', [['1TB', 0], ['2TB', 150]]]],
  audio: [], accessories: [],
};

const ICONS = {
  truck: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  returns: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  gift: '<path d="M4 11h16v9H4zM2.5 7h19v4h-19zM12 7v13"/><path d="M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
  chat: '<path d="M4 5h16v10H9l-5 4z"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" class="ico">${ICONS[k] || ICONS.spark}</svg>`;

/* Info pages (page.html?p=...) */
const INFO = {
  support: { fx: 'clouds', title: 'Voltara Support', sub: 'We’re here to help. Choose a product to get started.', special: 'support',
    blocks: [['chat', 'Chat with a Specialist', 'Get answers in minutes from people who know your device inside out.'], ['wrench', 'Book a repair', 'Mail-in or in-store repairs with genuine parts, usually within 3 days.'], ['shield', 'Check your coverage', 'See your warranty and VoltCare+ status in one place.']] },
  'trade-in': { fx: 'rays', dark: 1, title: 'Voltara Trade In', sub: 'Upgrade and save. It’s that easy.', special: 'tradein',
    blocks: [['swap', 'Get an estimate', 'Answer a few questions about your device to see what it’s worth.'], ['box', 'Send it in for free', 'We’ll send a prepaid trade-in kit to your door.'], ['leaf', 'Good for the planet', 'Devices that can’t be reused are recycled responsibly.']] },
  financing: { fx: 'bokeh', dark: 1, title: 'Financing', sub: 'Pay over time, interest-free.', special: 'finance',
    blocks: [['card', '0% APR', 'Spread the cost over 12 or 24 months with no interest.'], ['clock', 'Instant decision', 'Apply at checkout and get a decision in seconds.'], ['shield', 'No hidden fees', 'What you see is exactly what you pay.']] },
  care: { fx: 'aurora', dark: 1, title: 'VoltCare+', sub: 'Protection that has your back.', special: 'care',
    blocks: [['shield', 'Accidental damage', 'Unlimited repairs for drops and spills, with low service fees.'], ['chat', '24/7 priority support', 'Jump the queue and talk to an expert any time.'], ['truck', 'Express replacement', 'A replacement shipped to you before you send yours in.']] },
  setup: { fx: 'snow', title: 'Setup & Transfer', sub: 'Up and running in minutes.',
    blocks: [['swap', 'Move your data', 'Transfer photos, contacts and apps wirelessly from your old device.'], ['spark', 'Personal setup', 'A free online session with a Specialist to get you started.'], ['phone', 'Quick start', 'Hold your new device next to your old one. That’s it.']] },
  delivery: { fx: 'waves', dark: 1, title: 'Delivery & Pickup', sub: 'Free. Fast. Your way.',
    blocks: [['truck', 'Free delivery', 'Free 1–2 day delivery on every order.'], ['pin', 'Pick up in store', 'Order online and collect in as little as an hour.'], ['clock', 'Scheduled delivery', 'Choose a two-hour window that suits you.']] },
  returns: { fx: 'clouds', title: 'Returns & Refunds', sub: 'Free returns within 30 days.',
    blocks: [['returns', 'Easy returns', 'Start a return online and drop it off or schedule a pickup.'], ['card', 'Fast refunds', 'Refunds are issued within 5 business days of receipt.'], ['gift', 'Gift returns', 'Returning a gift? You’ll receive a gift card for its value.']] },
  contact: { fx: 'stars', dark: 1, title: 'Contact Us', sub: 'Talk to a Specialist anytime.', special: 'contact',
    blocks: [['phone', 'Call us', '1‑800‑VOLTARA, every day from 7am to 10pm.'], ['chat', 'Live chat', 'Average response time under two minutes.'], ['pin', 'Visit a store', 'Get hands-on help at a Voltara Store near you.']] },
  orders: { fx: 'rain', dark: 1, title: 'Order Status', sub: 'Track the orders you’ve placed.', special: 'orders', icon: 'box', blocks: [] },
  account: { fx: 'clouds', title: 'Your Account', sub: 'Sign in to see your orders and check out faster.', special: 'account', icon: 'user', blocks: [] },
};

/* ================= Lookups & links ================= */
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const catBy = (slug) => CATS.find((c) => c.slug === slug);
const inCat = (slug) => PRODUCTS.filter((p) => p.cat === slug);
const heroOf = (c) => byId(c.hero) || inCat(c.slug)[0] || PRODUCTS[0];
const optsFor = (p) => (p.noOpt ? [] : OPTS[p.cat] || []);
const LINK = {
  home: 'index.html',
  cat: (slug, hash = '') => `category.html?c=${slug}${hash}`,
  product: (id, hash = '') => `product.html?id=${id}${hash}`,
  compare: (slug) => `compare.html?c=${slug}`,
  page: (p, c) => `page.html?p=${p}${c ? `&c=${c}` : ''}`,
};

/* Dropdown menus: three columns each, first column large */
function menuFor(key) {
  const c = catBy(key);
  if (c) {
    return [
      [`Explore ${c.name}`, [[`Explore All ${c.name}`, LINK.cat(c.slug)], ...inCat(c.slug).map((p) => [p.name, LINK.product(p.id)]), [`Compare ${c.name}`, LINK.compare(c.slug)]]],
      [`Shop ${c.name}`, [[`Shop ${c.name}`, LINK.cat(c.slug, '#lineup')], [`${c.name === 'Accessories' ? 'All' : c.name} Accessories`, LINK.cat('accessories')], ['Voltara Trade In', LINK.page('trade-in')], ['Financing', LINK.page('financing')]]],
      [`More from ${c.name}`, [[`${c.name} Support`, LINK.page('support', c.slug)], [`VoltCare+ for ${c.name}`, LINK.page('care')], ['Setup & Transfer', LINK.page('setup')], ['Delivery & Pickup', LINK.page('delivery')]]],
    ];
  }
  if (key === 'store') {
    return [
      ['Shop', [['Shop the Latest', 'index.html#store'], ...CATS.map((x) => [x.name, LINK.cat(x.slug)])]],
      ['Quick Links', [['Order Status', LINK.page('orders')], ['Financing', LINK.page('financing')], ['Voltara Trade In', LINK.page('trade-in')], ['Returns', LINK.page('returns')]]],
      ['Help', [['Contact Us', LINK.page('contact')], ['Delivery & Pickup', LINK.page('delivery')], ['VoltCare+', LINK.page('care')]]],
    ];
  }
  return [
    ['Explore Support', [['Support Home', LINK.page('support')], ...CATS.slice(0, 7).map((x) => [x.name, LINK.page('support', x.slug)])]],
    ['Get Help', [['Contact Us', LINK.page('contact')], ['Order Status', LINK.page('orders')], ['Returns & Refunds', LINK.page('returns')]]],
    ['Helpful Topics', [['Setup & Transfer', LINK.page('setup')], ['VoltCare+', LINK.page('care')], ['Delivery & Pickup', LINK.page('delivery')]]],
  ];
}
