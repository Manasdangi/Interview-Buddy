/* Full dry runs, problems 21-40. */
(function () {
  const { a, s, kvr, n, b, l, tr, F, N } = VIZ.h;
  const X = {};
  const T = (id, si, fn) => { (X[id] = X[id] || {})[si] = fn(); };
  const H = o => Object.entries(o).filter(([k, v]) => v && +k >= 0).map(([k, v]) => k + v).join(',');
  const P = (...pairs) => pairs.filter(p => p && p[0] !== undefined && p[0] !== null && p[0] >= 0).map(([i, t]) => i + ':' + t).join(',');
  const sg = x => (typeof x === 'number' && x < 0 ? '−' + (-x) : String(x));
  const L = arr => '[' + arr.map(sg).join(', ') + ']';
  const range = (lo, hi, cls, o = {}) => { for (let i = lo; i <= hi; i++) o[i] = cls; return o; };

  /* 21 · Sliding Window Maximum */
  const N21 = [1, 3, -1, -3, 5, 3, 6, 7];
  T(21, 0, () => {
    const out = [], f = [];
    for (let i = 0; i + 2 < 8; i++) {
      const w = N21.slice(i, i + 3), mx = Math.max(...w), mi = i + w.indexOf(mx); out.push(mx);
      f.push(F(`Window [${i} … ${i + 2}] = ${L(w)}: scan all 3 → max ${sg(mx)}.`, a(N21, { i: 1, w: [i, i + 2], h: H({ [mi]: 'g' }) }), a(out.slice(), { x: 'output' })));
    }
    return f;
  });
  T(21, 1, () => {
    const ms = [], out = [], f = [];
    N21.forEach((x, i) => {
      ms.push(x); ms.sort((p, q) => p - q); let msg = `i = ${i}: insert ${sg(x)}`;
      if (i >= 3) { const old = N21[i - 3]; ms.splice(ms.indexOf(old), 1); msg += `, erase ${sg(old)} (it left the window)`; }
      if (i >= 2) { out.push(ms[ms.length - 1]); msg += `. Max = last element = ${sg(ms[ms.length - 1])}.`; } else msg += '. Window not full yet.';
      f.push(F(msg, a(N21, { i: 1, w: [Math.max(0, i - 2), i], h: H({ [i]: 'y' }) }), a(ms.slice(), { x: 'multiset', h: i >= 2 ? (ms.length - 1) + 'g' : '' }), a(out.length ? out.slice() : ['–'], { x: 'output' })));
    });
    return f;
  });
  T(21, 2, () => {
    const dq = [], out = [], f = [];
    N21.forEach((x, i) => {
      const notes = [];
      if (dq.length && dq[0] <= i - 3) notes.push(`front index ${dq.shift()} left the window → drop it`);
      const popped = []; while (dq.length && N21[dq[dq.length - 1]] < x) popped.push(N21[dq.pop()]);
      if (popped.length) notes.push(`${popped.map(sg).join(', ')} < ${sg(x)} → pop from the back (they can never be a max again)`);
      dq.push(i); notes.push(`push index ${i}`);
      if (i >= 2) { out.push(N21[dq[0]]); notes.push(`max = front = ${sg(N21[dq[0]])}`); }
      f.push(F(`i = ${i} (${sg(x)}): ${notes.join('; ')}.`, a(N21, { i: 1, w: [Math.max(0, i - 2), i], h: H(Object.fromEntries(dq.map(k => [k, k === dq[0] && i >= 2 ? 'g' : 'b']))) }), a(dq.map(k => `${k}:${sg(N21[k])}`), { x: 'deque' }), a(out.length ? out.slice() : ['–'], { x: 'output' })));
    });
    return f;
  });

  /* 22 · Valid Parentheses */
  T(22, 0, () => [
    F('Scan "{[]}" for an adjacent pair "()", "[]" or "{}" → found "[]" at 1-2.', a([...'{[]}'], { i: 1, h: '1y,2y' })),
    F('Delete it → "{}". Scan again → "{}" is a pair.', a([...'{}'], { i: 1, h: '0y,1y' })),
    F('Delete it → "" (empty). Nothing left → valid → true.', n('string is empty → true'))
  ]);
  T(22, 1, () => {
    const st = [], f = [], str = [...'{[]}'], pair = { ')': '(', ']': '[', '}': '{' };
    str.forEach((ch, i) => {
      let msg;
      if ('([{'.includes(ch)) { st.push(ch); msg = `"${ch}" is an opener → push it.`; }
      else { const top = st.pop(); msg = `"${ch}" is a closer. Top of stack "${top}" is its partner ✓ → pop.`; }
      f.push(F(`i = ${i}: ${msg}`, a(str, { i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })) }), st.length ? s(st.slice(), { x: 'stack' }) : kvr([['stack', 'empty']])));
    });
    f.push(F('End of string and the stack is empty → every opener was closed → true.', kvr([['stack', 'empty']], { h: 'stackg' })));
    return f;
  });

  /* 23 · Min Stack */
  T(23, 0, () => [
    F('push(−2) → [−2].', s([-2], { x: 'stack', h: '0y' })),
    F('push(0) → [−2, 0].', s([-2, 0], { x: 'stack', h: '1y' })),
    F('push(−3) → [−2, 0, −3].', s([-2, 0, -3], { x: 'stack', h: '2y' })),
    F('getMin(): scan every plate: −2, 0, −3 → −3. That is O(n).', s([-2, 0, -3], { x: 'stack', h: '0y,1y,2g' })),
    F('pop() removes −3 → [−2, 0]. top() → 0.', s([-2, 0], { x: 'stack', h: '1g' })),
    F('getMin(): scan again: −2, 0 → −2.', s([-2, 0], { x: 'stack', h: '0g,1y' }))
  ]);
  T(23, 1, () => [
    F('push(−2): min so far = −2 → store (−2 | −2).', s(['−2|−2'], { x: 'val|min', h: '0y' })),
    F('push(0): min(0, −2) = −2 → store (0 | −2).', s(['−2|−2', '0|−2'], { x: 'val|min', h: '1y' })),
    F('push(−3): min(−3, −2) = −3 → store (−3 | −3).', s(['−2|−2', '0|−2', '−3|−3'], { x: 'val|min', h: '2y' })),
    F('getMin() = min stored on top = −3. O(1), no scan.', s(['−2|−2', '0|−2', '−3|−3'], { x: 'val|min', h: '2g' })),
    F('pop() → the old minimum leaves together with its plate. top() = 0.', s(['−2|−2', '0|−2'], { x: 'val|min', h: '1y' })),
    F('getMin() = min on the new top = −2.', s(['−2|−2', '0|−2'], { x: 'val|min', h: '1g' }))
  ]);

  /* 24 · Evaluate RPN */
  T(24, 0, () => [
    F('Find the first operator: "+" at index 2. Its operands are the two numbers before it: 2 and 1.', a(['2', '1', '+', '3', '*'], { i: 1, h: '0b,1b,2y' })),
    F('2 + 1 = 3. Splice it back → ["3", "3", "*"]. Find the next operator: "*" at index 2.', a(['3', '3', '*'], { i: 1, h: '0b,1b,2y' })),
    F('3 × 3 = 9 → ["9"]. One token left → answer 9.', a(['9'], { h: '0g' }))
  ]);
  T(24, 1, () => {
    const tk = ['2', '1', '+', '3', '*'], st = [], f = [];
    tk.forEach((t, i) => {
      let msg;
      if (/\d/.test(t)) { st.push(+t); msg = `"${t}" is a number → push.`; }
      else { const bb = st.pop(), aa = st.pop(), r = t === '+' ? aa + bb : aa * bb; st.push(r); msg = `"${t}" → pop b = ${bb}, pop a = ${aa}, push a ${t === '*' ? '×' : t} b = ${r}.`; }
      f.push(F(`token ${i}: ${msg}`, a(tk, { i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })) }), s(st.slice(), { x: 'stack' })));
    });
    return f;
  });

  /* 25 · Daily Temperatures */
  const T25 = [73, 74, 75, 71, 69, 72, 76, 73];
  T(25, 0, () => {
    const res = T25.map(() => '·'), f = [];
    T25.forEach((t, i) => {
      let j = i + 1; while (j < 8 && T25[j] <= t) j++;
      res[i] = j < 8 ? j - i : 0;
      f.push(F(`Day ${i} (${t}): scan forward ${j < 8 ? `→ day ${j} (${T25[j]}) is warmer → wait ${j - i}` : '→ nothing warmer → 0'}.`, a(T25, { i: 1, h: H(Object.assign(range(i + 1, Math.min(j, 8) - 1, 'r'), { [i]: 'y', [j < 8 ? j : -1]: 'g' })), arc: j < 8 ? [[i, j, String(j - i)]] : undefined }), a(res.slice(), { x: 'answer', h: H({ [i]: 'y' }) })));
    });
    return f;
  });
  T(25, 1, () => {
    const res = T25.map(() => 0), st = [], f = [];
    T25.forEach((t, i) => {
      const filled = []; while (st.length && T25[st[st.length - 1]] < t) { const k = st.pop(); res[k] = i - k; filled.push(k); }
      st.push(i);
      f.push(F(`Day ${i} (${t}): ${filled.length ? `warmer than the days on the stack → pop ${filled.map(k => `day ${k} (answer ${i} − ${k} = ${i - k})`).join(', ')}; ` : 'not warmer than the stack top → '}push day ${i}.`, a(T25, { i: 1, h: H(Object.assign(Object.fromEntries(filled.map(k => [k, 'g'])), { [i]: 'y' })) }), s(st.map(k => `${k}:${T25[k]}`), { x: 'stack' }), a(res.slice(), { x: 'answer', h: H(Object.fromEntries(filled.map(k => [k, 'g']))) })));
    });
    f.push(F('Days still on the stack never found a warmer day → their answer stays 0.', a(res, { x: 'answer', h: '6g,7g' })));
    return f;
  });
  T(25, 2, () => {
    const res = T25.map(() => '·'), f = [];
    for (let i = 7; i >= 0; i--) {
      let j = i + 1; const hops = [];
      while (j < 8 && T25[j] <= T25[i]) { if (res[j] === 0) { j = 8; break; } hops.push(`${j} (${T25[j]}, hop +${res[j]})`); j += res[j]; }
      res[i] = j < 8 ? j - i : 0;
      f.push(F(`Day ${i} (${T25[i]}): ${hops.length ? 'colder days ' + hops.join(' → ') + ' → ' : ''}${j < 8 ? `day ${j} (${T25[j]}) is warmer → ${j - i}` : 'no warmer day → 0'}.`, a(T25, { i: 1, h: H({ [i]: 'y', [j < 8 ? j : -1]: 'g' }) }), a(res.slice(), { x: 'answer', h: H({ [i]: 'y' }) })));
    }
    return f;
  });

  /* 26 · Largest Rectangle in Histogram */
  const H26 = [2, 1, 5, 6, 2, 3];
  T(26, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 6; i++) {
      let mn = Infinity, bi = i, bj = i, ba = 0;
      for (let j = i; j < 6; j++) { mn = Math.min(mn, H26[j]); if (mn * (j - i + 1) > ba) { ba = mn * (j - i + 1); bj = j; } }
      best = Math.max(best, ba);
      const mh = Math.min(...H26.slice(i, bj + 1));
      f.push(F(`Start i = ${i}: extend j, keeping the minimum height. Best from here: [${i} … ${bj}] → ${mh} × ${bj - i + 1} = ${ba}. Overall best = ${best}.`, b(H26, { p: P([i, 'i'], [bj, 'j']), rect: [bi, bj, mh] })));
    }
    return f;
  });
  T(26, 1, () => {
    const Lx = [], Rx = [], f = [];
    H26.forEach((h, i) => { let k = i - 1; while (k >= 0 && H26[k] >= h) k--; Lx.push(k); });
    H26.forEach((h, i) => { let k = i + 1; while (k < 6 && H26[k] >= h) k++; Rx.push(k); });
    f.push(F('Pass 1 (stack, left → right): L[i] = index of the nearest shorter bar on the left (−1 = none).', b(H26), a(Lx.map(sg), { x: 'L', i: 1 })));
    f.push(F('Pass 2 (stack, right → left): R[i] = index of the nearest shorter bar on the right (6 = none).', b(H26), a(Rx, { x: 'R', i: 1 })));
    let best = 0;
    H26.forEach((h, i) => {
      const w = Rx[i] - Lx[i] - 1, ar = h * w; best = Math.max(best, ar);
      f.push(F(`Bar ${i} (h ${h}): it can stretch from ${Lx[i] + 1} to ${Rx[i] - 1} → width ${Rx[i]} − (${sg(Lx[i])}) − 1 = ${w}, area ${ar}. best = ${best}.`, b(H26, { p: P([i, 'i']), rect: [Lx[i] + 1, Rx[i] - 1, h] })));
    });
    return f;
  });
  T(26, 2, () => {
    const hh = [...H26, 0], st = [], f = []; let best = 0;
    hh.forEach((h, i) => {
      const pops = [];
      while (st.length && hh[st[st.length - 1]] > h) {
        const k = st.pop(), left = st.length ? st[st.length - 1] : -1, w = i - left - 1, ar = hh[k] * w; best = Math.max(best, ar);
        pops.push({ k, left, w, ar });
      }
      st.push(i);
      const last = pops[pops.length - 1];
      f.push(F(`i = ${i} (${i === 6 ? 'sentinel 0' : 'h ' + h}): ${pops.length ? pops.map(p => `pop bar ${p.k} (h ${hh[p.k]}) → width ${i} − (${sg(p.left)}) − 1 = ${p.w}, area ${p.ar}`).join('; ') + '. ' : 'taller than the stack top → '}push ${i}. best = ${best}.`, b(H26, { p: i < 6 ? P([i, 'i']) : '', rect: last ? [last.left + 1, i - 1, hh[last.k]] : undefined, h: H(Object.fromEntries(st.filter(k => k < 6).map(k => [k, 'b']))) }), s(st.map(k => k === 6 ? '6:0' : `${k}:${hh[k]}`), { x: 'stack' })));
    });
    return f;
  });

  /* 27 · Longest Valid Parentheses */
  const S27 = [...')()())'];
  T(27, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 6; i++) {
      let bal = 0, len = 0, j = i;
      for (; j < 6; j++) { bal += S27[j] === '(' ? 1 : -1; if (bal < 0) break; if (bal === 0) len = j - i + 1; }
      best = Math.max(best, len);
      f.push(F(`Start i = ${i}: walk with a balance counter${j < 6 ? `; at ${j} the balance drops below 0 → stop` : ''}. Longest balanced from here = ${len}. best = ${best}.`, a(S27, { i: 1, w: len ? [i, i + len - 1] : undefined, h: H({ [j < 6 ? j : -1]: 'r' }), p: P([i, 'i']) })));
    }
    return f;
  });
  T(27, 1, () => {
    const st = [-1], f = []; let best = 0;
    f.push(F('Push −1 as the first wall (the index just before a valid run can start).', a(S27, { i: 1 }), s(['−1'], { x: 'stack' })));
    S27.forEach((ch, i) => {
      let msg;
      if (ch === '(') { st.push(i); msg = '"(" → push its index.'; }
      else { st.pop(); if (!st.length) { st.push(i); msg = '")" → pop; the stack is empty → this ")" becomes the new wall.'; } else { const len = i - st[st.length - 1]; best = Math.max(best, len); msg = `")" → pop; length = ${i} − top ${st[st.length - 1]} = ${len}. best = ${best}.`; } }
      f.push(F(`i = ${i}: ${msg}`, a(S27, { i: 1, h: H({ [i]: 'y' }) }), s(st.map(sg), { x: 'stack' })));
    });
    return f;
  });
  T(27, 2, () => {
    const f = []; let o = 0, c = 0, best = 0;
    S27.forEach((ch, i) => {
      if (ch === '(') o++; else c++;
      let msg = `open ${o}, close ${c}`;
      if (o === c) { best = Math.max(best, 2 * c); msg += ` → equal → length ${2 * c}`; } else if (c > o) { o = c = 0; msg += ' → too many ")" → reset to 0, 0'; }
      f.push(F(`Left → right, i = ${i} ("${ch}"): ${msg}. best = ${best}.`, a(S27, { i: 1, h: H({ [i]: 'y' }) }), kvr([['open', o], ['close', c], ['best', best]])));
    });
    o = c = 0;
    for (let i = 5; i >= 0; i--) {
      if (S27[i] === '(') o++; else c++;
      let msg = `open ${o}, close ${c}`;
      if (o === c) { best = Math.max(best, 2 * o); msg += ` → equal → length ${2 * o}`; } else if (o > c) { o = c = 0; msg += ' → too many "(" → reset'; }
      f.push(F(`Right → left, i = ${i} ("${S27[i]}"): ${msg}. best = ${best}.`, a(S27, { i: 1, h: H({ [i]: 'b' }) }), kvr([['open', o], ['close', c], ['best', best]])));
    }
    return f;
  });

  /* 28 · Minimum Remove to Make Valid */
  const S28 = [...'lee(t(c)o)de)'];
  T(28, 0, () => {
    const st = [], drop = new Set(), f = [];
    S28.forEach((ch, i) => {
      if (ch === '(') { st.push(i); f.push(F(`i = ${i} "(" → push its index.`, a(S28, { i: 1, h: H({ [i]: 'y' }) }), s(st.slice(), { x: 'stack' }))); }
      else if (ch === ')') {
        if (st.length) { const k = st.pop(); f.push(F(`i = ${i} ")" → pop ${k}: the pair (${k}, ${i}) is matched.`, a(S28, { i: 1, h: H({ [k]: 'g', [i]: 'g' }) }), st.length ? s(st.slice(), { x: 'stack' }) : kvr([['stack', 'empty']]))); }
        else { drop.add(i); f.push(F(`i = ${i} ")" with an empty stack → nothing to match → mark it for removal.`, a(S28, { i: 1, h: H({ [i]: 'r' }) }), kvr([['stack', 'empty']]))); }
      }
    });
    st.forEach(k => drop.add(k));
    f.push(F('Rebuild the string without the marked characters → "lee(t(c)o)de".', a(S28.filter((_, i) => !drop.has(i)), { x: 'result', h: '0g' })));
    return f;
  });
  T(28, 1, () => {
    const f = []; let open = 0; const keep = [];
    S28.forEach((ch, i) => {
      if (ch === '(') { open++; keep.push(ch); f.push(F(`Pass 1, i = ${i} "(" → open = ${open}. Keep it.`, a(S28, { i: 1, h: H({ [i]: 'y' }) }), kvr([['open', open]]))); }
      else if (ch === ')') { if (open) { open--; keep.push(ch); f.push(F(`Pass 1, i = ${i} ")" → matches an open "(" → open = ${open}. Keep it.`, a(S28, { i: 1, h: H({ [i]: 'g' }) }), kvr([['open', open]]))); } else f.push(F(`Pass 1, i = ${i} ")" → no open "(" → skip it.`, a(S28, { i: 1, h: H({ [i]: 'r' }) }), kvr([['open', 0]]))); }
      else keep.push(ch);
    });
    f.push(F(`Pass 2 (right → left): open = ${open} → no extra "(" to remove. Result "${keep.join('')}".`, a(keep, { x: 'result', h: '0g' })));
    return f;
  });

  /* 29 · Binary Search */
  const N29 = [-1, 0, 3, 5, 9, 12];
  T(29, 0, () => N29.slice(0, 5).map((v, i) => F(`i = ${i}: ${sg(v)} ${v === 9 ? '= 9 ✓ → return 4.' : '≠ 9 → next.'}`, a(N29, { i: 1, h: H(range(0, i - 1, 'r', { [i]: v === 9 ? 'g' : 'y' })), p: P([i, 'i']) }))));
  T(29, 1, () => {
    let lo = 0, hi = 5; const f = [];
    while (lo <= hi) {
      const m = lo + ((hi - lo) >> 1), v = N29[m];
      const out = {}; for (let k = 0; k < 6; k++) if (k < lo || k > hi) out[k] = 'm';
      if (v === 9) { out[m] = 'g'; f.push(F(`lo = ${lo}, hi = ${hi} → m = ${m}: ${v} = 9 ✓ → return ${m}.`, a(N29, { i: 1, h: H(out), p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']) }))); break; }
      out[m] = 'r';
      f.push(F(`lo = ${lo}, hi = ${hi} → m = ${m}: ${sg(v)} ${v < 9 ? '< 9 → the target is right of m → lo = m + 1.' : '> 9 → hi = m − 1.'}`, a(N29, { i: 1, h: H(out), p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']) })));
      if (v < 9) lo = m + 1; else hi = m - 1;
    }
    return f;
  });

  /* 30 · Search in Rotated Sorted Array */
  const N30 = [4, 5, 6, 7, 0, 1, 2];
  const dim = (lo, hi, extra) => { const o = {}; for (let k = 0; k < 7; k++) if (k < lo || k > hi) o[k] = 'm'; return Object.assign(o, extra); };
  T(30, 0, () => N30.slice(0, 5).map((v, i) => F(`i = ${i}: ${v} ${v === 0 ? '= 0 ✓ → return 4.' : '≠ 0 → next.'}`, a(N30, { i: 1, h: H(range(0, i - 1, 'r', { [i]: v === 0 ? 'g' : 'y' })), p: P([i, 'i']) }))));
  T(30, 1, () => {
    const f = []; let lo = 0, hi = 6;
    while (lo < hi) {
      const m = (lo + hi) >> 1, right = N30[m] > N30[hi];
      f.push(F(`Find the pivot: lo = ${lo}, hi = ${hi}, m = ${m}. nums[m] ${N30[m]} ${right ? `> nums[hi] ${N30[hi]} → the drop is right of m → lo = m + 1.` : `≤ nums[hi] ${N30[hi]} → the drop is at m or left → hi = m.`}`, a(N30, { i: 1, h: H(dim(lo, hi, { [m]: 'y' })), p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']) })));
      if (right) lo = m + 1; else hi = m;
    }
    f.push(F(`Pivot = index ${lo} (value ${N30[lo]}). Target 0 is between nums[${lo}] and nums[6] → search [${lo} … 6].`, a(N30, { i: 1, h: H(dim(lo, 6, { [lo]: 'b' })), p: P([lo, 'pivot']) })));
    let a0 = lo, b0 = 6;
    while (a0 <= b0) {
      const m = (a0 + b0) >> 1;
      if (N30[m] === 0) { f.push(F(`Binary search: lo = ${a0}, hi = ${b0}, m = ${m}: ${N30[m]} = 0 ✓ → return ${m}.`, a(N30, { i: 1, h: H(dim(a0, b0, { [m]: 'g' })), p: P([a0, 'lo'], [m, 'm'], [b0, 'hi']) }))); break; }
      f.push(F(`Binary search: lo = ${a0}, hi = ${b0}, m = ${m}: ${N30[m]} ${N30[m] < 0 ? '< 0 → lo = m + 1.' : '> 0 → hi = m − 1.'}`, a(N30, { i: 1, h: H(dim(a0, b0, { [m]: 'r' })), p: P([a0, 'lo'], [m, 'm'], [b0, 'hi']) })));
      if (N30[m] < 0) a0 = m + 1; else b0 = m - 1;
    }
    return f;
  });
  T(30, 2, () => {
    const f = []; let lo = 0, hi = 6;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (N30[m] === 0) { f.push(F(`lo = ${lo}, hi = ${hi}, m = ${m}: ${N30[m]} = 0 ✓ → return ${m}.`, a(N30, { i: 1, h: H(dim(lo, hi, { [m]: 'g' })), p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']) }))); break; }
      let msg;
      if (N30[lo] <= N30[m]) { const inside = N30[lo] <= 0 && 0 < N30[m]; msg = `left half [${N30[lo]} … ${N30[m]}] is sorted. Is 0 inside it? ${inside ? 'yes → hi = m − 1' : 'no → lo = m + 1'}.`; if (inside) hi = m - 1; else lo = m + 1; }
      else { const inside = N30[m] < 0 && 0 <= N30[hi]; msg = `right half [${N30[m]} … ${N30[hi]}] is sorted. Is 0 inside it? ${inside ? 'yes → lo = m + 1' : 'no → hi = m − 1'}.`; if (inside) lo = m + 1; else hi = m - 1; }
      f.push(F(`m = ${m} (${N30[m]}): ${msg}`, a(N30, { i: 1, h: H(dim(lo, hi, { [m]: 'r' })), p: P([m, 'm']) })));
    }
    return f;
  });

  /* 31 · Find Minimum in Rotated Sorted Array */
  const N31 = [3, 4, 5, 1, 2];
  T(31, 0, () => {
    let mn = Infinity, mi = 0; return N31.map((v, i) => { if (v < mn) { mn = v; mi = i; } return F(`i = ${i} (${v}): smallest so far = ${mn}.`, a(N31, { i: 1, h: H({ [mi]: 'g', [i]: i === mi ? 'g' : 'y' }), p: P([i, 'i']) })); });
  });
  T(31, 1, () => {
    const f = []; let lo = 0, hi = 4;
    while (lo < hi) {
      const m = (lo + hi) >> 1, r = N31[m] > N31[hi];
      const o = {}; for (let k = 0; k < 5; k++) if (k < lo || k > hi) o[k] = 'm'; o[m] = 'y';
      f.push(F(`lo = ${lo}, hi = ${hi}, m = ${m}: nums[m] ${N31[m]} ${r ? `> nums[hi] ${N31[hi]} → the minimum is right of m → lo = m + 1.` : `≤ nums[hi] ${N31[hi]} → the minimum is at m or left → hi = m.`}`, a(N31, { i: 1, h: H(o), p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']) })));
      if (r) lo = m + 1; else hi = m;
    }
    f.push(F(`lo = hi = ${lo} → minimum = ${N31[lo]}.`, a(N31, { i: 1, h: H({ [lo]: 'g' }), p: P([lo, 'lo hi']) })));
    return f;
  });

  /* 32 · Koko Eating Bananas */
  const P32 = [3, 6, 7, 11];
  const hrs = sp => P32.map(p => Math.ceil(p / sp));
  T(32, 0, () => {
    const f = [];
    for (let sp = 1; sp <= 4; sp++) {
      const hs = hrs(sp), t = hs.reduce((x, y) => x + y, 0), ok = t <= 8;
      f.push(F(`Speed ${sp}: hours per pile = ⌈pile / ${sp}⌉ → ${hs.join(' + ')} = ${t} ${ok ? '≤ 8 ✓ → answer 4.' : '> 8 ✗ → try faster.'}`, a(P32, { x: 'pile' }), a(hs, { x: 'hours', h: H(Object.fromEntries(hs.map((_, k) => [k, ok ? 'g' : 'r']))) })));
    }
    return f;
  });
  T(32, 1, () => {
    const f = []; let lo = 1, hi = 11;
    while (lo < hi) {
      const m = (lo + hi) >> 1, hs = hrs(m), t = hs.reduce((x, y) => x + y, 0), ok = t <= 8;
      f.push(F(`lo = ${lo}, hi = ${hi} → try speed ${m}: ${hs.join(' + ')} = ${t} hours ${ok ? '≤ 8 ✓ → it works, try slower: hi = ' + m : '> 8 ✗ → too slow: lo = ' + (m + 1)}.`, a(P32, { x: 'pile' }), a(hs, { x: `@${m}`, h: H(Object.fromEntries(hs.map((_, k) => [k, ok ? 'g' : 'r']))) }), kvr([['lo', lo], ['hi', hi]])));
      if (ok) hi = m; else lo = m + 1;
    }
    f.push(F(`lo = hi = ${lo} → the slowest speed that finishes in 8 hours is ${lo}.`, kvr([['speed', lo]], { h: 'speedg' })));
    return f;
  });

  /* 33 · Capacity To Ship */
  const W33 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ship = cap => { const d = []; let day = 1, load = 0; W33.forEach(w => { if (load + w > cap) { day++; load = 0; } load += w; d.push(day); }); return d; };
  T(33, 0, () => {
    const f = [];
    for (let cap = 10; cap <= 15; cap++) {
      const d = ship(cap), days = d[d.length - 1], ok = days <= 5;
      f.push(F(`Capacity ${cap}: fill the truck greedily → ${days} days ${ok ? '≤ 5 ✓ → answer 15.' : '> 5 ✗ → try ' + (cap + 1) + '.'}`, a(W33, { x: 'weight' }), a(d, { x: 'day', h: H({ 9: ok ? 'g' : 'r' }) })));
    }
    return f;
  });
  T(33, 1, () => {
    const f = []; let lo = 10, hi = 55;
    f.push(F('The answer lies between max weight (10) and total weight (55). Binary-search it.', a(W33, { x: 'weight' }), kvr([['lo', 10], ['hi', 55]])));
    while (lo < hi) {
      const m = (lo + hi) >> 1, d = ship(m), days = d[d.length - 1], ok = days <= 5;
      f.push(F(`lo = ${lo}, hi = ${hi} → capacity ${m}: ${days} days ${ok ? `≤ 5 ✓ → hi = ${m}` : `> 5 ✗ → lo = ${m + 1}`}.`, a(W33, { x: 'weight' }), a(d, { x: `@${m}`, h: H({ 9: ok ? 'g' : 'r' }) })));
      if (ok) hi = m; else lo = m + 1;
    }
    f.push(F(`lo = hi = ${lo} → the smallest capacity that ships in 5 days.`, kvr([['capacity', lo]], { h: 'capacityg' })));
    return f;
  });

  /* 34 · Find Peak Element */
  const N34 = [1, 2, 1, 3, 5, 6, 4];
  T(34, 0, () => [
    F('i = 0: 1 < 2 → still going uphill.', b(N34, { p: '0:i', h: '0y' })),
    F('i = 1: 2 > 1 → it goes down after 2 → index 1 is a peak.', b(N34, { p: '1:i', h: '1g' }))
  ]);
  T(34, 1, () => {
    const f = []; let lo = 0, hi = 6;
    while (lo < hi) {
      const m = (lo + hi) >> 1, up = N34[m] < N34[m + 1];
      f.push(F(`lo = ${lo}, hi = ${hi}, m = ${m}: ${N34[m]} ${up ? `< ${N34[m + 1]} → uphill to the right, a peak must be there → lo = m + 1.` : `> ${N34[m + 1]} → downhill, a peak is at m or left → hi = m.`}`, b(N34, { p: P([lo, 'lo'], [m, 'm'], [hi, 'hi']), h: H({ [m]: 'y', [m + 1]: 'b' }) })));
      if (up) lo = m + 1; else hi = m;
    }
    f.push(F(`lo = hi = ${lo} → index ${lo} (value ${N34[lo]}) is a peak.`, b(N34, { p: P([lo, 'peak']), h: H({ [lo]: 'g' }) })));
    return f;
  });

  /* 35 · Reverse Linked List */
  const LL = [1, 2, 3, 4, 5];
  const rev = k => { let d = ''; for (let i = 0; i < 4; i++) d += i < k - 1 ? '<' : i === k - 1 ? ' ' : '>'; return d; };
  T(35, 0, () => [
    F('Walk the list and copy every value into a vector.', l(LL), a(LL, { x: 'vector', h: '0y,1y,2y,3y,4y' })),
    F('Walk the list again and write the vector back from the end: 5, 4, 3, 2, 1.', l([5, 4, 3, 2, 1], { h: '0g,1g,2g,3g,4g' }), a(LL, { x: 'vector', il: ['', '', '', '', ''], arc: [[4, 0], [0, 4]] }))
  ]);
  T(35, 1, () => {
    const f = [F('reverse(1) → reverse(2) → reverse(3) → reverse(4) → reverse(5). Node 5 has no next → it is the new head; return it.', l(LL, { tail: '∅', h: '4g', p: '4:new head' }))];
    for (let k = 3; k >= 0; k--) {
      const d = '>>>>'.split(''); for (let e = k; e < 4; e++) d[e] = '<';
      f.push(F(`Back in reverse(${LL[k]}): ${LL[k]}.next.next = ${LL[k]} (node ${LL[k + 1]} now points back), then ${LL[k]}.next = null.`, l(LL, { d: d.join(''), h: H({ [k]: 'y', [k + 1]: 'b', 4: 'g' }), p: P([4, 'head'], [k, 'cur']) })));
    }
    return f;
  });
  T(35, 2, () => {
    const f = [F('prev = null, cur = 1.', l(LL, { tail: '∅', p: '0:cur' }))];
    for (let k = 1; k <= 5; k++) f.push(F(`Save next = ${k < 5 ? LL[k] : 'null'}. Flip ${LL[k - 1]}.next → ${k > 1 ? LL[k - 2] : 'null'}. Step: prev = ${LL[k - 1]}, cur = ${k < 5 ? LL[k] : 'null'}.`, l(LL, { d: rev(k), h: H(range(0, k - 1, 'g')), p: P([k - 1, 'prev'], [k < 5 ? k : -1, 'cur']) })));
    f.push(F('cur is null → prev (5) is the new head: 5 → 4 → 3 → 2 → 1.', l([5, 4, 3, 2, 1], { tail: '∅', h: '0g', p: '0:head' })));
    return f;
  });

  /* 36 · Merge Two Sorted Lists */
  T(36, 0, () => [
    F('Dump the values of both lists into one array.', l([1, 2, 4], { x: 'a' }), l([1, 3, 4], { x: 'b' }), a([1, 2, 4, 1, 3, 4], { x: 'values' })),
    F('Sort the array.', a([1, 1, 2, 3, 4, 4], { x: 'sorted', h: '0y,1y,2y,3y,4y,5y' })),
    F('Build a new list from it.', l([1, 1, 2, 3, 4, 4], { h: '0g,1g,2g,3g,4g,5g' }))
  ]);
  const merge36 = (rec) => () => {
    const A = [1, 2, 4], B = [1, 3, 4], out = [], f = [];
    let i = 0, j = 0;
    if (!rec) f.push(F('dummy → (nothing yet). tail = dummy.', l([1, 2, 4], { x: 'a', p: '0:i' }), l([1, 3, 4], { x: 'b', p: '0:j' }), l(['D'], { x: 'out', p: '0:tail' })));
    while (i < 3 && j < 3) {
      const ta = A[i] <= B[j], v = ta ? A[i] : B[j];
      const msg = rec ? `merge(${A.slice(i).join('→')}, ${B.slice(j).join('→')}): ${A[i]} vs ${B[j]} → ${ta ? 'a' : 'b'}'s ${v} wins; its next = merge(the rest).` : `${A[i]} vs ${B[j]} → attach ${ta ? 'a' : 'b'}'s ${v}, move tail.`;
      f.push(F(msg, l(A, { x: 'a', h: H(Object.assign(range(0, i - 1, 'm'), { [i]: ta ? 'g' : 'y' })), p: P([i, 'i']) }), l(B, { x: 'b', h: H(Object.assign(range(0, j - 1, 'm'), { [j]: ta ? 'y' : 'g' })), p: P([j, 'j']) }), l(rec ? [...out, v] : ['D', ...out, v], { x: 'out', h: H({ [rec ? out.length : out.length + 1]: 'g' }) })));
      out.push(v); if (ta) i++; else j++;
    }
    const rest = i < 3 ? A.slice(i) : B.slice(j);
    f.push(F(`${i < 3 ? 'b' : 'a'} is empty → ${rec ? 'merge returns the other list' : 'attach the rest of the other list'} (${rest.join(' → ')}).`, l(rec ? [...out, ...rest] : ['D', ...out, ...rest], { x: 'out', h: H(range(rec ? out.length : out.length + 1, (rec ? 0 : 1) + out.length + rest.length - 1, 'b')) })));
    f.push(F(`Result${rec ? '' : ' = dummy.next'}: 1 → 1 → 2 → 3 → 4 → 4.`, l([1, 1, 2, 3, 4, 4], { h: '0g,1g,2g,3g,4g,5g' })));
    return f;
  };
  T(36, 1, merge36(true));
  T(36, 2, merge36(false));

  /* 37 · Linked List Cycle */
  T(37, 0, () => {
    const v = [3, 2, 0, -4], f = [], seen = [];
    [0, 1, 2, 3].forEach(k => { seen.push(sg(v[k])); f.push(F(`Visit ${sg(v[k])}: not in the set → add it, go to next.`, l(v.map(sg), { cyc: 1, h: H(range(0, k, 'b', { [k]: 'y' })), p: P([k, 'cur']) }), kvr([['set', seen.join(' ')]]))); });
    f.push(F('Next is 2 again: 2 is already in the set → we came back → cycle → true.', l(v.map(sg), { cyc: 1, h: '1r', p: '1:cur' }), kvr([['set', seen.join(' ')]])));
    return f;
  });
  T(37, 1, () => {
    const v = [3, 2, 0, -4].map(sg), nx = k => (k === 3 ? 1 : k + 1), f = [];
    let sl = 0, fs = 0; f.push(F('slow and fast both start at 3.', l(v, { cyc: 1, p: '0:slow fast' })));
    for (let st = 1; st <= 3; st++) {
      sl = nx(sl); fs = nx(nx(fs));
      const meet = sl === fs;
      f.push(F(`Step ${st}: slow moves 1 → ${v[sl]}, fast moves 2 → ${v[fs]}.${meet ? ' They meet → cycle → true.' : ''}`, l(v, { cyc: 1, h: H(meet ? { [sl]: 'g' } : { [sl]: 'y', [fs]: 'b' }), p: meet ? P([sl, 'slow fast']) : P([sl, 'slow'], [fs, 'fast']) })));
      if (meet) break;
    }
    return f;
  });

  /* 38 · Remove Nth Node From End */
  const D38 = ['D', 1, 2, 3, 4, 5];
  T(38, 0, () => [
    F('Pass 1: walk the list and count → L = 5.', l(D38, { tail: '∅', h: '1y,2y,3y,4y,5y' }), kvr([['L', 5]])),
    F('Pass 2: from the dummy, walk L − n = 5 − 2 = 3 steps → we stop at node 3, just before the target.', l(D38, { tail: '∅', h: '4r', p: '3:prev' })),
    F('Unlink: 3.next = 3.next.next → node 4 is skipped.', l(['D', 1, 2, 3, 5], { tail: '∅', h: '3g' }))
  ]);
  T(38, 1, () => {
    const f = [F('slow and fast both start at the dummy.', l(D38, { tail: '∅', p: '0:slow fast' }))];
    for (let k = 1; k <= 3; k++) f.push(F(`Move fast ahead n + 1 = 3 steps: step ${k}.`, l(D38, { tail: '∅', p: P([0, 'slow'], [k, 'fast']) })));
    let sl = 0, fs = 3;
    while (fs < 6) { sl++; fs++; f.push(F(`Move both one step: slow = ${D38[sl]}, fast = ${fs < 6 ? D38[fs] : 'null'}.${fs >= 6 ? ' fast fell off → slow sits just before the target.' : ''}`, l(D38, { tail: '∅', h: fs >= 6 ? H({ [sl + 1]: 'r' }) : '', p: P([sl, 'slow'], [fs, 'fast']) }))); }
    f.push(F('slow.next = slow.next.next → node 4 is removed.', l(['D', 1, 2, 3, 5], { tail: '∅', h: '3g' })));
    return f;
  });

  /* 39 · LRU Cache */
  T(39, 0, () => [
    F('put(1, 1): not present → insert at the front.', a(['1:1'], { x: 'vector', h: '0y' })),
    F('put(2, 2): insert at the front (front = most recent).', a(['2:2', '1:1'], { x: 'vector', h: '0y' })),
    F('get(1): linear scan finds key 1 at index 1 → return 1 and move it to the front.', a(['1:1', '2:2'], { x: 'vector', h: '0g' })),
    F('put(3, 3): insert at the front → size 3 > capacity 2 → pop the back (key 2).', a(['3:3', '1:1', '2:2'], { x: 'vector', h: '0y,2r' })),
    F('Cache holds 3 and 1. Every op paid a linear scan.', a(['3:3', '1:1'], { x: 'vector', h: '0g,1g' }))
  ]);
  T(39, 1, () => [
    F('put(1, 1): new node at the front of the list; map[1] → node.', l(['H', '1:1', 'T'], { d: '>>', h: '1y' }), kvr([['1', 'node']], { x: 'map' })),
    F('put(2, 2): new node at the front; map[2] → node.', l(['H', '2:2', '1:1', 'T'], { h: '1y' }), kvr([['1', 'node'], ['2', 'node']], { x: 'map' })),
    F('get(1): map gives the node in O(1) → splice it to the front → return 1.', l(['H', '1:1', '2:2', 'T'], { h: '1g' }), kvr([['1', 'node'], ['2', 'node']], { x: 'map', h: '1g' })),
    F('put(3, 3): size would be 3 > 2 → evict the node before the tail (key 2) and erase map[2].', l(['H', '1:1', '2:2', 'T'], { h: '2r' }), kvr([['1', 'node'], ['2', 'node']], { x: 'map', h: '2r' })),
    F('Insert 3 at the front. Cache = 3, 1. Every step was O(1).', l(['H', '3:3', '1:1', 'T'], { h: '1g,2g' }), kvr([['1', 'node'], ['3', 'node']], { x: 'map', h: '3g' }))
  ]);

  /* 40 · Maximum Depth */
  const T40 = [3, 9, 20, N, N, 15, 7];
  T(40, 0, () => [
    F('depth(3) asks its left child first: depth(9).', tr(T40, { h: '0y,1y' })),
    F('9 has no children: depth(null) = 0 on both sides → depth(9) = 1 + max(0, 0) = 1.', tr(T40, { h: '1g', lab: { 1: '↑1' } })),
    F('Now depth(20) → depth(15) = 1 (a leaf).', tr(T40, { h: '2y,5g', lab: { 1: '↑1', 5: '↑1' } })),
    F('depth(7) = 1 (a leaf).', tr(T40, { h: '2y,6g', lab: { 1: '↑1', 5: '↑1', 6: '↑1' } })),
    F('depth(20) = 1 + max(1, 1) = 2.', tr(T40, { h: '2g', lab: { 1: '↑1', 2: '↑2', 5: '↑1', 6: '↑1' } })),
    F('depth(3) = 1 + max(1, 2) = 3.', tr(T40, { h: '0g', lab: { 0: '↑3', 1: '↑1', 2: '↑2', 5: '↑1', 6: '↑1' } }))
  ]);
  T(40, 1, () => [
    F('Queue starts with the root. levels = 0.', tr(T40, { h: '0y' }), a([3], { x: 'queue' })),
    F('Level 1: pop 3, push 9 and 20. levels = 1.', tr(T40, { h: '0g,1y,2y' }), a([9, 20], { x: 'queue' })),
    F('Level 2: pop 9 (no children), pop 20 (push 15, 7). levels = 2.', tr(T40, { h: '0g,1g,2g,5y,6y' }), a([15, 7], { x: 'queue' })),
    F('Level 3: pop 15, pop 7 (no children). levels = 3. Queue empty → depth 3.', tr(T40, { h: '0g,1g,2g,5g,6g' }), kvr([['queue', 'empty']]))
  ]);

  VIZ.DRY = VIZ.DRY || {};
  Object.keys(X).forEach(id => { VIZ.DRY[id] = Object.assign(VIZ.DRY[id] || {}, X[id]); });
})();
