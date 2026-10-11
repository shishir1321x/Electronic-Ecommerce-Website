/* ================= Product page ================= */
App.boot(() => {
  const p = byId(param('id')) || PRODUCTS[0];
  const c = catBy(p.cat);
  const opts = optsFor(p);
  let f = 0, o = opts.map(() => 0);
  document.title = `${p.name} — Voltara`;

  const related = [...inCat(p.cat).filter((x) => x.id !== p.id), ...PRODUCTS.filter((x) => x.cat !== p.cat && x.isNew)].slice(0, 4);

  $('#main').innerHTML = `
    <nav class="lnav" id="lnav"><div class="lnav-inner">
      <a class="lnav-title" href="#overview">${p.name}</a>
      <div class="lnav-links"><a href="#highlights">Overview</a><a href="#specs">Tech Specs</a><a href="${LINK.compare(c.slug)}">Compare</a><a class="btn btn-sm" href="#buy">Buy</a></div>
    </div></nav>

    <section class="p-hero ${c.dark ? 'dark' : 'light'}" data-fx="${c.fx}" id="overview">
      ${p.isNew ? '<span class="eyebrow-new reveal">New</span>' : ''}
      <h1 class="reveal">${p.name}</h1>
      <p class="p-tag reveal">${p.tagline}</p>
      <p class="p-price reveal">From ${short(p.price)} or ${money(p.price / 12)}/mo. for 12 mo.</p>
      <div class="ctas reveal"><a class="btn" href="#buy">Buy</a><a class="btn btn-outline" href="${LINK.compare(c.slug)}">Compare</a></div>
      <div class="p-art float"><div class="frame" id="heroArt">${pic(p, 1)}</div></div>
    </section>

    <section class="band" data-fx="mesh" id="highlights">
      <div class="container">
        <h2 class="sec-title reveal">Get the highlights.</h2>
        <p class="sec-sub reveal">${p.desc}</p>
        <div class="hl-grid">${p.hl.map(([b, s], i) => `<div class="hl-card glass reveal" style="transition-delay:${i * 90}ms"><b>${b}</b><span>${s}</span></div>`).join('')}</div>
      </div>
    </section>

    ${p.finishes.length > 1 ? `<section class="band ${c.dark ? 'dark' : ''}" data-fx="${c.fx}">
      <div class="container">
        <h2 class="sec-title reveal">A finish for everyone.</h2>
        <div class="finish-show">${p.finishes.map((x, i) => `<button class="fs reveal" style="transition-delay:${i * 90}ms" data-pick="${i}"><i class="orb" style="--c1:${x.c[0]};--c2:${x.c[1]}"></i><span>${x.name}</span></button>`).join('')}</div>
      </div>
    </section>` : ''}

    <section class="band" data-fx="mesh" id="specs">
      <div class="container">
        <h2 class="sec-title reveal">Tech specs.</h2>
        <dl class="specs-table reveal">
          <div><dt>Price</dt><dd>From ${short(p.price)}</dd></div>
          <div><dt>Finishes</dt><dd>${p.finishes.map((x) => `<span class="spec-sw"><i style="background:${swatch(x)}"></i>${x.name}</span>`).join('')}</dd></div>
          ${p.hl.map(([b, s]) => `<div><dt>${s.charAt(0).toUpperCase() + s.slice(1)}</dt><dd>${b}</dd></div>`).join('')}
          ${opts.map(([label, ch]) => `<div><dt>${label}</dt><dd>${ch.map((x) => x[0]).join(', ')}</dd></div>`).join('')}
          <div><dt>In the box</dt><dd>${p.name}, USB‑C cable, documentation</dd></div>
          <div><dt>Warranty</dt><dd>Two-year limited warranty. Extend with VoltCare+.</dd></div>
        </dl>
      </div>
    </section>

    <section class="buy" id="buy" data-fx="mesh" data-base="#ffffff">
      <div class="container buy-grid">
        <div class="buy-art"><div class="buy-art-inner" id="buyArt"></div></div>
        <div class="buy-panel" id="buyPanel"></div>
      </div>
    </section>

    <section class="band" data-fx="mesh">
      <div class="container">
        <h2 class="sec-title reveal">You may also like.</h2>
        <div class="grid">${related.map(card).join('')}</div>
      </div>
    </section>`;

  const total = () => p.price + opts.reduce((s, [, ch], i) => s + ch[o[i]][1], 0);
  const soldOut = p.stock === 0;
  const stockText = p.stock == null || p.stock >= 10 ? 'In stock.' : soldOut ? 'Currently sold out.' : `Only ${p.stock} left.`;

  function renderBuy() {
    $('#buyArt').innerHTML = pic(p, 1) + `<span class="fin-chip"><i style="background:${swatch(p.finishes[f])}"></i>${p.finishes[f].name}</span>`;
    $('#buyPanel').innerHTML = `
      ${p.isNew ? '<span class="eyebrow-new">New</span>' : ''}
      <h2>Buy ${p.name}</h2>
      <p class="buy-price">${money(total())} <small>or ${money(total() / 12)}/mo. for 12 mo. at 0% APR</small></p>
      <h5>Finish. <span>Pick your favorite.</span></h5>
      <div class="finishes">${p.finishes.map((x, i) => `<button class="sw${i === f ? ' active' : ''}" data-finish="${i}"><i style="background:${swatch(x)}"></i>${x.name}</button>`).join('')}</div>
      ${opts.map(([label, ch], gi) => `<h5>${label}. <span>Which is best for you?</span></h5>
        <div class="opts">${ch.map(([name, delta], ci) => `<button class="opt${o[gi] === ci ? ' on' : ''}" data-og="${gi}" data-oc="${ci}"><b>${name}</b><span>${delta ? '+ ' + short(delta) : 'Included'}</span></button>`).join('')}</div>`).join('')}
      <div class="summary">
        <div><b>${p.name}</b><span>${[p.finishes[f].name, ...opts.map(([, ch], i) => ch[o[i]][0])].join(' · ')}</span></div>
        <b class="sum-total">${money(total())}</b>
      </div>
      ${soldOut ? '<button class="btn btn-block" disabled>Sold out</button>' : '<button class="btn btn-block" data-buy>Add to Bag</button>'}
      <div class="ship-box">
        <div>${icon('truck')}<span><b>Delivery:</b> ${stockText} Free delivery in 1–2 days.</span></div>
        <div>${icon('pin')}<span><b>Pickup:</b> Available today at a Voltara Store.</span></div>
        <div>${icon('returns')}<span><b>Returns:</b> Free returns within 30 days.</span></div>
      </div>`;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-finish],[data-og],[data-buy],[data-pick]');
    if (!t) return;
    const d = t.dataset;
    if (d.finish) { f = +d.finish; renderBuy(); }
    else if (d.og) { o[+d.og] = +d.oc; renderBuy(); }
    else if (d.pick) { f = +d.pick; renderBuy(); $('#buy').scrollIntoView({ behavior: 'smooth' }); }
    else if ('buy' in d) addToBag(p.id, f, o);
  });

  /* 3D tilt of the hero product with the pointer */
  const hero = $('.p-hero'), heroArt = $('#heroArt');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    heroArt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 24 + 'deg');
    heroArt.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 16 + 'deg');
  });
  hero.addEventListener('pointerleave', () => { heroArt.style.setProperty('--rx', '0deg'); heroArt.style.setProperty('--ry', '0deg'); });

  /* Local nav gets a backdrop once scrolled past the hero */
  addEventListener('scroll', () => $('#lnav').classList.toggle('stuck', scrollY > 40), { passive: true });

  renderBuy();
  App.init(p.cat);
});
