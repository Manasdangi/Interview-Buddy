/* Step-by-step diagrams of the optimised solution for each problem.
   VIZ.render(id, frameIndex) -> HTML for the figure. */
(function () {
  const W = 360, PX = 8;
  let uid = 0;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pH = s => { const o = {}; if (!s) return o; String(s).split(',').forEach(t => { t = t.trim(); if (t) o[t.slice(0, -1)] = t.slice(-1); }); return o; };
  const pP = s => { const o = {}; if (!s) return o; String(s).split(',').forEach(t => { const k = t.indexOf(':'); const i = t.slice(0, k).trim(); (o[i] = o[i] || []).push(t.slice(k + 1).trim()); }); return o; };
  const fz = (t, w, max = 14) => Math.max(8, Math.min(max, (w - 5) / (Math.max(1, [...String(t)].length) * 0.62)));
  const c = k => (k ? ` v-${k}` : '');
  const txt = (x, y, t, cl, size) => `<text x="${x}" y="${y}" class="${cl}"${size ? ` font-size="${size.toFixed(1)}"` : ''}>${esc(t)}</text>`;
  const rect = (x, y, w, h, cl, rx = 4) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${rx}" class="${cl}"/>`;

  // ---------- row renderers: each returns { s, h } ----------
  function arr(r, y, m) {
    const n = r.v.length, lw = r.x ? 52 : 0, tw = r.top ? 40 : 0;
    const avail = W - 2 * PX - lw - tw, cw = Math.min(42, Math.floor(avail / n)), ch = 30;
    const x0 = PX + lw + Math.max(0, (avail - cw * n) / 2);
    const H = pH(r.h); let s = '';
    const cy = y + (r.arc ? 30 : 0);
    if (r.x) s += txt(PX, cy + ch / 2 + 4, r.x, 'vl');
    r.v.forEach((v, i) => {
      const x = x0 + i * cw, t = String(v), size = fz(t, cw);
      s += rect(x, cy, cw, ch, 'vc' + c(H[i]), 3) + txt(x + cw / 2, cy + ch / 2 + size * 0.36, t, 'vt', size);
    });
    if (r.top) s += txt(x0 + n * cw + 5, cy + ch / 2 + 4, '← top', 'vl');
    if (r.w) { const [l, rr] = r.w; s += rect(x0 + l * cw - 3, cy - 4, (rr - l + 1) * cw + 6, ch + 8, 'vw', 8); }
    (r.arc || []).forEach(([a, b, lab]) => {
      const xa = x0 + a * cw + cw / 2, xb = x0 + b * cw + cw / 2, hg = Math.min(24, 9 + Math.abs(b - a) * 3);
      s += `<path d="M${xa} ${cy - 3} Q ${(xa + xb) / 2} ${cy - 3 - hg * 2} ${xb} ${cy - 5}" class="va" marker-end="url(#${m}a)"/>`;
      if (lab) s += txt((xa + xb) / 2, cy - hg - 6, lab, 'vtl');
    });
    let yy = cy + ch;
    if (r.i || r.il) { r.v.forEach((_, i) => { s += txt(x0 + i * cw + cw / 2, yy + 11, r.il ? r.il[i] : i, 'vi'); }); yy += 13; }
    if (r.p) {
      Object.entries(pP(r.p)).forEach(([i, labs]) => { const x = x0 + (+i) * cw + cw / 2; s += txt(x, yy + 11, '▲', 'vp') + txt(x, yy + 23, labs.join(' '), 'vp'); });
      yy += 26;
    }
    return { s, h: yy - y };
  }

  function kv(r, y) {
    const lw = r.x ? 52 : 0, H = pH(r.h); let x = PX + lw, yy = y, s = '';
    if (r.x) s += txt(PX, y + 16, r.x, 'vl');
    r.v.forEach(([k, v]) => {
      const t = `${k} → ${v}`, w = [...t].length * 7.1 + 16;
      if (x + w > W - PX && x > PX + lw) { x = PX + lw; yy += 30; }
      s += rect(x, yy, w, 24, 'vc' + c(H[k]), 6) + txt(x + w / 2, yy + 16, t, 'vt', 12);
      x += w + 6;
    });
    return { s, h: yy - y + 24 };
  }

  function note(r, y) {
    const words = String(r.v).split(' '), lines = []; let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > 46) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
    if (cur.trim()) lines.push(cur.trim());
    return { s: lines.map((l, i) => `<text x="${W / 2}" y="${y + 15 + i * 19}" class="vn">${esc(l)}</text>`).join(''), h: lines.length * 19 + 2 };
  }

  function bars(r, y) {
    const n = r.v.length, cw = Math.min(30, Math.floor((W - 2 * PX) / n)), x0 = (W - cw * n) / 2;
    const water = r.water || [], H = pH(r.h);
    const mx = Math.max(1, ...r.v.map((h, i) => h + (water[i] || 0)));
    const unit = Math.min(12, 96 / mx), base = y + mx * unit + 6; let s = '';
    if (r.rect) { const [l, rr, hh] = r.rect; s += rect(x0 + l * cw, base - hh * unit, (rr - l + 1) * cw, hh * unit, 'vrect', 2); }
    r.v.forEach((h, i) => {
      const x = x0 + i * cw;
      if (water[i]) s += rect(x + 2, base - (h + water[i]) * unit, cw - 4, water[i] * unit, 'vwater', 1);
      if (h) s += rect(x + 2, base - h * unit, cw - 4, h * unit, 'vc' + c(H[i]), 2);
      s += txt(x + cw / 2, base + 12, h, 'vi');
    });
    s += `<line x1="${x0}" y1="${base}" x2="${x0 + n * cw}" y2="${base}" class="ve"/>`;
    let yy = base + 15;
    if (r.p) { Object.entries(pP(r.p)).forEach(([i, labs]) => { const x = x0 + (+i) * cw + cw / 2; s += txt(x, yy + 11, '▲', 'vp') + txt(x, yy + 23, labs.join(' '), 'vp'); }); yy += 26; }
    return { s, h: yy - y };
  }

  function grid(r, y) {
    const rows = r.v.length, cols = r.v[0].length, cs = Math.min(32, Math.floor(300 / cols)), x0 = (W - cs * cols) / 2, H = pH(r.h); let s = '';
    r.v.forEach((row, i) => row.forEach((v, j) => { s += rect(x0 + j * cs, y + i * cs, cs, cs, 'vc' + c(H[`${i}.${j}`]), 2) + txt(x0 + j * cs + cs / 2, y + i * cs + cs / 2 + 5, v, 'vt', 13); }));
    return { s, h: rows * cs };
  }

  function tree(r, y) {
    const v = r.v; let last = 0; v.forEach((x, i) => { if (x !== null && x !== undefined) last = i; });
    const depth = Math.floor(Math.log2(last + 1)) + 1, LH = 46, H = pH(r.h), lab = r.lab || {};
    const pos = i => { const d = Math.floor(Math.log2(i + 1)), k = i - (2 ** d - 1); return [PX + (k + 0.5) * ((W - 2 * PX) / 2 ** d), y + 20 + d * LH]; };
    let s = '';
    v.forEach((x, i) => { if (x === null || x === undefined || i === 0) return; const p = Math.floor((i - 1) / 2); const [x1, y1] = pos(p), [x2, y2] = pos(i); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ve"/>`; });
    v.forEach((x, i) => {
      if (x === null || x === undefined) return;
      const [px, py] = pos(i), t = String(x);
      if ([...t].length <= 3) s += `<circle cx="${px}" cy="${py}" r="14" class="vc${c(H[i])}"/>`;
      else { const w = [...t].length * 7 + 12; s += rect(px - w / 2, py - 12, w, 24, 'vc' + c(H[i]), 12); }
      s += txt(px, py + 4.5, t, 'vt', 12);
      if (lab[i]) s += txt(px, py - 19, lab[i], 'vtl');
    });
    return { s, h: 20 + (depth - 1) * LH + 22 };
  }

  function list(r, y, m) {
    const n = r.v.length, nw = 34, nh = 26, lw = r.x ? 40 : 0, tw = r.tail ? 26 : 0;
    const gaps = Math.max(1, n - 1 + (r.tail ? 1 : 0));
    const gap = Math.min(26, (W - 2 * PX - lw - n * nw - tw) / gaps), x0 = PX + lw, H = pH(r.h);
    const d = r.d || '>'.repeat(Math.max(0, n - 1)); let s = '';
    if (r.x) s += txt(PX, y + 18, r.x, 'vl');
    const nx = i => x0 + i * (nw + gap);
    r.v.forEach((v, i) => { s += rect(nx(i), y, nw, nh, 'vc' + c(H[i]), 6) + txt(nx(i) + nw / 2, y + 18, v, 'vt', 13); });
    for (let i = 0; i < n - 1; i++) {
      const xa = nx(i) + nw + 1, xb = nx(i + 1) - 1, ch = d[i];
      if (ch === '>') s += `<path d="M${xa} ${y + nh / 2}H${xb}" class="ve" marker-end="url(#${m}k)"/>`;
      if (ch === '<') s += `<path d="M${xb} ${y + nh / 2}H${xa}" class="ve" marker-end="url(#${m}k)"/>`;
    }
    if (r.tail) { const xa = nx(n - 1) + nw + 1; s += `<path d="M${xa} ${y + nh / 2}H${xa + gap - 2}" class="ve" marker-end="url(#${m}k)"/>` + txt(xa + gap + 8, y + 18, r.tail, 'vt', 13); }
    let yy = y + nh;
    if (r.cyc !== undefined) {
      const xa = nx(n - 1) + nw / 2, xb = nx(r.cyc) + nw / 2;
      s += `<path d="M${xa} ${yy + 1} C ${xa} ${yy + 26}, ${xb} ${yy + 26}, ${xb} ${yy + 4}" class="va" marker-end="url(#${m}a)"/>`; yy += 22;
    }
    if (r.p) {
      Object.entries(pP(r.p)).forEach(([i, labs]) => { const x = (+i >= n ? nx(n - 1) + nw + gap + 8 : nx(+i) + nw / 2); s += txt(x, yy + 11, '▲', 'vp') + txt(x, yy + 23, labs.join(' '), 'vp'); });
      yy += 26;
    }
    return { s, h: yy - y };
  }

  function intervals(r, y) {
    const mx = r.max, sx = v => PX + 14 + v * (W - 2 * PX - 28) / mx; let s = '';
    r.v.forEach(([a, b, k, lab], i) => {
      const yy = y + i * 22;
      s += rect(sx(a), yy, Math.max(6, sx(b) - sx(a)), 16, 'vc' + c(k), 4) + txt((sx(a) + sx(b)) / 2, yy + 12, lab || `${a}–${b}`, 'vt', 10);
    });
    const ay = y + r.v.length * 22 + 6, step = mx <= 10 ? 1 : mx <= 20 ? 2 : 5;
    s += `<line x1="${sx(0)}" y1="${ay}" x2="${sx(mx)}" y2="${ay}" class="ve"/>`;
    for (let t = 0; t <= mx; t += step) s += `<line x1="${sx(t)}" y1="${ay - 3}" x2="${sx(t)}" y2="${ay + 3}" class="ve"/>` + txt(sx(t), ay + 14, t, 'vi');
    return { s, h: ay + 16 - y };
  }

  function graph(r, y, m) {
    const N = {}; r.n.forEach(([id, x, yy, k, lab, t]) => { N[id] = { x, y: y + yy, k, lab, t: t === undefined ? id : t }; });
    let s = '';
    r.e.forEach(([a, b, w, k, dir]) => {
      const A = N[a], B = N[b], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const x1 = A.x + ux * 15, y1 = A.y + uy * 15, x2 = B.x - ux * (dir ? 17 : 15), y2 = B.y - uy * (dir ? 17 : 15);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ve${k ? ' ve-' + k : ''}"${dir ? ` marker-end="url(#${m}k)"` : ''}/>`;
      if (w !== undefined && w !== '') s += txt((A.x + B.x) / 2 - uy * 9, (A.y + B.y) / 2 + ux * 9 + 4, w, 'vw8');
    });
    Object.values(N).forEach(nd => {
      s += `<circle cx="${nd.x}" cy="${nd.y}" r="14" class="vc${c(nd.k)}"/>` + txt(nd.x, nd.y + 4, nd.t, 'vt', fz(nd.t, 28, 12));
      if (nd.lab) s += txt(nd.x, nd.y - 19, nd.lab, 'vtl');
    });
    return { s, h: r.H };
  }

  function matrix(r, y) {
    const rows = r.r.length, cols = r.c.length, cs = Math.min(30, Math.floor((W - 2 * PX - 24) / cols));
    const x0 = (W - cs * cols) / 2 + 10, y0 = y + 16, H = pH(r.h); let s = '';
    r.c.forEach((t, j) => { s += txt(x0 + j * cs + cs / 2, y + 11, t === '' ? 'ε' : t, 'vi'); });
    r.r.forEach((t, i) => { s += txt(x0 - 10, y0 + i * cs + cs / 2 + 4, t === '' ? 'ε' : t, 'vi'); });
    r.v.forEach((row, i) => row.forEach((v, j) => { s += rect(x0 + j * cs, y0 + i * cs, cs, cs, 'vc' + c(H[`${i}.${j}`]), 2) + txt(x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 4.5, v, 'vt', 12); }));
    return { s, h: 16 + rows * cs };
  }

  const ROW = { a: arr, kv, n: note, b: bars, g: grid, t: tree, l: list, i: intervals, gr: graph, m: matrix };

  // colour meaning used in every legend
  const LEG = { y: 'looking at now', g: 'kept / answer', r: 'rejected / removed', b: 'second group', m: 'ruled out' };
  function used(rows) {
    const k = new Set(); let win = false, ptr = false, water = false, area = false;
    const addH = h => { if (h) String(h).split(',').forEach(t => { t = t.trim(); if (t) k.add(t.slice(-1)); }); };
    rows.forEach(r => {
      addH(r.h);
      if (r.t === 'gr') { r.n.forEach(nd => nd[3] && k.add(nd[3])); r.e.forEach(e => e[3] && k.add(e[3])); }
      if (r.t === 'i') r.v.forEach(x => x[2] && k.add(x[2]));
      if (r.w) win = true;
      if (r.p) ptr = true;
      if (r.water && r.water.some(x => x)) water = true;
      if (r.rect) area = true;
    });
    return { k: ['y', 'g', 'r', 'b', 'm'].filter(x => k.has(x)), win, ptr, water, area };
  }
  function wrap(text, max) {
    const out = []; let cur = '';
    String(text || '').split(' ').forEach(w => { if ((cur + ' ' + w).trim().length > max) { if (cur) out.push(cur.trim()); cur = w; } else cur += ' ' + w; });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  // one picture = header band + explanation + drawing + (answer) + legend, all inside the SVG
  function frameSVG(rows, meta) {
    const m = 'vz' + (++uid); let body = '', y = 0;
    body += `<rect x="0" y="0" width="${W}" height="26" rx="7" class="vhd"/>`
      + `<text x="10" y="17.5" class="vht">${esc(meta.head)}</text>`
      + `<text x="${W - 10}" y="17.5" class="vht vr">${esc(meta.step)}</text>`;
    y = 34;
    const capLines = wrap(meta.cap, 56);
    capLines.forEach((ln, i) => { body += `<text x="${PX}" y="${y + 12 + i * 17}" class="vcap">${esc(ln)}</text>`; });
    y += capLines.length * 17 + 12;
    rows.forEach(r => { const out = ROW[r.t](r, y, m); body += out.s; y += out.h + 12; });
    if (meta.ans) {
      const al = wrap('✓ Answer: ' + meta.ans, 50), h = al.length * 17 + 12;
      body += rect(PX, y, W - 2 * PX, h, 'vans', 8);
      al.forEach((ln, i) => { body += `<text x="${PX + 10}" y="${y + 19 + i * 17}" class="vanst">${esc(ln)}</text>`; });
      y += h + 12;
    }
    const u = used(rows), items = u.k.map(k => [k, LEG[k]]);
    if (u.win) items.push(['w', 'current window']);
    if (u.ptr) items.push(['p', 'pointer']);
    if (u.water) items.push(['wa', 'trapped water']);
    if (u.area) items.push(['ar', 'area being measured']);
    if (items.length) {
      let x = PX; y += 2;
      body += `<line x1="${PX}" y1="${y - 6}" x2="${W - PX}" y2="${y - 6}" class="vsep"/>`;
      items.forEach(([k, lab]) => {
        const w = lab.length * 5.6 + 22;
        if (x + w > W - PX) { x = PX; y += 16; }
        if (k === 'w') body += rect(x, y + 1, 12, 10, 'vw', 3);
        else if (k === 'wa') body += rect(x, y + 1, 12, 10, 'vwater', 2);
        else if (k === 'ar') body += rect(x, y + 1, 12, 10, 'vrect', 2);
        else if (k === 'p') body += `<text x="${x + 6}" y="${y + 10}" class="vp">▲</text>`;
        else body += rect(x, y + 1, 12, 10, 'vc v-' + k, 2);
        body += `<text x="${x + 16}" y="${y + 10}" class="vleg">${esc(lab)}</text>`;
        x += w;
      });
      y += 18;
    }
    return `<svg viewBox="0 0 ${W} ${y}" role="img" aria-label="${esc(meta.head + '. ' + meta.cap + (meta.ans ? ' Answer: ' + meta.ans : ''))}"><defs>
      <marker id="${m}a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="vmk-a"/></marker>
      <marker id="${m}k" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="vmk-k"/></marker>
      </defs>${body}</svg>`;
  }

  // ---------- spec helpers ----------
  const a = (v, o = {}) => ({ t: 'a', v, ...o });
  const s = (v, o = {}) => ({ t: 'a', v, top: 1, ...o });
  const kvr = (v, o = {}) => ({ t: 'kv', v, ...o });
  const n = v => ({ t: 'n', v });
  const b = (v, o = {}) => ({ t: 'b', v, ...o });
  const g = (v, o = {}) => ({ t: 'g', v, ...o });
  const tr = (v, o = {}) => ({ t: 't', v, ...o });
  const l = (v, o = {}) => ({ t: 'l', v, ...o });
  const iv = (v, o = {}) => ({ t: 'i', v, ...o });
  const gr = (nodes, e, o = {}) => ({ t: 'gr', n: nodes, e, ...o });
  const m = (r, cc, v, o = {}) => ({ t: 'm', r, c: cc, v, ...o });
  const F = (cap, ...r) => ({ c: cap, r });
  const N = null;

  const S = {
    1: [F('i = 0: need 9 − 2 = 7. Not in the map, so store 2 → 0.', a([2, 7, 11, 15], { x: 'nums', h: '0y', p: '0:i', i: 1 }), kvr([[2, 0]], { x: 'map' })),
        F('i = 1: need 9 − 7 = 2. It is in the map at index 0 → answer [0, 1].', a([2, 7, 11, 15], { x: 'nums', h: '0g,1y', p: '1:i', i: 1 }), kvr([[2, 0]], { x: 'map', h: '2g' }))],
    2: [F('Walk both words together: +1 for each letter of s, −1 for each letter of t.', a([...'anagram'], { x: 's' }), a([...'nagaram'], { x: 't' })),
        F('Every counter ends at 0 → same tiles → anagram.', kvr([['a', 0], ['n', 0], ['g', 0], ['r', 0], ['m', 0]], { x: 'count', h: 'ag,ng,gg,rg,mg' }))],
    3: [F('Key = the word\'s letters sorted. Same key, same bucket.', a(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'], { x: 'word' }), a(['aet', 'aet', 'ant', 'aet', 'ant', 'abt'], { x: 'key', h: '0y,1y,3y,2b,4b' })),
        F('The map\'s values are the groups.', kvr([['aet', 'eat tea ate'], ['ant', 'tan nat'], ['abt', 'bat']], { x: 'map' }))],
    4: [F('Count each number.', a([1, 1, 1, 2, 2, 3], { x: 'nums' }), kvr([[1, '×3'], [2, '×2'], [3, '×1']], { x: 'count' })),
        F('Shelf number = frequency. Read shelves from the top until you have k = 2 → [1, 2].', kvr([['shelf 3', '1'], ['shelf 2', '2'], ['shelf 1', '3']], { x: 'bucket', h: 'shelf 3g,shelf 2g' }))],
    5: [F('Sunrise pass: product of everything to the LEFT of each index.', a([1, 2, 3, 4], { x: 'nums' }), a([1, 1, 2, 6], { x: 'left' })),
        F('Sunset pass: multiply by the product of everything to the RIGHT.', a([24, 12, 4, 1], { x: 'right' }), a([24, 12, 8, 6], { x: 'answer', h: '0g,1g,2g,3g' }))],
    6: [F('Put everything in a set. Start counting only at a chain head (x − 1 missing).', a([100, 4, 200, 1, 3, 2], { x: 'set', h: '0y,2y,3y,1m,4m,5m' }), n('1, 100, 200 are heads. 4, 3, 2 have a smaller neighbour → skip them.')),
        F('From head 1 count upward: 1 → 2 → 3 → 4 = length 4.', a([1, 2, 3, 4], { x: 'chain', h: '0g,1g,2g,3g', arc: [[0, 1], [1, 2], [2, 3]] }))],
    7: [F('Count, then line the gangs up from smallest to largest.', a([4, 3, 1, 1, 3, 3, 2], { x: 'arr' }), kvr([[4, '×1'], [2, '×1'], [1, '×2'], [3, '×3']], { x: 'sorted' })),
        F('k = 3: wipe out 4 (k = 2), wipe out 2 (k = 1). Gang 1 needs 2 bullets → stop. 2 unique left.', kvr([[4, '×1'], [2, '×1'], [1, '×2'], [3, '×3']], { x: 'after', h: '4r,2r,1g,3g' }))],
    8: [F('cur = max(x, cur + x). At 4 the old balance (−2) is worse than starting fresh.', a([-2, 1, -3, 4, -1, 2, 1, -5, 4], { x: 'nums', h: '3y' }), a([-2, 1, -2, 4, 3, 5, 6, 1, 5], { x: 'cur', h: '3y' })),
        F('Best balance = 6, from the stretch 4, −1, 2, 1.', a([-2, 1, -3, 4, -1, 2, 1, -5, 4], { x: 'nums', w: [3, 6] }), a([-2, 1, -2, 4, 3, 5, 6, 1, 5], { x: 'cur', h: '6g' }))],
    9: [F('Prefix sums, starting with 0.', a([1, 2, 3], { x: 'nums' }), a([0, 1, 3, 6], { x: 'P' })),
        F('At P = 3 look for 3 − 3 = 0 ✓. At P = 6 look for 6 − 3 = 3 ✓ → 2 subarrays.', a([0, 1, 3, 6], { x: 'P', h: '0g,2y,3y', arc: [[0, 2, 'k'], [2, 3, 'k']] }), kvr([[0, 1], [1, 1], [3, 1]], { x: 'seen' }))],
    10: [F('Remember the cheapest day so far.', a([7, 1, 5, 3, 6, 4], { x: 'price', h: '1y', p: '1:min' })),
         F('Day 4: sell at 6 → profit 6 − 1 = 5 (the best).', a([7, 1, 5, 3, 6, 4], { x: 'price', h: '1y,4g', p: '1:buy,4:sell', arc: [[1, 4, '+5']] }))],
    11: [F('Compare the two ends (ignoring case and punctuation).', a(['M', 'a', 'd', 'a', 'm'], { h: '0y,4y', p: '0:l,4:r' })),
         F('Match → both step inward. They meet in the middle → palindrome.', a(['M', 'a', 'd', 'a', 'm'], { h: '0g,4g,1y,3y', p: '1:l,3:r' }))],
    12: [F('2 + 15 = 17 > 9 → too heavy, move r in.', a([2, 7, 11, 15], { h: '0y,3y', p: '0:l,3:r' })),
         F('… then 2 + 7 = 9 ✓ → answer [1, 2] (1-indexed).', a([2, 7, 11, 15], { h: '0g,1g,2m,3m', p: '0:l,1:r' }))],
    13: [F('Sorted. Captain i = −1; seesaw l and r on the rest: −1 + (−1) + 2 = 0 ✓.', a([-4, -1, -1, 0, 1, 2], { h: '1b,2g,5g', p: '1:i,2:l,5:r' })),
         F('Keep squeezing: −1 + 0 + 1 = 0 ✓. The next captain (−1) is a twin → skip it.', a([-4, -1, -1, 0, 1, 2], { h: '1b,3g,4g,2m', p: '1:i,3:l,4:r' }))],
    14: [F('Area = width × shorter wall = 8 × 1. The left wall is shorter → move it.', b([1, 8, 6, 2, 5, 4, 8, 3, 7], { p: '0:l,8:r', h: '0r', rect: [0, 8, 1] })),
         F('Walls 8 and 7: width 7 × height 7 = 49 → the best.', b([1, 8, 6, 2, 5, 4, 8, 3, 7], { p: '1:l,8:r', rect: [1, 8, 7], h: '1g,8g' }))],
    15: [F('Water on each bar = min(tallest left, tallest right) − its height. Total = 6.', b([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], { water: [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0] })),
         F('Two pointers: the side with the shorter max is settled. Add (its max − height) there, move it in.', b([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], { water: [0, 0, 1, 0, 1, 2, 0, 0, 0, 0, 0, 0], p: '6:l,10:r', h: '6y' }))],
    16: [F('mid sees 2 → swap it to the hi wall, hi−−.', a([2, 0, 2, 1, 1, 0], { h: '0y', p: '0:lo,0:mid,5:hi' })),
         F('Done in one pass: 0s | 1s | 2s.', a([0, 0, 1, 1, 2, 2], { h: '0r,1r,2y,3y,4b,5b' }))],
    17: [F('Window "abc" has no repeats → length 3.', a([...'abcabcbb'], { w: [0, 2], i: 1, p: '0:l,2:r' })),
         F('Next "a" was last seen at 0 (inside the window) → jump l to 1.', a([...'abcabcbb'], { w: [1, 3], h: '0r,3y', i: 1, p: '1:l,3:r' }))],
    18: [F('"AABA": length 4 − 3 A\'s = 1 repaint ≤ k = 1 ✓.', a([...'AABABBA'], { w: [0, 3], h: '2y' })),
         F('Add B: "AABAB" needs 5 − 3 = 2 > 1 → shrink from the left.', a([...'AABABBA'], { w: [1, 4], h: '0r' }))],
    19: [F('A stencil of size 2 slides over s2. "ei" does not have the letters of "ab".', a([...'eidbaooo'], { w: [0, 1] })),
         F('"ba" has one a and one b → counts match → true.', a([...'eidbaooo'], { w: [3, 4], h: '3g,4g' }))],
    20: [F('Expand until the cart has A, B and C: "ADOBEC".', a([...'ADOBECODEBANC'], { w: [0, 5], h: '0y,3y,5y' })),
         F('Shrink from the left whenever possible; the smallest valid cart is "BANC".', a([...'ADOBECODEBANC'], { w: [9, 12], h: '9g,10g,11g,12g' }))],
    21: [F('Window [3, −1, −3]: the deque keeps values in decreasing order; front = max = 3.', a([1, 3, -1, -3, 5, 3, 6, 7], { w: [1, 3] }), s([3, -1, -3], { x: 'deque', h: '0g' })),
         F('5 arrives: it pops −3, −1 and 3 (all smaller). New max = 5.', a([1, 3, -1, -3, 5, 3, 6, 7], { w: [2, 4], h: '4y' }), s([5], { x: 'deque', h: '0g' }))],
    22: [F('"]" must match the top plate "[" → pop.', a(['{', '[', ']', '}'], { p: '2:now', h: '2y' }), s(['{', '['], { x: 'stack', h: '1y' })),
         F('"}" matches "{" → pop. Stack empty at the end → valid.', a(['{', '[', ']', '}'], { p: '3:now', h: '3g' }), s(['{'], { x: 'stack', h: '0g' }))],
    23: [F('Each plate stores (value | min so far).', s(['-2|-2', '0|-2', '-3|-3'], { x: 'stack', h: '2y' })),
         F('pop() removes −3 together with its note. getMin() = top note = −2.', s(['-2|-2', '0|-2'], { x: 'stack', h: '1g' }))],
    24: [F('Numbers pile up. "+" eats 2 and 1, pushes 3.', a(['2', '1', '+', '3', '*'], { p: '2:now', h: '2y' }), s([3], { x: 'stack' })),
         F('3 is pushed, then "*" eats 3 and 3 → pushes 9 = answer.', a(['2', '1', '+', '3', '*'], { p: '4:now', h: '4y' }), s([9], { x: 'stack', h: '0g' }))],
    25: [F('72 arrives. It is warmer than 69 and 71 waiting on the stack → they get answers 1 and 2.', a([73, 74, 75, 71, 69, 72, 76, 73], { p: '5:today', h: '5y,3g,4g' }), s([75, 71, 69], { x: 'stack', h: '1r,2r' })),
         F('Each day enters and leaves the stack once. Final waits:', a([1, 1, 4, 2, 1, 1, 0, 0], { x: 'wait', h: '0g,1g,2g,3g,4g,5g' }))],
    26: [F('Bar 2 arrives: it pops 6 (area 6 × 1) and 5 (width 2 → area 10).', b([2, 1, 5, 6, 2, 3], { p: '4:i', rect: [2, 3, 5], h: '4y' })),
         F('Best rectangle = 5 × 2 = 10.', b([2, 1, 5, 6, 2, 3], { rect: [2, 3, 5], h: '2g,3g' }))],
    27: [F('The stack starts with −1 (the floor). ")" at 0 pops it → empty → 0 becomes the new wall.', a([...')()())'], { i: 1, p: '0:i', h: '0r' }), s([0], { x: 'stack' })),
         F('At i = 4, ")" pops its partner; the top is the wall 0 → length 4 − 0 = 4.', a([...')()())'], { i: 1, w: [1, 4], h: '1g,2g,3g,4g', p: '4:i' }), s([0], { x: 'stack' }))],
    28: [F('A ")" with no open "(" waiting → drop it on the spot.', a([...'lee(t(c)o)de)'], { h: '12r' })),
         F('No "(" left waiting at the end → the result is:', a([...'lee(t(c)o)de'], { h: '3g,5g,7g,9g' }))],
    29: [F('mid = 3 < 9 → tear off the left half.', a([-1, 0, 3, 5, 9, 12], { p: '0:lo,2:mid,5:hi', h: '0m,1m,2m' })),
         F('lo = 3, mid = 4 → 9 ✓.', a([-1, 0, 3, 5, 9, 12], { p: '3:lo,4:mid,5:hi', h: '0m,1m,2m,4g' }))],
    30: [F('Left half 4..7 is sorted and 0 is not in it → go right.', a([4, 5, 6, 7, 0, 1, 2], { p: '0:lo,3:mid,6:hi', h: '0m,1m,2m,3m' })),
         F('In [0, 1, 2] the left half [0, 1] is sorted and holds 0 → go left → found at index 4.', a([4, 5, 6, 7, 0, 1, 2], { p: '4:lo,5:mid,6:hi', h: '0m,1m,2m,3m,4g' }))],
    31: [F('mid 5 > right end 2 → the cliff (minimum) is to the right.', a([3, 4, 5, 1, 2], { p: '0:lo,2:mid,4:hi', h: '0m,1m,2m' })),
         F('mid 1 ≤ 2 → keep it (hi = mid). lo meets hi → minimum = 1.', a([3, 4, 5, 1, 2], { p: '3:lo,3:hi', h: '0m,1m,2m,3g' }))],
    32: [F('Search the SPEED, not the piles: too slow ✗, fast enough ✓. Find the first ✓.', a([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], { x: 'speed', h: '0r,1r,2r,3g,4g,5g,6g,7g,8g,9g,10g', p: '3:first ✓' })),
         F('Speed 4 → hours 1 + 2 + 2 + 3 = 8 ≤ h ✓. Speed 3 → 10 hours ✗.', a([3, 6, 7, 11], { x: 'pile' }), a([1, 2, 2, 3], { x: 'hours' }))],
    33: [F('Truck capacity lies between 10 (heaviest parcel) and 55 (all parcels). Binary search for the first ✓.', a(['10', '…', '14', '15', '…', '55'], { x: 'cap', h: '2r,3g', p: '3:first ✓' })),
         F('Capacity 15: loads 1–5 | 6, 7 | 8 | 9 | 10 = 5 days ✓.', a([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { x: 'parcel' }), a([1, 1, 1, 1, 1, 2, 2, 3, 4, 5], { x: 'day', h: '0y,1y,2y,3y,4y,5b,6b,7g,8y,9b' }))],
    34: [F('mid 3 < right neighbour 5 → uphill to the right → lo = mid + 1.', b([1, 2, 1, 3, 5, 6, 4], { p: '0:lo,3:mid,6:hi', h: '3y' })),
         F('Keep climbing … lo = hi at 6 → a peak.', b([1, 2, 1, 3, 5, 6, 4], { p: '5:peak', h: '5g' }))],
    35: [F('Start: prev = ∅, cur = 1.', l([1, 2, 3, 4, 5], { tail: '∅', p: '0:cur' })),
         F('Halfway: 2 → 1 is flipped. Save nxt, flip cur, step forward.', l([1, 2, 3, 4, 5], { d: '< >>', tail: '∅', p: '1:prev,2:cur,3:nxt', h: '0g,1g' })),
         F('Done: every coupling is flipped; the new head is 5.', l([1, 2, 3, 4, 5], { d: '<<<<', p: '4:head', h: '0g,1g,2g,3g,4g' }))],
    36: [F('Pull the smaller front tooth each time.', l([1, 2, 4], { x: 'a', p: '1:a' }), l([1, 3, 4], { x: 'b', p: '1:b' }), l(['D', 1, 1], { x: 'out', h: '1g,2g' })),
         F('Attach whatever is left over. Done.', l(['D', 1, 1, 2, 3, 4, 4], { x: 'out', h: '1g,2g,3g,4g,5g,6g' }))],
    37: [F('Slow moves 1 step, fast moves 2, around the loop.', l([3, 2, 0, -4], { cyc: 1, p: '1:slow,2:fast' })),
         F('They land on the same node → there is a cycle ✓.', l([3, 2, 0, -4], { cyc: 1, p: '3:slow,3:fast', h: '3g' }))],
    38: [F('fast runs n + 1 = 3 steps ahead of slow (both start at dummy D).', l(['D', 1, 2, 3, 4, 5], { tail: '∅', p: '0:slow,3:fast' })),
         F('Move both until fast hits ∅. slow sits right before the victim (4) → unlink it.', l(['D', 1, 2, 3, 4, 5], { tail: '∅', p: '3:slow,6:fast', h: '4r' }))],
    39: [F('put(1), put(2) → the front of the list is the most recent.', l([2, 1], { x: 'list' }), kvr([[1, 'node'], [2, 'node']], { x: 'map' })),
         F('get(1) → the map finds node 1; splice it to the front in O(1).', l([1, 2], { x: 'list', h: '0y' })),
         F('put(3) when full → evict the back (2).', l([3, 1, 2], { x: 'list', h: '0g,2r' }))],
    40: [F('Each child reports its height upward; the parent adds 1.', tr([3, 9, 20, N, N, 15, 7], { lab: { 0: '1 + max(1, 2) = 3', 1: '↑1', 2: '↑2', 5: '↑1', 6: '↑1' }, h: '0g' }))],
    41: [F('Before: swap left and right at every node.', tr([4, 2, 7, 1, 3, 6, 9], { h: '0y' })),
         F('After: a mirror image.', tr([4, 7, 2, 9, 6, 3, 1], { h: '0g,1g,2g' }))],
    42: [F('At every node, L height + R height = a road that bends here. Best is at the root: 2 + 1 = 3.', tr([1, 2, 3, 4, 5], { lab: { 0: 'L2 + R1 = 3', 1: 'L1 + R1 = 2' }, h: '0g,1g,2g,3g' }))],
    43: [F('Snapshot the queue size = number of people on this floor.', tr([3, 9, 20, N, N, 15, 7], { h: '0y,1g,2g,5b,6b' })),
         F('One list per floor.', kvr([['floor 0', '3'], ['floor 1', '9 20'], ['floor 2', '15 7']]))],
    44: [F('Each node gets a range ticket from above. 4 must be > 5 → invalid.', tr([5, 1, 4, N, N, 3, 6], { lab: { 1: '(−∞, 5)', 2: '(5, ∞) ✗' }, h: '2r' }))],
    45: [F('p = 5, q = 1: the left side reports 5, the right side reports 1 → root 3 is the LCA.', tr([3, 5, 1, 6, 2, 0, 8, N, N, 7, 4], { h: '1y,2y,0g' })),
         F('p = 5, q = 4: node 5 is found first and returned upward; the right side reports nothing → LCA = 5.', tr([3, 5, 1, 6, 2, 0, 8, N, N, 7, 4], { h: '1g,10y' }))],
    46: [F('In-order (left, me, right) reads 1, 2, 3, … → the 3rd book is 3.', tr([5, 3, 6, 2, 4, N, N, 1], { lab: { 7: '#1', 3: '#2', 1: '#3' }, h: '1g' }))],
    47: [F('Standing on the right you see the last node on every floor: 1, 3, 4.', tr([1, 2, 3, N, 5, N, 4], { h: '0g,2g,6g' }))],
    48: [F('Min-heap with k = 2 seats: after all numbers the seats hold 5 and 6. Top = 5 = 2nd largest.', a([3, 2, 1, 5, 6, 4], { x: 'nums' }), tr([5, 6], { h: '0g' })),
         F('Quickselect: pivot 3 splits into < 3 | 3 | > 3. Target index n − k = 4 is in the right part.', a([2, 1, 3, 5, 6, 4], { h: '0m,1m,2y', i: 1, p: '4:target' })),
         F('Pivot 5 on [5, 6, 4] → 4 | 5 | 6. Index 4 holds 5 ✓.', a([2, 1, 3, 4, 5, 6], { h: '0m,1m,2m,3m,4g,5m', i: 1, p: '4:target' }))],
    49: [F('Distance² from the depot (origin): 18, 26, 20.', a(['(3,3)', '(5,−1)', '(−2,4)'], { x: 'rider' }), a([18, 26, 20], { x: 'dist²' })),
         F('Max-heap of size k = 2: the farthest (26) gets dropped.', a([18, 26, 20], { x: 'dist²', h: '0g,1r,2g' }))],
    50: [F('The heap holds the front of every list. Pop the smallest, push its next.', l([1, 4, 5], { x: 'A' }), l([1, 3, 4], { x: 'B' }), l([2, 6], { x: 'C' }), a(['1A', '1B', '2C'], { x: 'heap', h: '0y' })),
         F('Merged:', l([1, 1, 2, 3, 4, 4, 5, 6], { h: '0g,1g,2g,3g,4g,5g,6g,7g' }))],
    51: [F('A appears 3 times → 2 frames of width n + 1 = 3, then the last A. Fill the gaps with B; leftover gaps are idle.', a(['A', 'B', 'idle', 'A', 'B', 'idle', 'A', 'B'], { h: '0y,3y,6y,2m,5m' }), n('(3 − 1) × (2 + 1) + 2 = 8'))],
    52: [F('Add 1, 2: small half (max-heap) = [1], big half (min-heap) = [2] → median 1.5.', s([1], { x: 'small', h: '0y' }), s([2], { x: 'big', h: '0b' })),
         F('Add 3: small = [1, 2], big = [3] → median = top of small = 2.', s([1, 2], { x: 'small', h: '1y' }), s([3], { x: 'big', h: '0b' }))],
    53: [F('Sort by start. [2, 6] starts before [1, 3] ends → overlap.', iv([[1, 3, 'y'], [2, 6, 'y'], [8, 10], [15, 18]], { max: 18 })),
         F('Stretch the end: [1, 6], [8, 10], [15, 18].', iv([[1, 6, 'g'], [8, 10, 'g'], [15, 18, 'g']], { max: 18 }))],
    54: [F('New slot [4, 8]: copy the slots before it, swallow the ones it overlaps, copy the rest.', iv([[1, 2], [3, 5, 'y'], [6, 7, 'y'], [8, 10, 'y'], [12, 16], [4, 8, 'b', 'new 4–8']], { max: 16 })),
         F('Result:', iv([[1, 2, 'g'], [3, 10, 'g'], [12, 16, 'g']], { max: 16 }))],
    55: [F('Sorted by start. [5, 10] begins before rider 1 is free (30) → hire rider 2.', iv([[0, 30, 'y'], [5, 10, 'b'], [15, 20]], { max: 30 }), s([10, 30], { x: 'free at' })),
         F('[15, 20] begins after rider 2 is free (10) → reuse him. Riders needed = 2.', iv([[0, 30, 'y'], [5, 10, 'b'], [15, 20, 'b']], { max: 30 }), s([20, 30], { x: 'free at', h: '0g,1g' }))],
    56: [F('Sort by END. Keep a slot only if it starts after the last kept end. [1, 3] overlaps → remove 1.', iv([[1, 2, 'g'], [2, 3, 'g'], [1, 3, 'r'], [3, 4, 'g']], { max: 4 }))],
    57: [F('Land found → flood-fill the whole island (count = 1).', g([['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']], { h: '0.0y,0.1y,1.0y,1.1y' })),
         F('Every new unpainted land cell starts a new island → 3.', g([['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']], { h: '0.0g,0.1g,1.0g,1.1g,2.2b,3.3y,3.4y' }))],
    58: [F('All rotten oranges start together (minute 0). Each BFS ring = 1 minute. The last fresh one rots at minute 4.', g([['0', '1', '2'], ['1', '2', '·'], ['·', '3', '4']], { h: '0.0r,0.1y,1.0y,0.2b,1.1b,2.1g,2.2g' }))],
    59: [F('0 and 1 shake hands → one circle. 2 is alone → 2 provinces.', gr([[0, 70, 30, 'y'], [1, 170, 30, 'y'], [2, 280, 30, 'b']], [[0, 1]], { H: 56 }))],
    60: [F('Kahn: take courses with no pending prerequisites (indegree 0) first.', gr([[0, 40, 55, 'g', 'in 0'], [1, 150, 28, '', 'in 1'], [2, 150, 92, '', 'in 1'], [3, 270, 55, '', 'in 2']], [[0, 1, '', '', 1], [0, 2, '', '', 1], [1, 3, '', '', 1], [2, 3, '', '', 1]], { H: 112 })),
         F('A loop: nobody has indegree 0 → you can never start → false.', gr([[0, 70, 60, 'r'], [1, 180, 30, 'r'], [2, 180, 92, 'r']], [[0, 1, '', 'r', 1], [1, 2, '', 'r', 1], [2, 0, '', 'r', 1]], { H: 112 }))],
    61: [F('Pop indegree-0 nodes in order: 0, then 1 and 2, then 3.', gr([[0, 40, 58, 'g', '1st'], [1, 150, 30, 'y', '2nd'], [2, 150, 92, 'y', '3rd'], [3, 270, 58, 'b', '4th']], [[0, 1, '', '', 1], [0, 2, '', '', 1], [1, 3, '', '', 1], [2, 3, '', '', 1]], { H: 112 }), a([0, 1, 2, 3], { x: 'order', h: '0g,1y,2y,3b' }))],
    62: [F('Start at 2 (time 0). Its neighbours 1 and 3 get wet at time 1.', gr([[2, 50, 60, 'g', 't = 0'], [1, 160, 30, 'y', 't = 1'], [3, 160, 92, 'y', 't = 1'], [4, 280, 92, '', '?']], [[2, 1, 1, '', 1], [2, 3, 1, '', 1], [3, 4, 1, '', 1]], { H: 112 })),
         F('The heap pops the nearest dry junction. From 3, node 4 is wet at time 2 → the last one → answer 2.', gr([[2, 50, 60, 'g', 't = 0'], [1, 160, 30, 'g', 't = 1'], [3, 160, 92, 'g', 't = 1'], [4, 280, 92, 'g', 't = 2']], [[2, 1, 1, '', 1], [2, 3, 1, 'g', 1], [3, 4, 1, 'g', 1]], { H: 112 }))],
    63: [F('BFS: every level is one letter change. "cog" is reached on level 5.', gr([['hit', 28, 62, 'y', '1'], ['hot', 92, 62, '', '2'], ['dot', 158, 30, '', '3'], ['lot', 158, 94, '', '3'], ['dog', 224, 30, '', '4'], ['log', 224, 94, '', '4'], ['cog', 300, 62, 'g', '5']], [['hit', 'hot'], ['hot', 'dot'], ['hot', 'lot'], ['dot', 'dog'], ['lot', 'log'], ['dog', 'cog'], ['log', 'cog'], ['dot', 'lot'], ['dog', 'log']], { H: 114 })),
         F('Bidirectional BFS: grow from both ends (always the smaller frontier) until they touch.', gr([['hit', 28, 62, 'y'], ['hot', 92, 62, 'y'], ['dot', 158, 30, 'y'], ['lot', 158, 94, 'y'], ['dog', 224, 30, 'b'], ['log', 224, 94, 'b'], ['cog', 300, 62, 'b']], [['hit', 'hot'], ['hot', 'dot'], ['hot', 'lot'], ['dot', 'dog', '', 'g'], ['lot', 'log', '', 'g'], ['dog', 'cog'], ['log', 'cog'], ['dot', 'lot'], ['dog', 'log']], { H: 114 }))],
    64: [F('Round 1 (0 stops): from city 0 you reach 1 for 100.', gr([[0, 40, 62, 'g', '0'], [1, 150, 30, 'y', '100'], [2, 190, 104, '', '∞'], [3, 300, 62, '', '∞']], [[0, 1, 100, '', 1], [1, 2, 100, '', 1], [2, 0, 100, '', 1], [1, 3, 600, '', 1], [2, 3, 200, '', 1]], { H: 126 })),
         F('Round 2 (1 stop): 2 = 200, 3 = 700. 0 → 1 → 2 → 3 = 400 needs 2 stops → not allowed. Answer 700.', gr([[0, 40, 62, 'g', '0'], [1, 150, 30, 'g', '100'], [2, 190, 104, 'y', '200'], [3, 300, 62, 'g', '700']], [[0, 1, 100, 'g', 1], [1, 2, 100, '', 1], [2, 0, 100, '', 1], [1, 3, 600, 'g', 1], [2, 3, 200, 'm', 1]], { H: 126 }))],
    65: [F('Every level is a fork: left = take, right = skip. The leaves are the subsets.', tr(['{ }', '{1}', '{ }', '{1,2}', '{1}', '{2}', '{ }'], { h: '3g,4g,5g,6g', lab: { 1: 'take 1', 2: 'skip 1' } })),
         F('Same thing with switches: bit i on → take nums[i].', a(['00', '01', '10', '11'], { x: 'mask' }), a(['{ }', '{1}', '{2}', '{1,2}'], { x: 'subset', h: '0g,1g,2g,3g' }))],
    66: [F('Chair 0: swap each candidate in (1, 2, 3), solve the remaining chairs, swap back.', a([1, 2, 3], { x: 'chairs', p: '0:i', h: '0y' }), a([1, 2, 3], { x: 'try j', p: '0:j,1:j,2:j' })),
         F('3 choices × 2 × 1 = 6 permutations.', a(['123', '132', '213', '231', '321', '312'], { h: '0g,1g,2g,3g,4g,5g' }))],
    67: [F('Stay on the same coin to reuse it: 2 + 2 + 3 = 7 ✓.', a([2, 3, 6, 7], { x: 'coins' }), a([2, 2, 3], { x: 'path', h: '0y,1y,2g' })),
         F('2 + 2 + 2 = 6, one more 2 → 8 overshoots → back up. 7 alone also works ✓.', a([2, 2, 2, 2], { x: 'path', h: '3r' }), a([7], { x: 'path', h: '0g' }))],
    68: [F('A → B → C → C → E → D. Chalk (#) marks the path while you are on it and is wiped when you back out.', g([['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], { h: '0.0g,0.1g,0.2g,1.2g,2.2g,2.1g' }))],
    69: [F('ways(n) = ways(n − 1) + ways(n − 2): 3 + 5 = 8.', a([1, 2, 3, 5, 8], { x: 'ways', il: ['n=1', 'n=2', 'n=3', 'n=4', 'n=5'], h: '4g,2y,3y', arc: [[2, 4], [3, 4]] }))],
    70: [F('best[i] = max(skip: best[i−1], rob: best[i−2] + house[i]). Rob 2 + 9 + 1 = 12.', a([2, 7, 9, 3, 1], { x: 'house', h: '0y,2y,4y' }), a([2, 7, 11, 11, 12], { x: 'best', h: '4g', arc: [[0, 2, '+9'], [2, 4, '+1']] }))],
    71: [F('dp[a] = 1 + min(dp[a − coin]). dp[11] = 1 + min(dp[10], dp[9], dp[6]) = 3.', a([0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3], { x: 'coins', i: 1, h: '11g,10y,9y,6y', arc: [[6, 11, '−5'], [9, 11, '−2'], [10, 11, '−1']] }))],
    72: [F('Each card goes on the leftmost pile whose top ≥ it. 3 replaces 5.', a([10, 9, 2, 5, 3, 7, 101, 18], { x: 'nums', p: '4:x', h: '4y' }), a([2, 3], { x: 'tails', h: '1y' })),
         F('End: 4 piles → LIS length 4 (18 replaced 101).', a([2, 3, 7, 18], { x: 'tails', h: '0g,1g,2g,3g' }))],
    73: [F('Match → diagonal + 1 (a, c, e). Otherwise max(up, left). Answer = 3.', m(['', 'a', 'b', 'c', 'd', 'e'], ['', 'a', 'c', 'e'], [[0, 0, 0, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 2, 2], [0, 1, 2, 2], [0, 1, 2, 3]], { h: '1.1y,3.2y,5.3g' }))],
    74: [F('dp[i] = "the first i letters can be cut". "leet" makes dp[4] true, then "code" makes dp[8] true.', a([...'leetcode'], { x: 's' }), a(['T', 'F', 'F', 'F', 'T', 'F', 'F', 'F', 'T'], { x: 'dp', i: 1, h: '0g,4g,8g', arc: [[0, 4, 'leet'], [4, 8, 'code']] }))],
    75: [F('Diagonal = replace (free if letters match), up = delete, left = insert. horse → ros = 3.', m(['', 'h', 'o', 'r', 's', 'e'], ['', 'r', 'o', 's'], [[0, 1, 2, 3], [1, 1, 2, 3], [2, 2, 1, 2], [3, 2, 2, 2], [4, 3, 3, 2], [5, 4, 4, 3]], { h: '2.2y,4.3y,5.3g' }))],
    76: [F('Total 22 → target 11. Bulb j lit = "I can make sum j". For each x: bulbs |= bulbs << x.', a([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], { x: 'sum', h: '0g,1g,5g,6g,10g,11g' }), n('after 1, 5, 11, 5 the lit sums are 0, 1, 5, 6, 10, 11 → 11 is lit ✓'))],
    77: [F('[2, 3, 1, 1, 4]: from index 1 you reach index 4 → far ≥ last → true.', a([2, 3, 1, 1, 4], { i: 1, arc: [[0, 2], [1, 4]], h: '4g', p: '1:far = 4' })),
         F('[3, 2, 1, 0, 4]: everyone tops out at index 3. Standing at 4 > far → stranded.', a([3, 2, 1, 0, 4], { i: 1, arc: [[0, 3], [1, 3], [2, 3]], h: '3r,4r' }))],
    78: [F('Levels like BFS: jump 1 covers [1, 2], jump 2 covers [3, 4] → 2 jumps.', a([2, 3, 1, 1, 4], { i: 1, h: '0y,1b,2b,3g,4g', arc: [[0, 2], [1, 4]] }), n('level 0: [0] → level 1: [1..2] → level 2: [3..4]'))],
    79: [F('gas − cost at each station. The tank goes negative at 0, 1 and 2 → each time restart from the next one.', a([-2, -2, -2, 3, 3], { x: 'gain', h: '0r,1r,2r', i: 1 })),
         F('Start at 3: tank 3 → 6 → 4 → 2 → 0. Total ≥ 0 → answer 3.', a([-2, -2, -2, 3, 3], { x: 'gain', h: '3g,4g', i: 1, p: '3:start' }))],
    80: [F('insert("apple"), insert("app"): one shared road a-p-p, with a flag where each word ends.', gr([['r', 22, 40, 'y', '', '•'], ['a', 76, 40, '', '', 'a'], ['p1', 130, 40, '', '', 'p'], ['p2', 184, 40, 'g', '⚑ app', 'p'], ['l', 238, 40, '', '', 'l'], ['e', 292, 40, 'g', '⚑ apple', 'e']], [['r', 'a', '', '', 1], ['a', 'p1', '', '', 1], ['p1', 'p2', '', '', 1], ['p2', 'l', '', '', 1], ['l', 'e', '', '', 1]], { H: 62 })),
         F('search("ap") ✗: the road exists but there is no flag. startsWith("ap") ✓: the road is enough.', gr([['r', 22, 40, 'y', '', '•'], ['a', 76, 40, 'y', '', 'a'], ['p1', 130, 40, 'y', 'no ⚑', 'p'], ['p2', 184, 40, 'g', '⚑', 'p'], ['l', 238, 40, '', '', 'l'], ['e', 292, 40, 'g', '⚑', 'e']], [['r', 'a', '', 'g', 1], ['a', 'p1', '', 'g', 1], ['p1', 'p2', '', '', 1], ['p2', 'l', '', '', 1], ['l', 'e', '', '', 1]], { H: 62 }))]
  };

  // which frames to show for solution `si` of problem `id`
  // X (extra file) wins; otherwise S belongs to OWN[id] or, by default, the default-selected solution
  function framesFor(id, si, def) {
    const X = (window.VIZ.X || {})[id];
    if (X && X[si]) return X[si];
    const own = (window.VIZ.OWN || {})[id];
    return si === (own !== undefined ? own : def) ? S[id] : null;
  }

  const DATA = {};
  const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

  // full frame list for one solution: Input frame (shared per problem) + the solution's own frames
  function allFrames(id, si, def) {
    const base = framesFor(id, si, def); if (!base) return null;
    const input = (window.VIZ.INPUT || {})[id], desc = (window.VIZ.DESC || {})[id];
    const pre = ((window.VIZ.PRE || {})[id] || {})[si] || [], post = ((window.VIZ.POST || {})[id] || {})[si] || [];
    const dry = ((window.VIZ.DRY || {})[id] || {})[si];
    const own = dry && dry.length ? dry : [...pre, ...base, ...post];
    return input ? [{ c: desc ? desc[0] : 'The input', r: input, input: true }, ...own] : own;
  }

  function render(id, si, fi, def, playing) {
    const frames = allFrames(id, si, def); if (!frames) return '';
    const k = Math.max(0, Math.min(fi || 0, frames.length - 1)), f = frames[k], last = k === frames.length - 1;
    const P = DATA[id], sol = P ? P.sols[si] : null;
    const ansx = ((window.VIZ.ANSX || {})[id] || {})[si];
    const ans = last ? (ansx !== undefined ? ansx : (window.VIZ.ANS || {})[id]) : null;
    const head = f.input ? `INPUT · #${id} ${P ? P.title : ''}` : (sol ? `${sol.label.toUpperCase()} · ${sol.time} time` : '');
    const svg = frameSVG(f.r, { head: cut(head, 40), step: `${k + 1} / ${frames.length}`, cap: f.c, ans });
    const btn = (to, lab, off) => `<button type="button" class="vz-btn" data-vz="${id}" data-si="${si}" data-to="${to}" ${off ? 'disabled' : ''}>${lab}</button>`;
    const nav = frames.length > 1
      ? `<div class="vz-nav">${btn(k - 1, '‹ Prev', k === 0)}<button type="button" class="vz-btn vz-play" data-play="${id}" data-si="${si}" data-k="${k}" data-n="${frames.length}">${playing ? '■ Stop' : '▶ Play'}</button>${btn(k + 1, 'Next ›', last)}</div>`
      : '';
    return svg + nav;
  }

  window.VIZ = Object.assign(window.VIZ || {}, { render, framesFor, allFrames, setData: d => d.forEach(p => { DATA[p.id] = p; }), specs: S, h: { a, s, kvr, n, b, g, tr, l, iv, gr, m, F, N } });
})();
