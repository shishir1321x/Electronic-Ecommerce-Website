/* ================= Shared chrome: nav + dropdowns, search, bag, footer ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const short = (n) => '$' + n.toLocaleString('en-US');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const param = (k) => new URLSearchParams(location.search).get(k);
const swatch = (fin) => `linear-gradient(135deg,${fin.c[0]},${fin.c[1]})`;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const NAV = [['store', 'Store', 'index.html#store'], ...CATS.map((c) => [c.slug, c.name, LINK.cat(c.slug)]), ['support', 'Support', LINK.page('support')]];
const SVG = {
  bolt: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M5 8h14l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- Markup ---------- */
const menuCols = (key) => menuFor(key).map(([title, links], ci) => `
  <div class="fo-col${ci ? '' : ' fo-big'}"><h6>${title}</h6><ul>${links.map(([label, href], i) =>
    `<li style="--i:${i + ci * 2}"><a href="${href}">${label}</a></li>`).join('')}</ul></div>`).join('');

function headerHtml() {
  return `<header class="gnav" id="gnav">
    <div class="gnav-inner">
      <a href="index.html" class="logo" aria-label="Voltara home">${SVG.bolt}<span>Voltara</span></a>
      <nav class="gnav-links" aria-label="Main">${NAV.map(([k, label, href]) => `<a href="${href}" data-menu="${k}">${label}</a>`).join('')}</nav>
      <div class="gnav-actions">
        <button class="nav-icon" id="searchBtn" aria-label="Search">${SVG.search}</button>
        <a class="nav-icon" href="${LINK.page('account')}" aria-label="Your account">${SVG.user}</a>
        <button class="nav-icon" id="bagBtn" aria-label="Shopping bag">${SVG.bag}<span class="bag-count" id="bagCount"></span></button>
        <button class="nav-icon menu-btn" id="menuBtn" aria-label="Menu"><svg viewBox="0 0 24 24" width="18" height="18"><path class="m1" d="M4 9h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path class="m2" d="M4 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      </div>
    </div>
    <div class="flyout" id="flyout"><div class="flyout-inner" id="flyoutInner"></div></div>
    <div class="search-panel" id="searchPanel"><div class="search-inner">
      <label class="search-field">${SVG.search}<input type="search" id="searchInput" placeholder="Search Voltara" aria-label="Search products" autocomplete="off" /></label>
      <div class="search-results" id="searchResults"></div>
    </div></div>
    <div class="mmenu" id="mmenu"><div class="mm-track">
      <div class="mm-main">${NAV.map(([k, label], i) => `<button data-sub="${k}" style="--i:${i}">${label}${SVG.chev}</button>`).join('')}</div>
      <div class="mm-sub" id="mmSub"></div>
    </div></div>
  </header>
  <div class="scrim" id="scrim"></div>
  <div class="ribbon">Get 10% off your first order with code <b>VOLT10</b>. <a href="index.html#products">Shop now ›</a></div>`;
}

function footerHtml() {
  const col = (t, links) => `<div><h4>${t}</h4>${links.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</div>`;
  return `<footer class="footer" data-fx="mesh"><div class="container">
    <p class="fine">* Free delivery applies to all orders within the contiguous United States. Financing subject to credit approval. Battery life varies by use and configuration. Code VOLT10 valid on your first order only. Product and scenery photos from <a class="link" href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>, used under the Unsplash License; products shown are illustrative.</p>
    <div class="foot-cols">
      ${col('Shop and Learn', CATS.map((c) => [c.name, LINK.cat(c.slug)]))}
      ${col('Compare', CATS.slice(0, 6).map((c) => [`Compare ${c.name}`, LINK.compare(c.slug)]))}
      ${col('Voltara Store', [['Shop the Latest', 'index.html#store'], ['Your Account', LINK.page('account')], ['Financing', LINK.page('financing')], ['Voltara Trade In', LINK.page('trade-in')], ['Order Status', LINK.page('orders')], ['Delivery & Pickup', LINK.page('delivery')]])}
      ${col('Support', [['Support Home', LINK.page('support')], ['Contact Us', LINK.page('contact')], ['Returns & Refunds', LINK.page('returns')], ['Setup & Transfer', LINK.page('setup')], ['VoltCare+', LINK.page('care')]])}
    </div>
    <p class="more">More ways to shop: <a href="${LINK.page('contact')}">Find a Voltara Store</a> or call 1‑800‑VOLTARA.</p>
    <div class="legal"><span>Copyright © ${new Date().getFullYear()} Voltara Inc. All rights reserved.</span>
      <span class="legal-links"><a href="${LINK.page('returns')}">Sales and Refunds</a><a href="${LINK.page('support')}">Support</a><a href="index.html">Home</a></span>
      <span class="region">United States</span></div>
  </div></footer>`;
}

function bagHtml() {
  return `<div class="overlay" id="overlay"></div>
  <aside class="bag" id="bag" aria-label="Shopping bag">
    <div class="bag-head"><h3 id="bagTitle">Review your bag.</h3><button class="close" id="closeBag" aria-label="Close bag">${SVG.close}</button></div>
    <p class="bag-sub">Free delivery and free returns.</p>
    <div class="bag-body" id="bagItems"></div>
    <div class="bag-foot">
      <form class="promo" id="promoForm"><input id="promoInput" placeholder="Promo code" aria-label="Promo code" /><button type="submit">Apply</button></form>
      <div class="totals">
        <div><span>Subtotal</span><span id="subtotal">$0.00</span></div>
        <div id="discountRow" hidden><span>Promo (VOLT10)</span><span id="discount">−$0.00</span></div>
        <div><span>Shipping</span><span>FREE</span></div>
        <div class="grand"><span>Total</span><span id="total">$0.00</span></div>
      </div>
      <button class="btn btn-block" id="checkoutBtn">Check Out</button>
    </div>
  </aside>
  <div class="toast" id="toast"></div>`;
}

/* ---------- Shared product card ---------- */
function card(p, i = 0) {
  return `<article class="card" style="animation-delay:${i * 40}ms">
    <a class="card-link" href="${LINK.product(p.id)}" aria-label="${p.name}"></a>
    <div class="art">${pic(p)}</div>
    <div class="dots">${p.finishes.map((f) => `<i style="background:${swatch(f)}" title="${f.name}"></i>`).join('')}</div>
    ${p.isNew ? '<span class="eyebrow-new">New</span>' : ''}
    <h3>${p.name}</h3>
    <p class="tagline">${p.tagline}</p>
    <div class="buy-row"><span class="price">From ${short(p.price)}</span>${p.stock === 0 ? '<span class="sold-out">Sold out</span>' : `<button class="btn btn-sm" data-add="${p.id}">Buy</button>`}</div>
  </article>`;
}

/* ---------- Dropdown flyouts (desktop) ---------- */
let foKey = null, foTimer;
function openFlyout(key) {
  clearTimeout(foTimer);
  if (foKey === key) return;
  closeSearch();
  foKey = key;
  const inner = $('#flyoutInner');
  inner.innerHTML = menuCols(key);
  inner.classList.remove('in'); void inner.offsetWidth; inner.classList.add('in');
  $('#flyout').style.height = inner.scrollHeight + 'px';
  document.body.classList.add('flyout-open');
  $$('.gnav-links a').forEach((a) => a.classList.toggle('hover', a.dataset.menu === key));
}
function closeFlyout() {
  foKey = null;
  $('#flyout').style.height = '0px';
  document.body.classList.remove('flyout-open');
  $$('.gnav-links a.hover').forEach((a) => a.classList.remove('hover'));
}

/* ---------- Mobile menu ---------- */
function toggleMenu() {
  closeSearch();
  $('#mmenu').classList.remove('sub');
  document.body.classList.toggle('menu-open');
}
function closeMenu() { document.body.classList.remove('menu-open'); }
function openSub(key) {
  $('#mmSub').innerHTML = `<button class="mm-back" data-back>${SVG.back}<span>${NAV.find((n) => n[0] === key)[1]}</span></button>${menuCols(key)}`;
  $('#mmenu').classList.add('sub');
}

/* ---------- Search ---------- */
function openSearch() { closeFlyout(); closeMenu(); document.body.classList.add('search-open'); renderSearch(); setTimeout(() => $('#searchInput').focus(), 250); }
function closeSearch() { document.body.classList.remove('search-open'); }
function renderSearch() {
  const q = $('#searchInput').value.trim().toLowerCase();
  if (!q) {
    $('#searchResults').innerHTML = `<h5>Quick Links</h5>${[...CATS.slice(0, 5).map((c) => [`Shop ${c.name}`, LINK.cat(c.slug)]), ['Order Status', LINK.page('orders')]]
      .map(([l, h]) => `<a href="${h}" class="arrow-link">${l}</a>`).join('')}`;
    return;
  }
  const hits = PRODUCTS.filter((p) => `${p.name} ${catBy(p.cat).name} ${p.tagline}`.toLowerCase().includes(q)).slice(0, 7);
  $('#searchResults').innerHTML = hits.length
    ? `<h5>Products</h5>${hits.map((p) => `<a href="${LINK.product(p.id)}"><span class="s-thumb">${pic(p)}</span>${p.name}<span class="s-price">${short(p.price)}</span></a>`).join('')}`
    : `<h5>No results for “${esc(q)}”</h5>`;
}

/* ---------- Bag ---------- */
let bag = store.get('voltara-bag', []).filter((l) => l && typeof l.id === 'string'); // checked against the catalog in App.boot()
let promo = store.get('voltara-promo', null);
const normOpts = (p, o = []) => optsFor(p).map((_, i) => o[i] || 0);
const linePrice = (l) => { const p = byId(l.id); return p.price + optsFor(p).reduce((s, [, ch], i) => s + ch[l.o[i] || 0][1], 0); };
const lineDesc = (l) => { const p = byId(l.id); return [(p.finishes[l.f] || p.finishes[0]).name, ...optsFor(p).map(([, ch], i) => ch[l.o[i] || 0][0])].join(' · '); };

function addToBag(id, f = 0, o = []) {
  const p = byId(id);
  if (p.stock === 0) return toast(`${p.name} is sold out.`);
  o = normOpts(p, o);
  const line = bag.find((l) => l.id === id && l.f === f && l.o.join() === o.join());
  if (line) line.qty = Math.min(10, line.qty + 1); else bag.push({ id, f, o, qty: 1 });
  saveBag();
  toast(`<b>${p.name}</b> added to your bag.<button data-open-bag>Review Bag</button>`);
}
function setQty(i, q) { if (q <= 0) bag.splice(i, 1); else bag[i].qty = Math.min(q, 10); saveBag(); }
function saveBag() { store.set('voltara-bag', bag); renderBag(); document.dispatchEvent(new Event('bag-changed')); }

function renderBag() {
  const count = bag.reduce((s, l) => s + l.qty, 0);
  const sub = bag.reduce((s, l) => s + linePrice(l) * l.qty, 0);
  const disc = promo ? sub * 0.1 : 0;
  const badge = $('#bagCount');
  const prev = +badge.textContent || 0;
  badge.textContent = count || '';
  badge.classList.toggle('show', count > 0);
  if (count > prev) { badge.classList.remove('show'); void badge.offsetWidth; badge.classList.add('show'); }
  $('#bagTitle').textContent = count ? `Your bag total is ${money(sub - disc)}.` : 'Your bag is empty.';
  $('#subtotal').textContent = money(sub);
  $('#discountRow').hidden = !disc;
  $('#discount').textContent = '−' + money(disc);
  $('#total').textContent = money(sub - disc);
  $('#checkoutBtn').disabled = !count;
  $('#bagItems').innerHTML = bag.length ? bag.map((l, i) => {
    const p = byId(l.id);
    return `<div class="line">
      <a class="thumb" href="${LINK.product(p.id)}">${pic(p)}</a>
      <div><h4>${p.name}</h4><div class="finish">${lineDesc(l)}</div>
        <div class="qty"><button data-dec="${i}" aria-label="Decrease">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Increase">+</button></div></div>
      <div class="right">${money(linePrice(l) * l.qty)}<button class="remove" data-remove="${i}">Remove</button></div>
    </div>`;
  }).join('') : `<div class="bag-empty"><h4>Nothing here yet.</h4><p>Free delivery and free returns on every order.</p><a href="index.html#store" class="link">Continue Shopping ›</a></div>`;
}
function openBag() { closeSearch(); closeMenu(); closeFlyout(); $('#bag').classList.add('open'); $('#overlay').classList.add('show'); document.body.classList.add('locked'); }
function closeBag() { $('#bag').classList.remove('open'); $('#overlay').classList.remove('show'); document.body.classList.remove('locked'); }

function checkout() {
  if (bag.length) location.href = 'checkout.html';
}

let toastTimer;
function toast(html) {
  const t = $('#toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
}

/* ---------- Reveal on scroll ---------- */
function countUp(el) {
  const target = +el.dataset.count, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1500);
    el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const revealIO = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  $$('[data-count]', en.target).forEach(countUp);
  revealIO.unobserve(en.target);
}), { threshold: 0.12 });
const reveal = (root = document) => $$('.reveal:not(.in)', root).forEach((el) => revealIO.observe(el));

/* ---------- Events ---------- */
function bindChrome() {
  $$('.gnav-links a').forEach((a) => {
    a.addEventListener('mouseenter', () => { clearTimeout(foTimer); foTimer = setTimeout(() => openFlyout(a.dataset.menu), foKey ? 0 : 140); });
    a.addEventListener('focus', () => openFlyout(a.dataset.menu));
  });
  $('#gnav').addEventListener('mouseleave', () => { clearTimeout(foTimer); foTimer = setTimeout(closeFlyout, 180); });
  $('#flyout').addEventListener('mouseenter', () => clearTimeout(foTimer));
  $('#scrim').addEventListener('click', () => { closeSearch(); closeFlyout(); });
  $('#searchBtn').addEventListener('click', () => (document.body.classList.contains('search-open') ? closeSearch() : openSearch()));
  $('#searchInput').addEventListener('input', renderSearch);
  $('#searchInput').addEventListener('keydown', (e) => {
    const q = e.target.value.trim();
    if (e.key === 'Enter' && q) location.href = `index.html?q=${encodeURIComponent(q)}#products`;
  });
  $('#menuBtn').addEventListener('click', toggleMenu);
  $('#bagBtn').addEventListener('click', openBag);
  $('#closeBag').addEventListener('click', closeBag);
  $('#overlay').addEventListener('click', closeBag);
  $('#checkoutBtn').addEventListener('click', checkout);
  $('#promoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#promoInput').value.trim().toUpperCase() === 'VOLT10') { promo = 'VOLT10'; store.set('voltara-promo', promo); renderBag(); toast('Promo code applied. You saved 10%.'); }
    else toast('That promo code isn’t valid.');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeFlyout(); closeSearch(); closeMenu(); closeBag(); } });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-open-bag],[data-inc],[data-dec],[data-remove],[data-sub],[data-back]');
    if (!t) return;
    const d = t.dataset;
    if (d.add) { e.preventDefault(); addToBag(d.add); }
    else if ('openBag' in d) openBag();
    else if (d.inc) setQty(+d.inc, bag[+d.inc].qty + 1);
    else if (d.dec) setQty(+d.dec, bag[+d.dec].qty - 1);
    else if (d.remove) setQty(+d.remove, 0);
    else if (d.sub) openSub(d.sub);
    else if ('back' in d) $('#mmenu').classList.remove('sub');
  });
  addEventListener('resize', () => { if (innerWidth > 834) closeMenu(); });
}

/* ---------- Boot: call after the page has rendered its <main> ---------- */
const App = {
  /* Waits for the live catalog when a database is connected (max 5s), then renders the page */
  boot(render) {
    const ready = DB.on ? Promise.race([DB.loadCatalog().catch(() => {}), new Promise((r) => setTimeout(r, 5000))]) : Promise.resolve();
    ready.then(() => { bag = bag.filter((l) => byId(l.id)); render(); });
  },
  init(active) {
    document.body.insertAdjacentHTML('afterbegin', headerHtml());
    document.body.insertAdjacentHTML('beforeend', footerHtml() + bagHtml());
    if (active) $(`.gnav-links a[data-menu="${active}"]`)?.classList.add('current');
    bindChrome();
    renderBag();
    FX.init();
    reveal();
  },
};
