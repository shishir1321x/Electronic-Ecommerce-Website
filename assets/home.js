/* ================= Home page ================= */
App.boot(() => {
  let filter = 'all', sort = 'featured', query = param('q') || '';

  $('#catRow').innerHTML = CATS.map((c) => {
    const p = heroOf(c);
    return `<a class="cat" href="${LINK.cat(c.slug)}"><span class="cat-art">${pic(p)}</span>${c.name}</a>`;
  }).join('');

  $('#latest').innerHTML = PRODUCTS.filter((p) => p.isNew).map((p) => `
    <a class="lcard photo-card" href="${LINK.product(p.id)}">
      ${pic(p)}
      <div class="lc-text"><span class="eyebrow-new">New</span><h3>${p.name}</h3><p>${p.tagline}</p><span class="from">From ${short(p.price)}</span></div>
    </a>`).join('');

  const DIFF = [
    ['truck', '#0071e3', 'Free delivery.', 'On every order, straight to your door.', 'delivery'],
    ['shield', '#1d9f4a', 'VoltCare+.', 'Covered, no matter what.', 'care'],
    ['returns', '#bf4800', 'Easy returns.', 'Free returns within 30 days.', 'returns'],
    ['card', '#8a3ffc', 'Pay monthly.', '0% financing over 12 months.', 'financing'],
    ['swap', '#d6006f', 'Trade in.', 'Get credit toward something new.', 'trade-in'],
    ['chat', '#0a7d8c', 'Personal setup.', 'One-on-one help with a Specialist.', 'setup'],
  ];
  $('#diff').innerHTML = DIFF.map(([ic, col, a, b, page]) =>
    `<a class="dcard" href="${LINK.page(page)}"><span class="d-ico" style="color:${col}">${icon(ic)}</span><h3><em style="color:${col}">${a}</em> ${b}</h3><span class="link">Learn more ›</span></a>`).join('');

  function renderChips() {
    $('#chips').innerHTML = [['all', 'All'], ...CATS.map((c) => [c.slug, c.name])]
      .map(([k, l]) => `<button class="chip${k === filter ? ' active' : ''}" data-chip="${k}">${l}</button>`).join('');
  }
  function renderGrid() {
    const q = query.toLowerCase();
    let list = PRODUCTS.filter((p) => (filter === 'all' || p.cat === filter) && `${p.name} ${catBy(p.cat).name} ${p.tagline}`.toLowerCase().includes(q));
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    $('#empty').hidden = list.length > 0;
    $('#queryNote').hidden = !query;
    $('#queryNote').innerHTML = query ? `Showing results for “${esc(query)}”<button data-clear>Clear</button>` : '';
    $('#grid').innerHTML = list.map(card).join('');
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-chip],[data-clear],[data-scroll]');
    if (!t) return;
    if (t.dataset.chip) { filter = t.dataset.chip; renderChips(); renderGrid(); }
    else if ('clear' in t.dataset) { query = ''; history.replaceState(null, '', 'index.html#products'); renderGrid(); }
    else {
      const [id, dir] = t.dataset.scroll.split(':');
      const el = document.getElementById(id);
      el.scrollBy({ left: +dir * el.clientWidth * 0.8, behavior: 'smooth' });
    }
  });
  $('#sortSelect').addEventListener('change', (e) => { sort = e.target.value; renderGrid(); });

  renderChips();
  renderGrid();
  App.init();
});
