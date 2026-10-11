/* ================= Checkout ================= */
App.boot(() => {
  document.title = 'Checkout — Voltara';
  const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Ireland', 'Australia', 'New Zealand', 'India', 'Singapore', 'Germany', 'France', 'Japan', 'Other'];
  const main = $('#main');
  let placing = false;

  const field = (label, name, attrs = '') => `<label><span>${label}</span><input name="${name}" ${attrs}></label>`;

  function render() {
    if (!bag.length) {
      main.innerHTML = `<section class="band co-page" data-fx="mesh"><div class="container narrow"><div class="widget glass">
        <h2>Your bag is empty.</h2><p>Add something you love, then come back to check out.</p>
        <a class="btn" href="index.html#store">Continue Shopping</a></div></div></section>`;
      return;
    }
    main.innerHTML = `<section class="band co-page" data-fx="mesh"><div class="container">
      <h1 class="co-title">Checkout. <span>Free delivery and free returns.</span></h1>
      ${DB.on ? '' : '<p class="co-note">Demo mode: orders are saved in this browser only. Connect the database (see DEPLOY.md) to store orders online.</p>'}
      <div class="co-grid">
        <form class="widget glass co-form" id="coForm" novalidate>
          <h2>Where should we send it?</h2>
          <div class="row2">${field('First name', 'first', 'autocomplete="given-name" maxlength="50" required')}${field('Last name', 'last', 'autocomplete="family-name" maxlength="50" required')}</div>
          ${field('Email', 'email', 'type="email" autocomplete="email" maxlength="200" required')}
          ${field('Phone <small>(optional)</small>', 'phone', 'type="tel" autocomplete="tel" maxlength="30"')}
          ${field('Street address', 'street', 'autocomplete="street-address" maxlength="120" required')}
          <div class="row3">${field('City', 'city', 'autocomplete="address-level2" maxlength="60" required')}${field('Postal code', 'zip', 'autocomplete="postal-code" maxlength="20" required')}
            <label>Country<select name="country" autocomplete="country-name">${COUNTRIES.map((c) => `<option>${c}</option>`).join('')}</select></label></div>
          <h2>How would you like it?</h2>
          <div class="opts">
            <label class="opt on"><input type="radio" name="delivery" value="delivery" checked><b>Free delivery</b><span>Arrives in 1–2 business days</span></label>
            <label class="opt"><input type="radio" name="delivery" value="pickup"><b>Pick up in store</b><span>Usually ready in an hour</span></label>
          </div>
          <h2>Payment.</h2>
          <div class="pay-note">${icon('card')}<span><b>Pay on delivery.</b> This demo store doesn’t take card payments online.</span></div>
          <p class="form-error" id="coError" role="alert" hidden></p>
          <button class="btn btn-block" type="submit" id="placeBtn">Place order</button>
        </form>
        <aside class="widget glass co-summary" id="coSummary"></aside>
      </div>
    </div></section>`;
    renderSummary();
    prefill();
  }

  function renderSummary() {
    const box = $('#coSummary');
    if (!box) return;
    if (!bag.length) { render(); FX.init(); reveal(); return; }
    const sub = bag.reduce((s, l) => s + linePrice(l) * l.qty, 0);
    const disc = promo ? Math.round(sub * 10) / 100 : 0;
    box.innerHTML = `<h2>Your bag.</h2>
      ${bag.map((l) => { const p = byId(l.id); return `<div class="order-line"><a class="thumb" href="${LINK.product(p.id)}">${pic(p)}</a>
        <span>${p.name} × ${l.qty}<small>${lineDesc(l)}</small></span><span>${money(linePrice(l) * l.qty)}</span></div>`; }).join('')}
      <form class="promo" id="coPromo"><input id="coPromoInput" placeholder="Promo code" aria-label="Promo code" value="${promo || ''}"><button type="submit">Apply</button></form>
      <div class="totals">
        <div><span>Subtotal</span><span>${money(sub)}</span></div>
        ${disc ? `<div><span>Promo (VOLT10)</span><span class="good">−${money(disc)}</span></div>` : ''}
        <div><span>Shipping</span><span>FREE</span></div>
        <div class="grand"><span>Total</span><span>${money(sub - disc)}</span></div>
      </div>
      ${DB.on && promo ? '<p class="fine-note">VOLT10 applies to your first order only; the final total is confirmed when you place the order.</p>' : ''}`;
  }

  async function prefill() {
    const user = DB.on ? await DB.auth.user() : null;
    if (!user) return;
    const f = $('#coForm'), name = ((user.user_metadata && user.user_metadata.name) || '').split(' ');
    if (!f.email.value) f.email.value = user.email;
    if (!f.first.value && name[0]) f.first.value = name[0];
    if (!f.last.value && name.length > 1) f.last.value = name.slice(1).join(' ');
  }

  /* Demo mode only: no database, so the order lives in this browser */
  function saveLocalOrder(c) {
    const sub = bag.reduce((s, l) => s + linePrice(l) * l.qty, 0), disc = promo ? Math.round(sub * 10) / 100 : 0;
    const order = {
      order_no: 'W' + Math.floor(1e8 + Math.random() * 9e8), created_at: new Date().toISOString(), status: 'placed',
      delivery: c.delivery, subtotal: sub, discount: disc, total: sub - disc,
      items: bag.map((l) => { const p = byId(l.id); return { product_id: p.id, name: p.name, finish: (p.finishes[l.f] || p.finishes[0]).name, options: optsFor(p).map(([, ch], i) => ch[l.o[i] || 0][0]).join(' · '), qty: l.qty, unit_price: linePrice(l) }; }),
    };
    store.set('voltara-orders', [order, ...store.get('voltara-orders', [])].slice(0, 20));
    return order;
  }

  function showError(msg) { const el = $('#coError'); el.textContent = msg; el.hidden = false; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

  async function submit(e) {
    e.preventDefault();
    if (placing) return;
    const fd = new FormData(e.target), v = (k) => String(fd.get(k) || '').trim();
    if (['first', 'last', 'email', 'street', 'city', 'zip'].some((k) => !v(k))) return showError('Please fill in all the required fields.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email'))) return showError('Please enter a valid email address.');
    const customer = {
      name: `${v('first')} ${v('last')}`, email: v('email'), phone: v('phone'), delivery: v('delivery') || 'delivery',
      address: { street: v('street'), city: v('city'), zip: v('zip'), country: v('country') },
    };
    const btn = $('#placeBtn');
    placing = true; btn.disabled = true; btn.textContent = 'Placing your order…';
    try {
      let order;
      if (DB.on) {
        const r = await DB.placeOrder(bag.map((l) => ({ id: l.id, f: l.f, o: l.o, qty: l.qty })), customer, promo);
        order = { order_no: r.order_no, total: +r.total, promoMissed: !!promo && !r.promo_applied };
        store.set('voltara-recent', [{ no: r.order_no, email: customer.email }, ...store.get('voltara-recent', [])].slice(0, 20));
      } else {
        order = saveLocalOrder(customer);
      }
      bag = []; promo = null;
      store.set('voltara-promo', null);
      saveBag();
      done(order, v('first'));
    } catch (err) {
      showError(err.message);
      placing = false; btn.disabled = false; btn.textContent = 'Place order';
    }
  }

  function done(order, first) {
    main.innerHTML = `<section class="band co-page" data-fx="mesh"><div class="container narrow"><div class="widget glass co-done">
      <span class="co-check"><svg viewBox="0 0 24 24" width="34" height="34"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <h2>Thank you, ${esc(first)}. Your order is placed.</h2>
      <p>Order <b>${esc(order.order_no)}</b> · ${money(order.total)}${order.promoMissed ? ' (VOLT10 was already used with this email, so no discount was applied)' : ''}.</p>
      <p>${DB.on ? 'You can follow its progress on the Order Status page with your order number and email.' : 'Demo mode: this order is saved in this browser only.'}</p>
      <div class="co-actions"><a class="btn" href="${LINK.page('orders')}">Track your order</a><a class="btn btn-outline" href="index.html#store">Keep shopping</a></div>
    </div></div></section>`;
    FX.init();
    reveal();
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  main.addEventListener('submit', (e) => {
    if (e.target.id === 'coForm') return submit(e);
    if (e.target.id !== 'coPromo') return;
    e.preventDefault();
    const code = $('#coPromoInput').value.trim().toUpperCase();
    if (!code) { promo = null; store.set('voltara-promo', null); toast('Promo code removed.'); }
    else if (code === 'VOLT10') { promo = code; store.set('voltara-promo', promo); toast('Promo code applied. You saved 10%.'); }
    else return toast('That promo code isn’t valid.');
    renderSummary();
    renderBag();
  });
  main.addEventListener('change', (e) => {
    if (e.target.name !== 'delivery') return;
    $$('.co-form .opt').forEach((o) => o.classList.toggle('on', o.contains(e.target)));
  });
  document.addEventListener('bag-changed', renderSummary);

  render();
  App.init();
});
