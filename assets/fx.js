/* ================= Animated real-world backgrounds =================
   Any element with data-fx="aurora|stars|clouds|rays|waves|bokeh|rain|snow|mesh"
   gets a canvas scene behind its content. Scenes only animate while visible. */
const FX = (() => {
  const scenes = {};
  const live = new Set();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const f = e.target._fx;
    if (e.isIntersecting) live.add(f); else live.delete(f);
    kick();
  }), { rootMargin: '120px' });

  function size(f) {
    const w = f.el.clientWidth, h = Math.min(f.el.clientHeight, innerHeight + 60);
    if (!w || !h || (w === f.w && h === f.h)) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    f.cv.width = Math.round(w * dpr); f.cv.height = Math.round(h * dpr);
    f.cv.style.height = h + 'px';
    f.w = w; f.h = h;
    f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f.s.resize && f.s.resize(w, h);
    f.s.draw(performance.now() / 1000, 0.016);
  }

  /* A section gets a real photo (data-photo="<product id>", or the scene's WORLD photo)
     with a slow zoom, plus the animated scene drawn over it in "overlay" mode. */
  function mount(el) {
    const scene = scenes[el.dataset.fx];
    const p = el.dataset.photo && byId(el.dataset.photo);
    const src = p ? p.img : WORLD[el.dataset.fx];
    if (el._fx || (!scene && !src)) return;
    const layer = document.createElement('div');
    layer.className = 'fx-layer';
    const f = { el, w: 0, h: 0, mouse, photo: !!src };
    if (src) {
      layer.innerHTML = `<img class="fx-photo" src="${src}" alt="" decoding="async" style="object-position:${el.dataset.pos || (p ? p.pos : '50% 50%')}"><div class="fx-scrim"></div>`;
      f.img = layer.firstChild;
    }
    if (scene) {
      f.cv = document.createElement('canvas');
      f.ctx = f.cv.getContext('2d');
      layer.appendChild(f.cv);
      f.s = scene(f);
    }
    el.prepend(layer);
    el.classList.add('has-fx');
    el._fx = f;
    if (f.s) { size(f); new ResizeObserver(() => size(f)).observe(el); }
    io.observe(el);
  }

  let raf = 0, last = 0;
  function frame(now) {
    raf = 0;
    if (!live.size || reduce) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    const px = `${(-mouse.x * 30).toFixed(1)}px ${(-mouse.y * 18).toFixed(1)}px`;
    live.forEach((f) => {
      if (f.img) f.img.style.translate = px;
      if (f.s && f.w) f.s.draw(now / 1000, dt);
    });
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  return {
    def: (name, fn) => { scenes[name] = fn; },
    init: (root = document) => root.querySelectorAll('[data-fx], [data-photo]').forEach(mount),
  };
})();

const R = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const ridge = (w, h, base, amp, seed) => {
  const pts = [];
  for (let x = -60; x <= w + 60; x += 16) pts.push([x, h * base + Math.sin(x * 0.005 + seed) * h * amp + Math.sin(x * 0.017 + seed * 2) * h * amp * 0.45 + Math.sin(x * 0.05 + seed) * 3]);
  return pts;
};
const fillRidge = (ctx, pts, h, dx, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + dx, h);
  for (const [x, y] of pts) ctx.lineTo(x + dx, y);
  ctx.lineTo(pts[pts.length - 1][0] + dx, h);
  ctx.fill();
};
const vgrad = (ctx, h, stops) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
};

/* --- Northern lights over mountains --- */
FX.def('aurora', (f) => {
  let stars = [], far = [], near = [];
  const off = document.createElement('canvas');
  const bands = [
    { c: '45,255,170', y: 0.36, a: 0.5, sp: 0.22, ph: 0 },
    { c: '0,210,255', y: 0.3, a: 0.32, sp: 0.16, ph: 2.1 },
    { c: '175,95,255', y: 0.24, a: 0.28, sp: 0.19, ph: 4.2 },
  ];
  return {
    resize(w, h) {
      stars = Array.from({ length: Math.round((w * h) / 2600) }, () => ({ x: R(0, w), y: R(0, h * 0.8), r: R(0.4, 1.4), p: R(0, TAU), s: R(0.4, 2) }));
      far = ridge(w, h, 0.8, 0.06, R(0, 9));
      near = ridge(w, h, 0.9, 0.045, R(0, 9));
      off.width = Math.ceil(w / 4); off.height = Math.ceil(h / 4);
    },
    draw(t) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#01030b', '#06152a', '#0b2638']); ctx.fillRect(0, 0, w, h); }
      ctx.fillStyle = '#fff';
      for (const s of stars) {
        if (f.photo && s.y > h * 0.55) continue;
        ctx.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * s.s + s.p))) * (f.photo ? 0.6 : 1);
        ctx.fillRect(s.x + m.x * 8, s.y + m.y * 8, s.r, s.r);
      }
      /* Curtains are drawn at low resolution and scaled up, which blurs them like real aurora */
      const o = off.getContext('2d');
      o.setTransform(1, 0, 0, 1, 0, 0);
      o.clearRect(0, 0, off.width, off.height);
      o.setTransform(off.width / w, 0, 0, off.height / h, 0, 0);
      o.globalCompositeOperation = 'lighter';
      o.lineWidth = 6;
      for (const b of bands) {
        const by = h * b.y;
        const col = (x) => {
          const y = by + Math.sin(x * 0.003 + t * b.sp + b.ph) * h * 0.09 + Math.sin(x * 0.011 - t * b.sp * 1.8) * h * 0.025;
          const len = h * (0.17 + 0.06 * Math.sin(x * 0.008 + t * 0.3 + b.ph) + 0.035 * Math.sin(x * 0.031 - t * 0.7));
          return [x + m.x * 24, y, len, Math.sin(t * 0.4 + x * 0.01) * 10];
        };
        /* [start, end] of each segment as a fraction of curtain height, and its brightness */
        for (const [k0, k1, a, bright] of [[0, 0.22, 1, 0], [0.15, 0.55, 0.5, 0], [0.45, 1, 0.2, 0], [0, 0.4, 0.9, 1]]) {
          o.strokeStyle = `rgba(${b.c},${b.a * a})`;
          /* the bright pass fades in and out smoothly along the curtain, in short chunks */
          for (let x0 = -30; x0 < w + 30; x0 += bright ? 36 : w + 60) {
            o.globalAlpha = bright ? Math.max(0, Math.sin(x0 * 0.005 + t * 0.35 + b.ph)) : 1;
            if (!o.globalAlpha) continue;
            o.beginPath();
            for (let x = x0; x < x0 + (bright ? 36 : w + 60); x += 6) {
              const [xx, y, len, sway] = col(x);
              o.moveTo(xx + sway * k0, y - len * k0);
              o.lineTo(xx + sway * k1, y - len * k1);
            }
            o.stroke();
          }
        }
        o.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = f.photo ? 0.42 : 1;
      ctx.drawImage(off, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (!f.photo) { fillRidge(ctx, far, h, m.x * 10, '#071321'); fillRidge(ctx, near, h, m.x * 22, '#02060c'); }
    },
  };
});

/* --- Milky Way night sky with shooting stars --- */
FX.def('stars', (f) => {
  let stars = [], hill = [], shoot = [];
  return {
    resize(w, h) {
      stars = Array.from({ length: Math.round((w * h) / 900) }, () => {
        let x = R(0, w), y = R(0, h);
        if (Math.random() < 0.55) { const u = Math.random(); x = u * w; y = h * 0.85 - u * h * 0.7 + (Math.random() + Math.random() - 1) * h * 0.13; }
        const k = Math.random();
        return { x, y, r: k < 0.06 ? R(1.3, 2.1) : R(0.3, 1.1), p: R(0, TAU), s: R(0.3, 2.5), c: k < 0.12 ? '#ffd9b0' : k < 0.3 ? '#c4d6ff' : '#ffffff' };
      });
      hill = ridge(w, h, 0.93, 0.03, R(0, 9));
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#010208', '#03040e', '#0a0f22']); ctx.fillRect(0, 0, w, h); }
      if (!f.photo) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.atan2(h * 0.7, w));
      ctx.scale(1, 0.17);
      const r = Math.hypot(w, h) * 0.6;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(160,150,255,${0.26 + 0.04 * Math.sin(t * 0.5)})`);
      g.addColorStop(0.45, 'rgba(90,110,210,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, 2 * r, 2 * r);
      ctx.restore();
      }
      for (const s of stars) {
        if (f.photo && (s.y > h * 0.78 || s.r < 0.7)) continue;
        ctx.globalAlpha = (0.25 + 0.75 * Math.abs(Math.sin(t * s.s + s.p))) * (f.photo ? 0.7 : 1);
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x + m.x * 12, s.y + m.y * 12, s.r, s.r);
      }
      ctx.globalAlpha = 1;
      if (Math.random() < dt * 0.4) shoot.push({ x: R(w * 0.2, w * 1.1), y: R(-20, h * 0.35), vx: -R(520, 820), vy: R(180, 340), life: 1 });
      shoot = shoot.filter((s) => (s.life -= dt * 1.1) > 0);
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (const s of shoot) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        const tx = s.x - s.vx * 0.14, ty = s.y - s.vy * 0.14;
        const sg = ctx.createLinearGradient(s.x, s.y, tx, ty);
        sg.addColorStop(0, `rgba(255,255,255,${s.life})`);
        sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sg;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
      }
      if (!f.photo) fillRidge(ctx, hill, h, m.x * 16, '#000');
    },
  };
});

/* --- Daytime sky: drifting clouds, sun glow and birds --- */
FX.def('clouds', (f) => {
  let clouds = [], birds = [];
  const sprite = (wd) => {
    const ht = wd * 0.5, c = document.createElement('canvas');
    c.width = wd; c.height = ht * 1.45;
    const x = c.getContext('2d');
    /* Overlapping puffs along a dome profile: tall in the middle, flat-ish base */
    const puffs = Array.from({ length: 24 }, (_, i) => {
      const u = i / 23, dome = Math.sin(u * Math.PI);
      const r = ht * (0.13 + 0.2 * dome) * R(0.85, 1.12);
      return [wd * (0.16 + 0.68 * u) + R(-10, 10), ht * 0.84 - dome * ht * 0.3 + R(-6, 6), r];
    });
    for (const [px, py, r] of puffs) {
      const g = x.createRadialGradient(px, py + r * 0.35, 0, px, py + r * 0.35, r * 1.05);
      g.addColorStop(0, 'rgba(168,184,208,0.45)'); g.addColorStop(1, 'rgba(168,184,208,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py + r * 0.35, r * 1.05, 0, TAU); x.fill();
    }
    for (const [px, py, r] of puffs) {
      const g = x.createRadialGradient(px - r * 0.25, py - r * 0.35, 0, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.5, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    }
    return c;
  };
  const bird = (w, h) => ({ x: R(-200, -40), y: R(h * 0.15, h * 0.45), v: R(30, 55), p: R(0, TAU), s: R(0.7, 1.2) });
  return {
    resize(w, h) {
      const sprites = [260, 320, 380, 440, 500].map(sprite);
      clouds = Array.from({ length: Math.max(6, Math.round(w / 170)) }, (_, i) => {
        const z = [0.45, 0.7, 1.05][i % 3];
        return { img: sprites[i % 5], x: R(-300, w), y: R(-h * 0.05, h * (0.15 + 0.45 * z)), z, v: 5 + z * 16, a: 0.55 + z * 0.4 };
      }).sort((a, b) => a.z - b.z);
      birds = Array.from({ length: 4 }, () => ({ ...bird(w, h), x: R(-200, w) }));
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#9fcdfd', '#cfe6ff', '#f2f8ff', '#ffffff']); ctx.fillRect(0, 0, w, h); }
      const sx = w * 0.84 + m.x * 10, sy = h * 0.1;
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.55);
      sun.addColorStop(0, 'rgba(255,253,240,0.95)'); sun.addColorStop(0.15, 'rgba(255,246,215,0.55)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
      if (!f.photo) { ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h); }
      for (const c of clouds) {
        c.x += c.v * dt;
        const cw = c.img.width * c.z;
        if (c.x > w + 20) { c.x = -cw - R(0, 200); c.y = R(-h * 0.05, h * (0.15 + 0.45 * c.z)); }
        ctx.globalAlpha = c.a * (f.photo ? 0.5 : 1);
        ctx.drawImage(c.img, c.x + m.x * 30 * c.z, c.y + m.y * 14 * c.z, cw, c.img.height * c.z);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(40,52,72,0.55)';
      ctx.lineWidth = 1.4;
      for (const b of birds) {
        b.x += b.v * dt;
        if (b.x > w + 40) Object.assign(b, bird(w, h));
        const y = b.y + Math.sin(t * 0.8 + b.p) * 6, fl = Math.sin(t * 9 + b.p) * 4 * b.s, s = 6 * b.s;
        ctx.beginPath();
        ctx.moveTo(b.x - s, y - fl); ctx.quadraticCurveTo(b.x - s / 2, y - fl / 2 - 2, b.x, y);
        ctx.quadraticCurveTo(b.x + s / 2, y - fl / 2 - 2, b.x + s, y - fl);
        ctx.stroke();
      }
    },
  };
});

/* --- Warm morning sunbeams with floating dust --- */
FX.def('rays', (f) => {
  let motes = [];
  return {
    resize(w, h) {
      motes = Array.from({ length: Math.round((w * h) / 8000) }, () => ({ x: R(0, w), y: R(0, h), r: R(0.6, 2.6), vx: R(-5, 5), vy: R(-12, -2), p: R(0, TAU) }));
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#fff4e2', '#fbf7f1', '#f5f5f7']); ctx.fillRect(0, 0, w, h); }
      const ox = (f.photo ? w * 0.62 : w * 0.16) + m.x * 30, oy = f.photo ? h * 0.1 : -h * 0.18;
      ctx.globalCompositeOperation = f.photo ? 'lighter' : 'source-over';
      const sg = ctx.createRadialGradient(ox, oy, 0, ox, oy, h * 1.1);
      sg.addColorStop(0, `rgba(255,205,130,${f.photo ? 0.2 : 0.6})`); sg.addColorStop(1, 'rgba(255,205,130,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
      const L = Math.hypot(w, h) * 1.3;
      for (let i = 0; i < 10; i++) {
        const a = (f.photo ? 1.05 + i * 0.11 : 0.3 + i * 0.12) + Math.sin(t * 0.12 + i * 1.7) * 0.035;
        const sp = 0.022 + 0.018 * Math.sin(t * 0.25 + i);
        const al = (0.11 + 0.09 * Math.sin(t * 0.35 + i * 2.1)) * (f.photo ? 0.45 : 1);
        const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * L * 0.8, oy + Math.sin(a) * L * 0.8);
        g.addColorStop(0, `rgba(255,214,150,${al + 0.08})`); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(a - sp) * L, oy + Math.sin(a - sp) * L);
        ctx.lineTo(ox + Math.cos(a + sp) * L, oy + Math.sin(a + sp) * L);
        ctx.fill();
      }
      ctx.fillStyle = f.photo ? '#ffd890' : '#d9963a';
      for (const d of motes) {
        d.x += (d.vx + Math.sin(t * 0.7 + d.p) * 9) * dt; d.y += d.vy * dt;
        if (d.y < -6) { d.y = h + 6; d.x = R(0, w); }
        if (d.x < -6) d.x = w + 6; else if (d.x > w + 6) d.x = -6;
        ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.3 + d.p));
        ctx.beginPath(); ctx.arc(d.x + m.x * 14 * d.r, d.y + m.y * 14 * d.r, d.r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
});

/* --- Sunset over a rolling ocean --- */
FX.def('waves', (f) => {
  let stars = [], glints = [];
  const seas = ['rgba(70,34,78,0.55)', 'rgba(40,24,60,0.72)', 'rgba(20,16,42,0.86)', 'rgba(7,9,24,0.96)'];
  return {
    resize(w, h) {
      stars = Array.from({ length: 60 }, () => ({ x: R(0, w), y: R(0, h * 0.3), p: R(0, TAU) }));
      glints = Array.from({ length: 140 }, () => { const y = R(0.12, 1); return { x: w * (0.66 + (Math.random() - 0.5) * (0.15 + y * 0.7)), y: h * (0.22 + y * 0.74), s: R(1.5, 4), p: R(0, TAU), r: R(1, 2.6) }; });
    },
    draw(t) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const g of glints) {
          const a = Math.pow(Math.max(0, Math.sin(t * g.s + g.p)), 6);
          if (a < 0.02) continue;
          ctx.fillStyle = `rgba(255,214,160,${a * 0.9})`;
          ctx.beginPath(); ctx.ellipse(g.x + m.x * 10, g.y, g.r * 3, g.r * 0.7, 0, 0, TAU); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        return;
      }
      const hz = h * 0.6;
      ctx.fillStyle = vgrad(ctx, hz, ['#090b22', '#2a1844', '#7e3560', '#d8676a', '#f6a35d']);
      ctx.fillRect(0, 0, w, hz);
      ctx.fillStyle = '#fff';
      for (const s of stars) { ctx.globalAlpha = 0.5 * Math.abs(Math.sin(t * 0.8 + s.p)); ctx.fillRect(s.x, s.y, 1.2, 1.2); }
      ctx.globalAlpha = 1;
      const sx = w * 0.5 + m.x * 24, sr = h * 0.12;
      const glow = ctx.createRadialGradient(sx, hz, 0, sx, hz, h * 0.7);
      glow.addColorStop(0, 'rgba(255,200,130,0.6)'); glow.addColorStop(1, 'rgba(255,120,90,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, hz);
      const sun = ctx.createLinearGradient(0, hz - sr, 0, hz);
      sun.addColorStop(0, '#fff0c4'); sun.addColorStop(1, '#ff8456');
      ctx.fillStyle = sun;
      ctx.beginPath(); ctx.arc(sx, hz + sr * 0.3, sr, 0, TAU); ctx.fill();
      ctx.fillStyle = vgrad(ctx, h - hz, ['#8a4766', '#2c1a3c', '#070a18']);
      ctx.save(); ctx.translate(0, hz); ctx.fillRect(0, 0, w, h - hz); ctx.restore();
      for (let i = 0; i < 26; i++) {
        const k = i / 26, y = hz + 3 + (h - hz) * Math.pow(k, 1.5);
        const bw = sr * 1.7 * (1 - k * 0.6) * (0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.3));
        ctx.fillStyle = `rgba(255,196,140,${0.55 * (1 - k)})`;
        ctx.fillRect(sx - bw / 2 + Math.sin(t * 1.4 + i) * 8, y, bw, 1.6 + k * 2);
      }
      for (let k = 0; k < 4; k++) {
        const y0 = hz + (h - hz) * (0.2 + k * 0.22), A = 3 + k * 6, sp = 0.45 + k * 0.28, len = 0.011 - k * 0.002;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 10; x += 10) ctx.lineTo(x, y0 + Math.sin(x * len + t * sp + k) * A + Math.sin(x * len * 2.7 - t * sp * 1.3) * A * 0.4);
        ctx.lineTo(w + 10, h); ctx.closePath();
        ctx.fillStyle = seas[k]; ctx.fill();
        ctx.strokeStyle = `rgba(255,170,140,${0.2 - k * 0.04})`; ctx.lineWidth = 1.2; ctx.stroke();
      }
    },
  };
});

/* --- Out-of-focus city lights at night --- */
FX.def('bokeh', (f) => {
  let dots = [];
  const cols = ['255,170,80', '255,95,120', '90,170,255', '255,225,150', '170,120,255'];
  return {
    resize(w, h) {
      dots = Array.from({ length: Math.round((w * h) / 20000) + 14 }, () => ({ x: R(0, w), y: R(0, h), r: R(8, 62), c: cols[(Math.random() * cols.length) | 0], a: R(0.12, 0.42), vx: R(-8, 8), vy: R(-14, -3), p: R(0, TAU), z: R(0.3, 1) }));
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#04040a', '#0b0816', '#150d1f']); ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'lighter';
      for (const d of dots) {
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.y < -d.r) { d.y = h + d.r; d.x = R(0, w); }
        if (d.x < -d.r) d.x = w + d.r; else if (d.x > w + d.r) d.x = -d.r;
        const x = d.x + m.x * 46 * d.z, y = d.y + m.y * 46 * d.z, a = d.a * (0.65 + 0.35 * Math.sin(t * 0.8 + d.p));
        const g = ctx.createRadialGradient(x, y, 0, x, y, d.r);
        g.addColorStop(0, `rgba(${d.c},${a * 0.6})`); g.addColorStop(0.84, `rgba(${d.c},${a})`); g.addColorStop(1, `rgba(${d.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, d.r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
});

/* --- Neon city in the rain, with the odd lightning flash --- */
FX.def('rain', (f) => {
  let drops = [], splashes = [], city = null, flash = 0;
  const neon = [['255,60,170', 0.2, 0.55], ['0,220,255', 0.78, 0.5], ['140,80,255', 0.5, 0.32]];
  return {
    resize(w, h) {
      drops = Array.from({ length: Math.round((w * h) / 2200) }, () => ({ x: R(-w * 0.2, w), y: R(-h, h), l: R(10, 26), v: R(700, 1150) }));
      const ch = Math.round(h * 0.6);
      city = document.createElement('canvas');
      city.width = w + 80; city.height = ch;
      const c = city.getContext('2d');
      for (let x = 0; x < w + 80;) {
        const bw = R(36, 110), bh = R(ch * 0.25, ch * 0.95);
        c.fillStyle = `rgb(${8 + R(0, 6)},${9 + R(0, 6)},${18 + R(0, 10)})`;
        c.fillRect(x, ch - bh, bw - 3, bh);
        for (let wy = ch - bh + 10; wy < ch - 8; wy += 11) for (let wx = x + 6; wx < x + bw - 10; wx += 9) {
          if (Math.random() < 0.22) { c.fillStyle = Math.random() < 0.7 ? `rgba(255,205,120,${R(0.35, 0.85)})` : `rgba(150,210,255,${R(0.3, 0.8)})`; c.fillRect(wx, wy, 4, 6); }
        }
        x += bw;
      }
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#03040c', '#0a0d26', '#170f2c']); ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'lighter';
      if (!f.photo) neon.forEach(([c, nx, ny], i) => {
        let a = 0.24 + 0.05 * Math.sin(t * 3 + i);
        if (Math.sin(t * 13 + i * 7) > 0.97) a *= 0.35;
        const x = w * nx + m.x * 20, y = h * ny, r = h * 0.45;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      ctx.globalCompositeOperation = 'source-over';
      if (!f.photo) ctx.drawImage(city, -40 + m.x * 14, h - city.height);
      if (flash <= 0 && Math.random() < dt * 0.06) flash = 0.6;
      if (flash > 0) {
        ctx.fillStyle = `rgba(200,215,255,${flash * (Math.sin(t * 70) > 0 ? 0.5 : 0.18)})`;
        ctx.fillRect(0, 0, w, h);
        flash -= dt * 1.6;
      }
      ctx.strokeStyle = 'rgba(170,190,255,0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v * dt; d.x += d.v * 0.16 * dt;
        if (d.y > h) {
          if (splashes.length < 80 && Math.random() < 0.3) splashes.push({ x: d.x, y: h - R(0, h * 0.06), r: 0, a: 0.5 });
          d.y = R(-60, 0); d.x = R(-w * 0.2, w);
        }
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.16, d.y - d.l);
      }
      ctx.stroke();
      splashes = splashes.filter((s) => (s.a -= dt * 1.8) > 0);
      for (const s of splashes) {
        s.r += 40 * dt;
        ctx.strokeStyle = `rgba(190,205,255,${s.a})`;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.3, 0, 0, TAU); ctx.stroke();
      }
    },
  };
});

/* --- Gentle snowfall over winter hills --- */
FX.def('snow', (f) => {
  let flakes = [], far = [], near = [];
  return {
    resize(w, h) {
      flakes = Array.from({ length: Math.round((w * h) / 3200) }, () => { const r = R(0.8, 3.8); return { x: R(0, w), y: R(0, h), r, v: r * R(9, 14), p: R(0, TAU), sw: R(10, 30) }; });
      far = ridge(w, h, 0.82, 0.05, R(0, 9));
      near = ridge(w, h, 0.92, 0.035, R(0, 9));
    },
    draw(t, dt) {
      const { ctx, w, h, mouse: m } = f;
      if (f.photo) ctx.clearRect(0, 0, w, h);
      else { ctx.fillStyle = vgrad(ctx, h, ['#b8c9dc', '#d6e1ec', '#e8eef4']); ctx.fillRect(0, 0, w, h); }
      const sx = w * 0.72, sy = h * 0.18;
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.5);
      sun.addColorStop(0, 'rgba(255,255,255,0.85)'); sun.addColorStop(1, 'rgba(255,255,255,0)');
      if (!f.photo) {
        ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);
        fillRidge(ctx, far, h, m.x * 8, '#e3eaf2');
        fillRidge(ctx, near, h, m.x * 18, '#f6f8fb');
      }
      ctx.fillStyle = '#fff';
      for (const s of flakes) {
        s.y += s.v * dt;
        if (s.y > h + 5) { s.y = -5; s.x = R(0, w); }
        const x = s.x + Math.sin(t * 0.6 + s.p) * s.sw + m.x * s.r * 10, y = s.y;
        ctx.globalAlpha = 0.55 + s.r * 0.1;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
});

/* --- Soft drifting colour mesh (for store sections) --- */
FX.def('mesh', (f) => {
  const blobs = [['0,113,227', 0.11], ['162,89,255', 0.1], ['255,107,74', 0.08], ['52,199,89', 0.07], ['0,200,255', 0.09]]
    .map(([c, a], i) => ({ c, a, p: i * 1.3, sx: R(0.12, 0.24), sy: R(0.1, 0.2) }));
  return {
    draw(t) {
      const { ctx, w, h } = f;
      ctx.fillStyle = f.el.dataset.base || '#f5f5f7';
      ctx.fillRect(0, 0, w, h);
      for (const b of blobs) {
        const x = w * (0.5 + 0.45 * Math.sin(t * b.sx + b.p)), y = h * (0.5 + 0.42 * Math.cos(t * b.sy + b.p * 1.7)), r = Math.max(w, h) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${b.c},${b.a})`); g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
    },
  };
});
