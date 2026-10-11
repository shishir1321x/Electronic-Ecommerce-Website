/* ================= Database layer (Supabase) =================
   With assets/config.js filled in, the catalog, checkout, orders, accounts and the contact
   form use the Supabase database. Without it, the site runs in local demo mode. */
const DB = (() => {
  const cfg = window.VOLTARA_CONFIG || {};
  /* Accept a pasted ".../rest/v1/" URL too: the client needs just https://<project>.supabase.co */
  const url = String(cfg.supabaseUrl || '').trim().replace(/\/(rest|auth)\/v1\/?$/, '').replace(/\/+$/, '');
  const key = String(cfg.supabaseAnonKey || '').trim();
  const sb = url && key && window.supabase ? window.supabase.createClient(url, key) : null;
  const fail = (error) => { throw new Error((error && error.message) || 'Something went wrong. Please try again.'); };

  /* Database rows override the bundled catalog: prices, stock, text, and products added or hidden in Supabase */
  async function loadCatalog() {
    const [{ data: rows, error }, { data: groups }] = await Promise.all([
      sb.from('products').select('*').order('sort'),
      sb.from('option_groups').select('*').order('position'),
    ]);
    if (error || !rows || !rows.length) return;
    const next = rows.map((r) => {
      const p = byId(r.id) || { id: r.id, img: 'assets/img/placeholder.svg', imgS: 'assets/img/placeholder.svg', pos: '50% 50%', hl: [], finishes: [] };
      Object.assign(p, {
        name: r.name, cat: r.category, type: r.type, price: +r.price, isNew: r.is_new,
        tagline: r.tagline, desc: r.description, noOpt: r.no_options, stock: r.stock,
      });
      if (Array.isArray(r.highlights) && r.highlights.length) p.hl = r.highlights;
      if (r.finishes && r.finishes.length) p.finishes = r.finishes.map((k) => F[k] || { name: k, c: ['#e5e5ea', '#8e8e93'] });
      if (!p.finishes.length) p.finishes = [F.silver];
      if (r.image) p.img = p.imgS = r.image;
      if (r.image_pos) p.pos = r.image_pos;
      return p;
    });
    PRODUCTS.splice(0, PRODUCTS.length, ...next);
    if (groups && groups.length) {
      Object.keys(OPTS).forEach((k) => { OPTS[k] = []; });
      groups.forEach((g) => { (OPTS[g.category] = OPTS[g.category] || [])[g.position] = [g.label, g.choices]; });
    }
  }

  async function placeOrder(items, customer, promo) {
    const { data, error } = await sb.rpc('place_order', { p_items: items, p_customer: customer, p_promo: promo || null });
    if (error) fail(error);
    return data;
  }

  async function findOrder(orderNo, email) {
    const { data, error } = await sb.rpc('get_order', { p_order_no: orderNo, p_email: email });
    if (error) fail(error);
    return data;
  }

  async function myOrders() {
    const { data, error } = await sb.from('orders')
      .select('order_no, created_at, status, delivery, subtotal, discount, total, order_items(product_id, name, finish, options, unit_price, qty)')
      .order('created_at', { ascending: false });
    if (error) fail(error);
    return data.map((o) => ({ ...o, items: o.order_items || [] }));
  }

  async function sendMessage(msg) {
    const { error } = await sb.from('contact_messages').insert(msg);
    if (error) fail(error);
  }

  const auth = {
    async user() {
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      return (data && data.session && data.session.user) || null;
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) fail(error);
      return data.user;
    },
    /* Returns { user, session }; session is null when Supabase asks the customer to confirm their email first */
    async signUp(email, password, name) {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
      if (error) fail(error);
      return data;
    },
    async signOut() { await sb.auth.signOut(); },
  };

  return { on: !!sb, loadCatalog, placeOrder, findOrder, myOrders, sendMessage, auth };
})();
