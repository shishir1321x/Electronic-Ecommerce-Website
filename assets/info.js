/* ================= Info pages: page.html?p=<key>[&c=<category>] ================= */
App.boot(() => {
  const key = INFO[param('p')] ? param('p') : 'support';
  const pg = INFO[key];
  const c = key === 'support' ? catBy(param('c')) : null;
  const title = c ? `${c.name} Support` : pg.title;
  const dark = c ? c.dark : pg.dark;
  document.title = `${title} — Voltara`;

  const TRADE = { phones: 630, tablets: 480, computers: 910, audio: 120, wearables: 240, cameras: 720, gaming: 260, accessories: 40 };
  const FAQ = [
    ['How long does delivery take?', 'Most orders arrive in 1–2 business days. You can also pick up in store, often within an hour.'],
    ['What is your return policy?', 'You can return any product within 30 days of delivery for a full refund — free of charge.'],
    ['Is my device covered by warranty?', 'Every Voltara product includes a two-year limited warranty. VoltCare+ adds accidental damage cover.'],
    ['Can I pay monthly?', 'Yes. Choose 0% APR financing over 12 months at checkout, subject to approval.'],
    ['How do I transfer my data?', 'Place your new device next to your old one and follow the on-screen Quick Start steps.'],
  ];
  const sel = (id, list) => `<select id="${id}">${list.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>`;

  function special() {
    switch (pg.special) {
      case 'support': return c
        ? `<section class="band" data-fx="mesh"><div class="container">
            <h2 class="sec-title reveal">Get help with your ${c.name.toLowerCase()}.</h2>
            <div class="mini-cats">${inCat(c.slug).map((p) => `<a class="mini-cat reveal" href="${LINK.product(p.id)}">${pic(p)}<span>${p.name}</span></a>`).join('')}</div>
            <div class="topics">${[['spark', 'Set up your device', 'setup'], ['shield', 'Coverage & repairs', 'care'], ['returns', 'Returns & exchanges', 'returns'], ['chat', 'Talk to a Specialist', 'contact']]
              .map(([ic, t, k]) => `<a class="topic reveal" href="${LINK.page(k)}">${icon(ic)}<span>${t}</span>${SVG.chev}</a>`).join('')}</div>
          </div></section>`
        : `<section class="band" data-fx="mesh"><div class="container">
            <h2 class="sec-title reveal">Choose a product.</h2>
            <div class="mini-cats">${CATS.map((x) => { const p = heroOf(x); return `<a class="mini-cat reveal" href="${LINK.page('support', x.slug)}">${pic(p)}<span>${x.name}</span></a>`; }).join('')}</div>
          </div></section>`;
      case 'tradein': return `<section class="band" data-fx="mesh"><div class="container narrow">
          <div class="widget glass reveal"><h2>See what your device is worth.</h2>
            <label>What are you trading in? ${sel('tiCat', CATS.map((x) => [x.slug, x.name]))}</label>
            <label>What condition is it in? ${sel('tiCond', [['1', 'Like new'], ['0.75', 'Good — light wear'], ['0.4', 'Fair — visible damage']])}</label>
            <p class="widget-out" id="tiOut"></p></div></div></section>`;
      case 'finance': return `<section class="band" data-fx="mesh"><div class="container narrow">
          <div class="widget glass reveal"><h2>Estimate your monthly payment.</h2>
            <label>Choose a product ${sel('fiProd', PRODUCTS.map((p) => [p.id, `${p.name} — ${short(p.price)}`]))}</label>
            <label>Term ${sel('fiTerm', [['12', '12 months'], ['24', '24 months']])}</label>
            <p class="widget-out" id="fiOut"></p></div></div></section>`;
      case 'care': return `<section class="band" data-fx="mesh"><div class="container">
          <h2 class="sec-title reveal">Choose your plan.</h2>
          <div class="plans">${[['VoltCare+ Monthly', '$9.99', '/mo.', 'Cancel any time.'], ['VoltCare+ Annual', '$99', '/yr.', 'Save over 15%.'], ['VoltCare+ Theft & Loss', '$14.99', '/mo.', 'Everything, plus theft and loss.']]
            .map(([n, pr, per, note], i) => `<div class="plan glass reveal" style="transition-delay:${i * 90}ms"><h3>${n}</h3><p class="plan-price">${pr}<small>${per}</small></p><p>${note}</p><a class="btn btn-sm" href="${LINK.page('contact')}">Talk to us</a></div>`).join('')}</div>
        </div></section>`;
      case 'contact': return `<section class="band" data-fx="mesh"><div class="container narrow">
          <form class="widget glass reveal" id="contactForm"><h2>Send us a message.</h2>
            <label>Name <input required id="cName" maxlength="100" autocomplete="name" /></label>
            <label>Email <input required id="cEmail" type="email" maxlength="200" autocomplete="email" /></label>
            <label>How can we help? <textarea required id="cMsg" rows="4" maxlength="4000"></textarea></label>
            <p class="form-error" id="cError" hidden></p>
            <button class="btn" type="submit">Send message</button></form></div></section>`;
      case 'orders': return `<section class="band" data-fx="mesh"><div class="container narrow"><div id="orders"></div></div></section>`;
      case 'account': return `<section class="band" data-fx="mesh"><div class="container narrow"><div id="account"></div></div></section>`;
      default: return '';
    }
  }

  const hero = c ? heroOf(c) : null;
  $('#main').innerHTML = `
    <section class="info-hero ${dark ? 'dark' : 'light'}" data-fx="${c ? c.fx : pg.fx}">
      <h1 class="reveal">${title}</h1>
      <p class="reveal">${pg.sub}</p>
      ${hero ? `<div class="info-art float">${pic(hero, 1)}</div>` : ''}
    </section>
    ${special()}
    ${pg.blocks.length ? `<section class="band ${dark ? 'dark' : ''}" data-fx="${c ? c.fx : pg.fx}"><div class="container"><div class="reasons">
      ${pg.blocks.map(([ic, t, d], i) => `<div class="reason glass reveal" style="transition-delay:${i * 80}ms">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div></div></section>` : ''}
    ${key === 'support' ? `<section class="band" data-fx="mesh"><div class="container narrow">
      <h2 class="sec-title reveal">Frequently asked questions.</h2>
      <div class="faq">${FAQ.map(([q, a]) => `<details class="reveal"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
    </div></section>` : ''}
    <section class="band" data-fx="mesh"><div class="container">
      <h2 class="sec-title reveal">More ways we can help.</h2>
      <div class="topics">${Object.entries(INFO).filter(([k]) => k !== key).map(([k, v]) => `<a class="topic reveal" href="${LINK.page(k)}">${icon(v.icon || v.blocks[0]?.[0] || 'box')}<span>${v.title}</span>${SVG.chev}</a>`).join('')}</div>
    </div></section>`;

  /* Widgets */
  const upd = {
    tradein() { $('#tiOut').innerHTML = `Get up to <b>${short(Math.round(TRADE[$('#tiCat').value] * +$('#tiCond').value))}</b> in credit toward your next purchase.<a class="link" href="${LINK.cat($('#tiCat').value)}">Shop ${catBy($('#tiCat').value).name} ›</a>`; },
    finance() { const p = byId($('#fiProd').value), n = +$('#fiTerm').value; $('#fiOut').innerHTML = `<b>${money(p.price / n)}</b>/mo. for ${n} months at 0% APR.<a class="link" href="${LINK.product(p.id, '#buy')}">Buy ${p.name} ›</a>`; },
  };
  if (upd[pg.special]) { upd[pg.special](); $('#main').addEventListener('change', upd[pg.special]); }

  if (pg.special === 'contact') $('#contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#cName').value.trim(), email = $('#cEmail').value.trim(), message = $('#cMsg').value.trim();
    const first = esc(name.split(' ')[0]);
    if (!DB.on) { toast(`Thanks, ${first}. This copy of the store runs in demo mode, so your message wasn’t sent anywhere.`); return e.target.reset(); }
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    try {
      await DB.sendMessage({ name, email, message });
      $('#cError').hidden = true;
      e.target.reset();
      toast(`Thanks, ${first}. Your message has been sent.`);
    } catch (err) { $('#cError').textContent = err.message; $('#cError').hidden = false; }
    finally { btn.disabled = false; }
  });

  /* ---------- Orders: from the database (signed in, or looked up by number + email) and from this browser ---------- */
  const STEPS = ['placed', 'processing', 'shipped', 'delivered'];
  const fromLocal = (o) => (o.order_no ? o : {
    order_no: o.no, created_at: o.date, status: 'placed', total: o.total,
    items: (o.items || []).map((l) => { const p = byId(l.id); return { product_id: l.id, name: p ? p.name : l.id, finish: p ? (p.finishes[l.f] || p.finishes[0]).name : '', options: '', qty: l.qty, unit_price: l.price }; }),
  });
  function orderCard(o) {
    const at = STEPS.indexOf(o.status);
    return `<article class="order glass reveal in">
      <header><div><h3>Order ${esc(o.order_no)}</h3><span>Placed ${new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div><b>${money(+o.total)}</b></header>
      ${o.status === 'cancelled' ? '<p class="order-cancelled">This order was cancelled.</p>'
        : `<ol class="track">${STEPS.map((s, i) => `<li class="${i <= at ? 'done' : ''}">${s[0].toUpperCase() + s.slice(1)}</li>`).join('')}</ol>`}
      ${(o.items || []).map((l) => {
        const p = byId(l.product_id), fin = (F[l.finish] && F[l.finish].name) || l.finish;
        return `<div class="order-line"><span class="thumb">${p ? pic(p) : ''}</span><span>${esc(l.name)} × ${l.qty}<small>${esc([fin, l.options].filter(Boolean).join(' · '))}</small></span><span>${money(l.unit_price * l.qty)}</span></div>`;
      }).join('')}
    </article>`;
  }
  const lookupForm = (msg) => `<form class="widget glass" id="lookupForm"><h2>Find an order.</h2>
    <div class="row2"><label>Order number<input name="no" placeholder="W123456789" required></label><label>Email<input name="email" type="email" required></label></div>
    ${msg ? `<p class="form-error">${esc(msg)}</p>` : ''}<button class="btn" type="submit">Find order</button></form>`;

  async function renderOrders(msg = '') {
    const el = $('#orders');
    let list = store.get('voltara-orders', []).map(fromLocal);
    if (DB.on) {
      if (!el.innerHTML) el.innerHTML = '<p class="loading">Loading your orders…</p>';
      if (await DB.auth.user()) list = list.concat(await DB.myOrders().catch(() => []));
      const found = await Promise.all(store.get('voltara-recent', []).map((r) => DB.findOrder(r.no, r.email).catch(() => null)));
      found.forEach((o) => { if (o && !list.some((x) => x.order_no === o.order_no)) list.push(o); });
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    el.innerHTML = (DB.on ? lookupForm(msg) : '') + (list.length ? list.map(orderCard).join('')
      : `<div class="widget glass"><h2>No orders yet.</h2><p>${DB.on ? 'Orders you place, or find above, will appear here.' : 'Orders you place in this browser will appear here.'}</p><a class="btn" href="index.html#store">Start shopping</a></div>`);
  }

  /* ---------- Account: sign up / sign in with Supabase Auth ---------- */
  async function renderAccount(msg = '') {
    const el = $('#account');
    if (!DB.on) {
      el.innerHTML = `<div class="widget glass"><h2>Accounts need the online database.</h2><p>This copy of the store runs in demo mode. Once it’s connected to Supabase (see DEPLOY.md), customers can create accounts and see every order they’ve placed.</p><a class="btn" href="${LINK.page('orders')}">View orders from this browser</a></div>`;
      return;
    }
    const user = await DB.auth.user();
    if (!user) {
      el.innerHTML = `<div class="acct-grid">
        <form class="widget glass" id="signInForm"><h2>Sign in.</h2>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
          <button class="btn" type="submit">Sign in</button></form>
        <form class="widget glass" id="signUpForm"><h2>Create an account.</h2>
          <label>Name<input name="name" autocomplete="name" maxlength="100" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label><span>Password <small>(at least 6 characters)</small></span><input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
          <button class="btn" type="submit">Create account</button></form>
      </div>${msg ? `<p class="form-msg">${esc(msg)}</p>` : ''}`;
      return;
    }
    const orders = await DB.myOrders().catch(() => []);
    const name = (user.user_metadata && user.user_metadata.name) || user.email;
    el.innerHTML = `<div class="widget glass acct-head"><div><h2>Hi, ${esc(name)}.</h2><p>Signed in as ${esc(user.email)}</p></div><button class="btn btn-outline" id="signOut">Sign out</button></div>
      <h2 class="sec-title acct-title">Your orders.</h2>
      ${orders.length ? orders.map(orderCard).join('') : '<div class="widget glass"><p>You haven’t placed any orders while signed in yet.</p><a class="btn" href="index.html#store">Start shopping</a></div>'}`;
  }

  $('#main').addEventListener('submit', async (e) => {
    const f = e.target;
    if (!['signInForm', 'signUpForm', 'lookupForm'].includes(f.id)) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    f.querySelector('button[type=submit]').disabled = true;
    try {
      if (f.id === 'lookupForm') {
        const o = await DB.findOrder(d.no.trim(), d.email.trim());
        if (!o) return renderOrders('We couldn’t find an order with that number and email.');
        store.set('voltara-recent', [{ no: o.order_no, email: d.email.trim() }, ...store.get('voltara-recent', []).filter((r) => r.no !== o.order_no)].slice(0, 20));
        return renderOrders();
      }
      if (f.id === 'signInForm') { await DB.auth.signIn(d.email.trim(), d.password); toast('Welcome back!'); return renderAccount(); }
      const r = await DB.auth.signUp(d.email.trim(), d.password, d.name.trim());
      if (r.session) { toast('Your account is ready.'); return renderAccount(); }
      renderAccount('Almost done: check your email for a confirmation link, then sign in here.');
    } catch (err) { (f.id === 'lookupForm' ? renderOrders : renderAccount)(err.message); }
  });
  $('#main').addEventListener('click', async (e) => {
    if (e.target.id !== 'signOut') return;
    await DB.auth.signOut();
    toast('You’re signed out.');
    renderAccount();
  });

  if (pg.special === 'orders') renderOrders();
  if (pg.special === 'account') renderAccount();

  App.init(c ? c.slug : 'support');
});
