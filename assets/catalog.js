/* ================= Category page + Compare page ================= */
App.boot(() => {
  const main = $('#main');
  const c = catBy(param('c')) || CATS[0];
  const items = inCat(c.slug);
  const page = document.body.dataset.page;

  const dots = (p) => `<div class="dots">${p.finishes.map((f) => `<i style="background:${swatch(f)}" title="${f.name}"></i>`).join('')}</div>`;
  const REASONS = [
    ['truck', 'Free delivery', 'Fast, free delivery or pickup on every order.', 'delivery'],
    ['swap', 'Trade in and save', 'Get credit when you trade in an eligible device.', 'trade-in'],
    ['card', 'Pay over time', '0% APR financing for 12 months.', 'financing'],
    ['shield', 'VoltCare+', 'Accidental damage cover and 24/7 priority support.', 'care'],
  ];

  if (page === 'category') {
    document.title = `${c.name} — Voltara`;
    const hero = heroOf(c);
    const lineupCard = (p, i) => `<article class="lu reveal" style="transition-delay:${(i % 4) * 80}ms">
      <a href="${LINK.product(p.id)}" class="lu-art">${pic(p)}</a>
      ${dots(p)}
      <span class="eyebrow-new">${p.isNew ? 'New' : '&nbsp;'}</span>
      <h3>${p.name}</h3>
      <p class="lu-tag">${p.tagline}</p>
      <p class="lu-price">From ${short(p.price)} or ${money(p.price / 12)}/mo. for 12 mo.</p>
      <div class="lu-ctas"><a class="btn btn-sm" href="${LINK.product(p.id, '#buy')}">Buy</a><a class="link" href="${LINK.product(p.id)}">Learn more ›</a></div>
      <ul class="lu-hl">${p.hl.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join('')}</ul>
    </article>`;
    const extras = c.slug === 'accessories'
      ? [`Explore more.`, CATS.filter((x) => x.slug !== 'accessories').map((x) => { const p = heroOf(x); return `<a class="mini-cat reveal" href="${LINK.cat(x.slug)}">${pic(p)}<span>${x.name}</span></a>`; }).join('')]
      : [`Essential accessories.`, inCat('accessories').map(card).join('')];

    main.innerHTML = `
      <section class="cat-hero ${c.dark ? 'dark' : 'light'}" data-fx="${c.fx}">
        <nav class="chapter" aria-label="${c.name} models">
          ${items.map((p, i) => `<a href="${LINK.product(p.id)}" style="--i:${i}"><span class="ch-art">${pic(p)}</span><span class="ch-name">${p.name}</span>${p.isNew ? '<em>New</em>' : ''}</a>`).join('')}
          <a href="${LINK.compare(c.slug)}" style="--i:${items.length}"><span class="ch-art ch-ico">${icon('swap')}</span><span class="ch-name">Compare</span></a>
        </nav>
        <h1 class="reveal">${c.name}</h1>
        <p class="cat-tag reveal">${c.tagline}</p>
        <div class="ctas reveal"><a class="btn" href="#lineup">Shop ${c.name}</a><a class="btn btn-outline" href="${LINK.product(hero.id)}">Meet ${hero.name}</a></div>
        <div class="cat-hero-art float">${pic(hero, 1)}</div>
      </section>
      <section class="band" data-fx="mesh" id="lineup">
        <div class="container">
          <h2 class="sec-title reveal">Explore the lineup.</h2>
          <div class="lineup">${items.map(lineupCard).join('')}</div>
          <p class="center reveal"><a class="link big-link" href="${LINK.compare(c.slug)}">Compare all ${c.name.toLowerCase()} models ›</a></p>
        </div>
      </section>
      <section class="band ${c.dark ? 'dark' : ''}" data-fx="${c.fx}">
        <div class="container">
          <h2 class="sec-title reveal">Why Voltara is the best place to buy ${c.name.toLowerCase()}.</h2>
          <div class="reasons">${REASONS.map(([ic, t, d, pg], i) => `<a class="reason glass reveal" style="transition-delay:${i * 80}ms" href="${LINK.page(pg)}">${icon(ic)}<h3>${t}</h3><p>${d}</p><span class="link">Learn more ›</span></a>`).join('')}</div>
        </div>
      </section>
      <section class="band" data-fx="mesh">
        <div class="container">
          <h2 class="sec-title reveal">${extras[0]}</h2>
          <div class="${c.slug === 'accessories' ? 'mini-cats' : 'grid'}">${extras[1]}</div>
        </div>
      </section>`;
    App.init(c.slug);
    return;
  }

  /* ---------- Compare ---------- */
  document.title = `Compare ${c.name} — Voltara`;
  const slots = items.slice(0, Math.min(3, items.length)).map((p) => p.id);
  main.innerHTML = `
    <section class="cmp-hero" data-fx="${c.fx}" ${c.dark ? 'data-dark' : ''}>
      <div class="container">
        <h1 class="reveal">Compare ${c.name.toLowerCase()} models.</h1>
        <nav class="chips cmp-cats reveal">${CATS.map((x) => `<a class="chip${x.slug === c.slug ? ' active' : ''}" href="${LINK.compare(x.slug)}">${x.name}</a>`).join('')}</nav>
      </div>
    </section>
    <section class="band" data-fx="mesh"><div class="container"><div class="cmp" id="cmp" style="--cols:${slots.length}"></div></div></section>`;

  function column(id, slot) {
    const p = byId(id), o = optsFor(p);
    return `<div class="cmp-col">
      <select data-slot="${slot}" aria-label="Choose a model">${items.map((x) => `<option value="${x.id}"${x.id === id ? ' selected' : ''}>${x.name}</option>`).join('')}</select>
      <a class="cmp-art" href="${LINK.product(p.id)}">${pic(p)}</a>
      ${dots(p)}
      <span class="eyebrow-new">${p.isNew ? 'New' : '&nbsp;'}</span>
      <h3>${p.name}</h3>
      <p class="cmp-price">From ${short(p.price)}</p>
      <div class="lu-ctas"><a class="btn btn-sm" href="${LINK.product(p.id, '#buy')}">Buy</a><a class="link" href="${LINK.product(p.id)}">Learn more ›</a></div>
      ${p.hl.map(([b, s]) => `<div class="cmp-row"><b>${b}</b><span>${s}</span></div>`).join('')}
      <div class="cmp-row"><b>${p.finishes.length}</b><span>finish${p.finishes.length > 1 ? 'es' : ''}: ${p.finishes.map((f) => f.name).join(', ')}</span></div>
      ${o.map(([label, ch]) => `<div class="cmp-row"><b>${label}</b><span>${ch.map((x) => x[0]).join(' / ')}</span></div>`).join('')}
    </div>`;
  }
  const renderCmp = () => { $('#cmp').innerHTML = slots.map(column).join(''); };
  document.addEventListener('change', (e) => {
    if (!e.target.dataset.slot) return;
    slots[+e.target.dataset.slot] = e.target.value;
    renderCmp();
  });
  renderCmp();
  App.init(c.slug);
});
