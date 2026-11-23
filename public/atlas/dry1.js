/* Full dry runs, problems 1-20. Each tracer runs the real algorithm on the
   example input and records one frame per meaningful step. */
(function () {
  const { a, s, kvr, n, b, F } = VIZ.h;
  const X = {};
  const T = (id, si, fn) => { (X[id] = X[id] || {})[si] = fn(); };
  const H = o => Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + v).join(',');
  const P = (...pairs) => pairs.filter(p => p && p[0] !== undefined && p[0] !== null && p[0] >= 0).map(([i, t]) => i + ':' + t).join(',');
  const sg = x => (typeof x === 'number' && x < 0 ? '−' + (-x) : String(x));
  const L = arr => '[' + arr.map(sg).join(', ') + ']';
  const range = (l, r, cls, o = {}) => { for (let i = l; i <= r; i++) o[i] = cls; return o; };

  /* 1 · Two Sum */
  const N1 = [2, 7, 11, 15];
  T(1, 0, () => {
    const f = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const ok = N1[i] + N1[j] === 9;
      f.push(F(`i = ${i}, j = ${j}: ${N1[i]} + ${N1[j]} = ${N1[i] + N1[j]} ${ok ? '= target ✓ → return [0, 1].' : '≠ 9 → next j.'}`,
        a(N1, { x: 'nums', i: 1, h: H({ [i]: ok ? 'g' : 'y', [j]: ok ? 'g' : 'r' }), p: P([i, 'i'], [j, 'j']) })));
      if (ok) return [F('The outer loop fixes i = 0 (value 2). The inner loop will try every j after it.', a(N1, { x: 'nums', i: 1, h: '0y', p: '0:i' })), ...f];
    }
  });
  T(1, 1, () => {
    const pr = N1.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), lab = pr.map(([v, i]) => `${v}·${i}`), f = [];
    f.push(F('Make (value · original index) pairs and sort by value. Here they are already sorted.', a(lab, { x: 'sorted' })));
    let l = 0, r = 3;
    while (l < r) {
      const sum = pr[l][0] + pr[r][0];
      if (sum === 9) { f.push(F(`l = ${l}, r = ${r}: ${pr[l][0]} + ${pr[r][0]} = 9 ✓ → original indexes ${pr[l][1]} and ${pr[r][1]}.`, a(lab, { x: 'sorted', h: H({ [l]: 'g', [r]: 'g' }), p: P([l, 'l'], [r, 'r']) }))); break; }
      const big = sum > 9;
      f.push(F(`l = ${l}, r = ${r}: ${pr[l][0]} + ${pr[r][0]} = ${sum} ${big ? '> 9 → too big, move r left.' : '< 9 → too small, move l right.'}`, a(lab, { x: 'sorted', h: H({ [l]: big ? 'y' : 'r', [r]: big ? 'r' : 'y' }), p: P([l, 'l'], [r, 'r']) })));
      if (big) r--; else l++;
    }
    return f;
  });
  T(1, 2, () => {
    const mp = [], f = [];
    for (let i = 0; i < 4; i++) {
      const need = 9 - N1[i], hit = mp.find(([k]) => k === need);
      if (hit) { f.push(F(`i = ${i} (${N1[i]}): need 9 − ${N1[i]} = ${need}. ${need} is in the map at index ${hit[1]} ✓ → return [${hit[1]}, ${i}].`, a(N1, { x: 'nums', i: 1, h: H({ [hit[1]]: 'g', [i]: 'g' }), p: P([i, 'i']) }), kvr(mp, { x: 'map', h: need + 'g' }))); break; }
      mp.push([N1[i], i]);
      f.push(F(`i = ${i} (${N1[i]}): need 9 − ${N1[i]} = ${need}. Not in the map yet → store ${N1[i]} → ${i}.`, a(N1, { x: 'nums', i: 1, h: H({ [i]: 'y' }), p: P([i, 'i']) }), kvr(mp.slice(), { x: 'map', h: N1[i] + 'y' })));
    }
    return f;
  });

  /* 2 · Valid Anagram */
  T(2, 0, () => [
    F('Sort the letters of s: "anagram" → a a a g m n r.', a([...'anagram'], { x: 's' }), a([...'aaagmnr'], { x: 'sorted s', h: '0y,1y,2y,3y,4y,5y,6y' })),
    F('Sort the letters of t: "nagaram" → a a a g m n r.', a([...'nagaram'], { x: 't' }), a([...'aaagmnr'], { x: 'sorted t', h: '0y,1y,2y,3y,4y,5y,6y' })),
    F('Compare the two sorted strings letter by letter: all 7 match → true.', a([...'aaagmnr'], { x: 'sorted s', h: '0g,1g,2g,3g,4g,5g,6g' }), a([...'aaagmnr'], { x: 'sorted t', h: '0g,1g,2g,3g,4g,5g,6g' }))
  ]);
  T(2, 1, () => {
    const cnt = {}, keys = ['a', 'n', 'g', 'r', 'm'], f = [];
    for (const ch of 'anagram') cnt[ch] = (cnt[ch] || 0) + 1;
    const row = (hk) => kvr(keys.map(k => [k, cnt[k]]), { x: 'count', h: hk });
    f.push(F('Walk s = "anagram" and add 1 for every letter.', a([...'anagram'], { x: 's', h: '0y,1y,2y,3y,4y,5y,6y' }), row('')));
    [...'nagaram'].forEach((ch, i) => {
      cnt[ch]--;
      f.push(F(`t[${i}] = "${ch}" → subtract 1: ${ch} is now ${cnt[ch]}.`, a([...'nagaram'], { x: 't', i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })), p: P([i, 'i']) }), row(ch + (cnt[ch] === 0 ? 'g' : 'y'))));
    });
    f.push(F('Every counter is back to 0 → same letters, same amounts → true.', row('ag,ng,gg,rg,mg')));
    return f;
  });

  /* 3 · Group Anagrams */
  const W3 = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
  const srt = w => [...w].sort().join('');
  const ck = w => { const c = {}; [...w].forEach(x => { c[x] = (c[x] || 0) + 1; }); return Object.keys(c).sort().map(k => k + c[k]).join(''); };
  T(3, 0, () => {
    const used = Array(6).fill(false), groups = [], f = [];
    for (let i = 0; i < 6; i++) {
      if (used[i]) { f.push(F(`"${W3[i]}" is already in a group → skip it.`, a(W3, { h: H(Object.fromEntries(W3.map((_, k) => [k, used[k] ? 'm' : '']).concat([[i, 'y']]))), p: P([i, 'i']) }), kvr(groups.map((g, k) => ['group ' + (k + 1), g.join(' ')])))); continue; }
      used[i] = true; const g = [W3[i]], hh = { [i]: 'y' }, res = [];
      for (let j = i + 1; j < 6; j++) {
        if (used[j]) continue;
        if (srt(W3[j]) === srt(W3[i])) { used[j] = true; g.push(W3[j]); hh[j] = 'g'; res.push(W3[j] + ' ✓'); } else { hh[j] = 'r'; res.push(W3[j] + ' ✗'); }
      }
      groups.push(g);
      f.push(F(`"${W3[i]}" (sorted: ${srt(W3[i])}) is compared with every free word after it: ${res.join(', ') || 'none left'} → group [${g.join(', ')}].`,
        a(W3, { h: H(hh), p: P([i, 'i']) }), kvr(groups.map((gg, k) => ['group ' + (k + 1), gg.join(' ')]), { h: 'group ' + groups.length + 'g' })));
    }
    return f;
  });
  const mapRun = (keyFn, keyName) => () => {
    const mp = [], f = [];
    W3.forEach((w, i) => {
      const k = keyFn(w), e = mp.find(x => x[0] === k);
      if (e) e[1] += ' ' + w; else mp.push([k, w]);
      f.push(F(`"${w}" → ${keyName} "${k}". ${e ? 'Key exists → add it to that list.' : 'New key → start a new list.'}`, a(W3, { i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })), p: P([i, 'word']) }), kvr(mp.map(x => x.slice()), { x: 'map', h: k + 'y' })));
    });
    f.push(F('Every list in the map is one group.', kvr(mp.map(x => x.slice()), { x: 'map', h: mp.map(x => x[0] + 'g').join(',') })));
    return f;
  };
  T(3, 1, mapRun(srt, 'sorted key'));
  T(3, 2, mapRun(ck, 'count key'));

  /* 4 · Top K Frequent */
  const N4 = [1, 1, 1, 2, 2, 3];
  T(4, 0, () => {
    const c = [], f = [];
    N4.forEach((v, i) => { const e = c.find(x => x[0] === v); if (e) e[1]++; else c.push([v, 1]); f.push(F(`nums[${i}] = ${v} → count of ${v} becomes ${(e || c[c.length - 1])[1]}.`, a(N4, { x: 'nums', i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })) }), kvr(c.map(([k, x]) => [k, '×' + x]), { x: 'count', h: v + 'y' }))); });
    f.push(F('Sort the (number, count) pairs by count, highest first: 1 (×3), 2 (×2), 3 (×1).', kvr([[1, '×3'], [2, '×2'], [3, '×1']], { x: 'sorted' })));
    f.push(F('Take the first k = 2 → [1, 2].', kvr([[1, '×3'], [2, '×2'], [3, '×1']], { x: 'sorted', h: '1g,2g,3r' })));
    return f;
  });
  T(4, 1, () => [
    F('Count first: 1 → ×3, 2 → ×2, 3 → ×1.', kvr([[1, '×3'], [2, '×2'], [3, '×1']], { x: 'count' })),
    F('Push 1 (×3). Heap size 1 ≤ k = 2 → keep.', s(['1:×3'], { x: 'min-heap', h: '0y' })),
    F('Push 2 (×2). Size 2 ≤ k → keep. The smallest count (2:×2) sits on top.', s(['1:×3', '2:×2'], { x: 'min-heap', h: '1y' })),
    F('Push 3 (×1). Size 3 > k → pop the top, which is the smallest count: 3 (×1).', s(['1:×3', '2:×2', '3:×1'], { x: 'min-heap', h: '2r' })),
    F('Heap holds exactly the k most frequent: 1 and 2.', s(['1:×3', '2:×2'], { x: 'min-heap', h: '0g,1g' }))
  ]);
  T(4, 2, () => {
    const bk = [['0', '–'], ['1', '–'], ['2', '–'], ['3', '–'], ['4', '–'], ['5', '–'], ['6', '–']];
    const set = (i, v) => { bk[i] = [String(i), v]; return bk.map(x => x.slice()); };
    return [
      F('Count first: 1 → ×3, 2 → ×2, 3 → ×1.', kvr([[1, '×3'], [2, '×2'], [3, '×1']], { x: 'count' })),
      F('Bucket index = count. Put 1 into bucket 3.', kvr(set(3, '1'), { x: 'bucket', h: '3y' })),
      F('Put 2 into bucket 2, and 3 into bucket 1.', kvr((set(2, '2'), set(1, '3')), { x: 'bucket', h: '2y,1y' })),
      F('Walk buckets from 6 down: 6, 5, 4 empty → bucket 3 gives 1.', kvr(bk.map(x => x.slice()), { x: 'bucket', h: '6m,5m,4m,3g' })),
      F('Bucket 2 gives 2 → we have k = 2 numbers → stop: [1, 2].', kvr(bk.map(x => x.slice()), { x: 'bucket', h: '3g,2g' }))
    ];
  });

  /* 5 · Product Except Self */
  const N5 = [1, 2, 3, 4];
  T(5, 0, () => {
    const ans = ['·', '·', '·', '·'], f = [];
    N5.forEach((_, i) => {
      const others = N5.filter((__, k) => k !== i), p = others.reduce((x, y) => x * y, 1); ans[i] = p;
      f.push(F(`i = ${i}: multiply everything except nums[${i}] → ${others.join(' × ')} = ${p}.`, a(N5, { x: 'nums', h: H(Object.fromEntries(N5.map((__, k) => [k, k === i ? 'r' : 'y']))), p: P([i, 'skip']) }), a(ans.slice(), { x: 'answer', h: H({ [i]: 'g' }) })));
    });
    return f;
  });
  T(5, 1, () => {
    const pre = ['·', '·', '·', '·'], suf = ['·', '·', '·', '·'], f = [];
    for (let i = 0; i < 4; i++) { pre[i] = i ? pre[i - 1] * N5[i - 1] : 1; f.push(F(i ? `pre[${i}] = pre[${i - 1}] × nums[${i - 1}] = ${pre[i - 1]} × ${N5[i - 1]} = ${pre[i]}.` : 'pre[0] = 1 (nothing on the left).', a(N5, { x: 'nums', h: H(range(0, i - 1, 'b')) }), a(pre.slice(), { x: 'pre', h: H({ [i]: 'y' }) }))); }
    for (let i = 3; i >= 0; i--) { suf[i] = i < 3 ? suf[i + 1] * N5[i + 1] : 1; f.push(F(i < 3 ? `suf[${i}] = suf[${i + 1}] × nums[${i + 1}] = ${suf[i + 1]} × ${N5[i + 1]} = ${suf[i]}.` : 'suf[3] = 1 (nothing on the right).', a(N5, { x: 'nums', h: H(range(i + 1, 3, 'b')) }), a(suf.slice(), { x: 'suf', h: H({ [i]: 'y' }) }))); }
    f.push(F('answer[i] = pre[i] × suf[i] → 1×24, 1×12, 2×4, 6×1.', a(pre, { x: 'pre' }), a(suf, { x: 'suf' }), a([24, 12, 8, 6], { x: 'answer', h: '0g,1g,2g,3g' })));
    return f;
  });
  T(5, 2, () => {
    const ans = ['·', '·', '·', '·'], f = [];
    for (let i = 0; i < 4; i++) { ans[i] = i ? ans[i - 1] * N5[i - 1] : 1; f.push(F(`Left pass, i = ${i}: answer[${i}] = product of everything left of it = ${ans[i]}.`, a(N5, { x: 'nums', h: H(range(0, i - 1, 'b')) }), a(ans.slice(), { x: 'answer', h: H({ [i]: 'y' }) }))); }
    let R = 1;
    for (let i = 3; i >= 0; i--) { const old = ans[i]; ans[i] = old * R; f.push(F(`Right pass, i = ${i}: R = ${R} (product of everything right of it) → answer[${i}] = ${old} × ${R} = ${ans[i]}. Then R ×= ${N5[i]}.`, a(N5, { x: 'nums', h: H(range(i + 1, 3, 'b')) }), a(ans.slice(), { x: 'answer', h: H(range(i + 1, 3, 'g', { [i]: 'y' })) }), n('R = ' + R + ' → ' + R * N5[i]))); R *= N5[i]; }
    return f;
  });

  /* 6 · Longest Consecutive Sequence */
  const N6 = [100, 4, 200, 1, 3, 2];
  T(6, 0, () => {
    let best = 0; const f = [];
    N6.forEach((x, i) => {
      let len = 1, cur = x, path = [x];
      while (N6.includes(cur + 1)) { cur++; len++; path.push(cur); }
      best = Math.max(best, len);
      const hh = {}; path.forEach(v => { hh[N6.indexOf(v)] = 'g'; }); hh[i] = 'y';
      f.push(F(`Start at ${x}: scan the whole array for ${x + 1}${len > 1 ? `, then ${path.slice(2).map(v => v).concat([cur + 1]).join(', ')} …` : ''} → ${len > 1 ? 'chain ' + path.join(' → ') : 'not found'} (length ${len}). Best = ${best}.`, a(N6, { x: 'nums', h: H(hh), p: P([i, 'x']) })));
    });
    return f;
  });
  T(6, 1, () => {
    const so = [...N6].sort((x, y) => x - y), f = [F('Sort: neighbours of the same chain end up side by side.', a(N6, { x: 'nums' }), a(so, { x: 'sorted' }))];
    let run = 1, best = 1;
    f.push(F('i = 0 (1): run = 1, best = 1.', a(so, { x: 'sorted', h: '0y', p: '0:i' }), kvr([['run', 1], ['best', 1]])));
    for (let i = 1; i < so.length; i++) {
      const ok = so[i] === so[i - 1] + 1; run = ok ? run + 1 : 1; best = Math.max(best, run);
      f.push(F(`i = ${i} (${so[i]}): ${ok ? `${so[i]} = ${so[i - 1]} + 1 → run = ${run}` : `${so[i]} ≠ ${so[i - 1]} + 1 → chain broken, run = 1`}. best = ${best}.`, a(so, { x: 'sorted', h: H(ok ? range(i - run + 1, i, 'g') : { [i]: 'r' }), p: P([i, 'i']) }), kvr([['run', run], ['best', best]])));
    }
    return f;
  });
  T(6, 2, () => {
    const f = [F('Put every number into a hash set (O(1) lookups).', a(N6, { x: 'nums' }), kvr([['set', '100 4 200 1 3 2']]))];
    let best = 0;
    N6.forEach((x, i) => {
      if (N6.includes(x - 1)) { f.push(F(`${x}: ${x - 1} is in the set → ${x} is not the start of a chain → skip.`, a(N6, { x: 'nums', h: H({ [i]: 'm' }), p: P([i, 'x']) }), kvr([['best', best]]))); return; }
      let cur = x, len = 1; const hh = { [i]: 'y' };
      while (N6.includes(cur + 1)) { cur++; len++; hh[N6.indexOf(cur)] = 'g'; }
      best = Math.max(best, len);
      f.push(F(`${x}: ${x - 1} is NOT in the set → a chain starts here. Walk ${x}${len > 1 ? ' → ' + Array.from({ length: len - 1 }, (_, k) => x + k + 1).join(' → ') : ''} → length ${len}. best = ${best}.`, a(N6, { x: 'nums', h: H(hh), p: P([i, 'start']) }), kvr([['best', best]], { h: 'bestg' })));
    });
    return f;
  });

  /* 7 · Least unique after K removals */
  const N7 = [4, 3, 1, 1, 3, 3, 2];
  T(7, 0, () => {
    const c = [[4, 1], [3, 3], [1, 2], [2, 1]], f = [F('Count each number: 4 ×1, 3 ×3, 1 ×2, 2 ×1.', a(N7, { x: 'arr' }), kvr(c.map(([k, v]) => [k, '×' + v]), { x: 'count' }))];
    for (let k = 1; k <= 3; k++) {
      let mi = 0; c.forEach((e, i) => { if (e[1] < c[mi][1]) mi = i; });
      const key = c[mi][0]; c[mi][1]--;
      const gone = c[mi][1] === 0, view = c.map(([kk, v]) => [kk, '×' + v]);
      f.push(F(`Removal ${k}: scan all counts for the smallest → ${key}. Remove one ${key}${gone ? ` → ${key} is gone completely.` : ` → ${key} is now ×${c[mi][1]}.`}`, kvr(view, { x: 'count', h: key + (gone ? 'r' : 'y') })));
      if (gone) c.splice(mi, 1);
    }
    f.push(F(`k is used up. Numbers left: ${c.map(x => x[0]).join(' and ')} → ${c.length} unique.`, kvr(c.map(([k, v]) => [k, '×' + v]), { x: 'left', h: c.map(x => x[0] + 'g').join(',') })));
    return f;
  });
  T(7, 1, () => [
    F('Count: 4 ×1, 3 ×3, 1 ×2, 2 ×1. Sort the counts small → big.', a([1, 1, 2, 3], { x: 'counts', il: ['4', '2', '1', '3'], i: 1 })),
    F('k = 3. Smallest count 1 (number 4): 1 ≤ k → remove it. k = 2, unique = 3.', a([1, 1, 2, 3], { x: 'counts', il: ['4', '2', '1', '3'], h: '0r', p: '0:i' })),
    F('Next count 1 (number 2): 1 ≤ k → remove it. k = 1, unique = 2.', a([1, 1, 2, 3], { x: 'counts', il: ['4', '2', '1', '3'], h: '0r,1r', p: '1:i' })),
    F('Next count 2 (number 1): 2 > k = 1 → we cannot wipe it out → stop. Unique left = 2.', a([1, 1, 2, 3], { x: 'counts', il: ['4', '2', '1', '3'], h: '0r,1r,2g,3g', p: '2:i' }))
  ]);
  T(7, 2, () => [
    F('Count: 4 ×1, 3 ×3, 1 ×2, 2 ×1. Bucket by count: how many numbers have each count?', kvr([['count 1', '2 nums'], ['count 2', '1 num'], ['count 3', '1 num']], { x: 'bucket' })),
    F('Count 1: 2 numbers, each costs 1 removal. k = 3 → remove both (cost 2). k = 1, unique 4 → 2.', kvr([['count 1', '2 nums'], ['count 2', '1 num'], ['count 3', '1 num']], { x: 'bucket', h: 'count 1r' })),
    F('Count 2: costs 2 removals each, but k = 1 → 1 / 2 = 0 can go → stop. Unique = 2.', kvr([['count 1', '2 nums'], ['count 2', '1 num'], ['count 3', '1 num']], { x: 'bucket', h: 'count 1r,count 2g,count 3g' }))
  ]);

  /* 8 · Maximum Subarray */
  const N8 = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  T(8, 0, () => {
    let best = -Infinity, bi = 0, bj = 0; const f = [];
    for (let i = 0; i < 9; i++) {
      let sum = 0, li = -Infinity, lj = i;
      for (let j = i; j < 9; j++) { sum += N8[j]; if (sum > li) { li = sum; lj = j; } }
      if (li > best) { best = li; bi = i; bj = lj; }
      f.push(F(`Start i = ${i}: extend j to the end, adding as we go. Best sum from here = ${sg(li)} (up to j = ${lj}). Overall best = ${best}.`, a(N8, { x: 'nums', i: 1, w: [i, lj], h: H(range(bi, bj, 'g')), p: P([i, 'i']) })));
    }
    return f;
  });
  T(8, 1, () => {
    const Pp = [0]; N8.forEach(x => Pp.push(Pp[Pp.length - 1] + x));
    const f = [F('Prefix sums: P[i] = sum of the first i numbers. A subarray sum = P[j] − P[i].', a(N8, { x: 'nums' }), a(Pp, { x: 'P', i: 1 }))];
    let mn = 0, mi = 0, best = -Infinity;
    for (let j = 1; j <= 9; j++) {
      const cand = Pp[j] - mn; if (cand > best) best = cand;
      f.push(F(`j = ${j}: P[j] = ${sg(Pp[j])}, smallest P before it = ${sg(mn)} → ${sg(Pp[j])} − (${sg(mn)}) = ${sg(cand)}. best = ${sg(best)}.`, a(Pp, { x: 'P', i: 1, h: H({ [mi]: 'b', [j]: 'y' }), p: P([mi, 'min'], [j, 'j']) })));
      if (Pp[j] < mn) { mn = Pp[j]; mi = j; }
    }
    return f;
  });
  T(8, 2, () => {
    let cur = 0, best = -Infinity, st = 0, bs = 0, be = 0; const f = [];
    N8.forEach((x, i) => {
      const fresh = cur + x < x; cur = fresh ? x : cur + x; if (fresh) st = i;
      if (cur > best) { best = cur; bs = st; be = i; }
      f.push(F(`i = ${i} (${sg(x)}): ${fresh ? `starting fresh (${sg(x)}) beats carrying the old sum → cur = ${sg(cur)}` : `extend → cur = ${sg(cur)}`}. best = ${sg(best)}.`, a(N8, { x: 'nums', i: 1, w: [st, i], h: H(range(bs, be, 'g', { [i]: fresh ? 'b' : '' })), p: P([i, 'i']) }), kvr([['cur', sg(cur)], ['best', best]])));
    });
    return f;
  });

  /* 9 · Subarray Sum Equals K */
  T(9, 0, () => [
    F('Start i = 0: 1 → 1 ≠ 3. Add 2 → 3 ✓ (count 1). Add 3 → 6.', a([1, 2, 3], { x: 'nums', w: [0, 1], h: '0g,1g', p: '0:i' }), kvr([['count', 1]])),
    F('Start i = 1: 2 → 2. Add 3 → 5. No hit.', a([1, 2, 3], { x: 'nums', w: [1, 2], h: '1r,2r', p: '1:i' }), kvr([['count', 1]])),
    F('Start i = 2: 3 → 3 ✓ (count 2).', a([1, 2, 3], { x: 'nums', w: [2, 2], h: '2g', p: '2:i' }), kvr([['count', 2]], { h: 'countg' }))
  ]);
  T(9, 1, () => [
    F('Map of prefix sums seen so far: {0: 1} (the empty prefix). sum = 0, count = 0.', a([1, 2, 3], { x: 'nums' }), kvr([['0', '×1']], { x: 'seen' })),
    F('i = 0: sum = 1. Need sum − k = 1 − 3 = −2 → not seen. Record 1.', a([1, 2, 3], { x: 'nums', h: '0y', p: '0:i' }), kvr([['0', '×1'], ['1', '×1']], { x: 'seen', h: '1y' }), kvr([['count', 0]])),
    F('i = 1: sum = 3. Need 3 − 3 = 0 → seen once → count = 1 (subarray [1, 2]). Record 3.', a([1, 2, 3], { x: 'nums', h: '0g,1g', p: '1:i' }), kvr([['0', '×1'], ['1', '×1'], ['3', '×1']], { x: 'seen', h: '0g' }), kvr([['count', 1]])),
    F('i = 2: sum = 6. Need 6 − 3 = 3 → seen once → count = 2 (subarray [3]).', a([1, 2, 3], { x: 'nums', h: '2g', p: '2:i' }), kvr([['0', '×1'], ['1', '×1'], ['3', '×1'], ['6', '×1']], { x: 'seen', h: '3g' }), kvr([['count', 2]], { h: 'countg' }))
  ]);

  /* 10 · Best Time to Buy and Sell Stock */
  const N10 = [7, 1, 5, 3, 6, 4];
  T(10, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 5; i++) {
      let bj = -1, bp = 0; for (let j = i + 1; j < 6; j++) if (N10[j] - N10[i] > bp) { bp = N10[j] - N10[i]; bj = j; }
      best = Math.max(best, bp);
      f.push(F(`Buy on day ${i} (${N10[i]}): try every later day. ${bj < 0 ? 'Nothing later is higher → profit 0.' : `Best sell is day ${bj} (${N10[bj]}) → ${bp}.`} Overall best = ${best}.`, a(N10, { x: 'price', i: 1, h: H({ [i]: 'y', [bj]: 'g' }), arc: bj < 0 ? undefined : [[i, bj, '+' + bp]] })));
    }
    return f;
  });
  T(10, 1, () => {
    let mn = Infinity, mi = 0, best = 0; const f = [];
    N10.forEach((p, i) => {
      if (p < mn) { mn = p; mi = i; f.push(F(`Day ${i} (${p}): the cheapest price so far → new min = ${p}. best = ${best}.`, a(N10, { x: 'price', i: 1, h: H({ [i]: 'b' }), p: P([i, 'min']) }), kvr([['min', mn], ['best', best]]))); return; }
      const pr = p - mn; best = Math.max(best, pr);
      f.push(F(`Day ${i} (${p}): sell today → ${p} − ${mn} = ${pr}. best = ${best}.`, a(N10, { x: 'price', i: 1, h: H({ [mi]: 'b', [i]: pr === best ? 'g' : 'y' }), arc: [[mi, i, '+' + pr]] }), kvr([['min', mn], ['best', best]])));
    });
    return f;
  });

  /* 11 · Valid Palindrome (on "Madam") */
  T(11, 0, () => [
    F('Clean: keep letters and digits, lowercase them → "madam".', a([...'Madam'], { x: 's' }), a([...'madam'], { x: 'clean', h: '0y' })),
    F('Reverse the clean string → "madam".', a([...'madam'], { x: 'clean' }), a([...'madam'], { x: 'reversed', h: '0b,1b,2b,3b,4b' })),
    F('Compare clean with reversed: every position matches → true.', a([...'madam'], { x: 'clean', h: '0g,1g,2g,3g,4g' }), a([...'madam'], { x: 'reversed', h: '0g,1g,2g,3g,4g' }))
  ]);
  T(11, 1, () => [
    F('l = 0 ("M"), r = 4 ("m"). Both are letters; lowercase both → m = m ✓. Step inward.', a([...'Madam'], { i: 1, h: '0y,4y', p: '0:l,4:r' })),
    F('l = 1 ("a"), r = 3 ("a") → a = a ✓. Step inward.', a([...'Madam'], { i: 1, h: '0g,4g,1y,3y', p: '1:l,3:r' })),
    F('l = 2, r = 2 → the pointers met. No mismatch was found → true.', a([...'Madam'], { i: 1, h: '0g,1g,2g,3g,4g', p: '2:l r' }))
  ]);

  /* 12 · Two Sum II */
  T(12, 0, () => [
    F('i = 0 (2). The inner loop tries every j after it.', a(N1, { i: 1, h: '0y', p: '0:i' })),
    F('i = 0, j = 1: 2 + 7 = 9 ✓ → return [1, 2] (1-indexed).', a(N1, { i: 1, h: '0g,1g', p: '0:i,1:j' }))
  ]);
  T(12, 1, () => [
    F('i = 0 (2): we need 9 − 2 = 7. Binary-search it in [1 … 3].', a(N1, { i: 1, h: '0y', p: '0:i,1:lo,3:hi' }), kvr([['need', 7]])),
    F('lo = 1, hi = 3 → mid = 2: 11 > 7 → hi = mid − 1 = 1.', a(N1, { i: 1, h: '0y,2r,3m', p: '0:i,2:mid' }), kvr([['need', 7]])),
    F('lo = 1, hi = 1 → mid = 1: 7 = 7 ✓ → return [1, 2] (1-indexed).', a(N1, { i: 1, h: '0g,1g,2m,3m', p: '0:i,1:mid' }))
  ]);
  T(12, 2, () => {
    let l = 0, r = 3; const f = [];
    while (l < r) {
      const sm = N1[l] + N1[r];
      if (sm === 9) { f.push(F(`l = ${l}, r = ${r}: ${N1[l]} + ${N1[r]} = 9 ✓ → return [${l + 1}, ${r + 1}] (1-indexed).`, a(N1, { i: 1, h: H({ [l]: 'g', [r]: 'g' }), p: P([l, 'l'], [r, 'r']) }))); break; }
      f.push(F(`l = ${l}, r = ${r}: ${N1[l]} + ${N1[r]} = ${sm} ${sm > 9 ? '> 9 → the right value is too big → r−−.' : '< 9 → l++.'}`, a(N1, { i: 1, h: H({ [l]: 'y', [r]: sm > 9 ? 'r' : 'y' }), p: P([l, 'l'], [r, 'r']) })));
      if (sm > 9) r--; else l++;
    }
    return f;
  });

  /* 13 · 3Sum */
  const N13 = [-1, 0, 1, 2, -1, -4];
  T(13, 0, () => {
    const found = [], f = [];
    for (let i = 0; i < 4; i++) {
      const hits = [], hh = { [i]: 'y' };
      for (let j = i + 1; j < 6; j++) for (let k = j + 1; k < 6; k++) if (N13[i] + N13[j] + N13[k] === 0) {
        const t = [N13[i], N13[j], N13[k]].sort((x, y) => x - y), key = L(t), dup = found.includes(key);
        hits.push(`(${sg(N13[i])}, ${sg(N13[j])}, ${sg(N13[k])}) → ${key}${dup ? ' already in the set' : ' new ✓'}`);
        if (!dup) found.push(key); hh[j] = hh[k] = 'g';
      }
      f.push(F(`i = ${i} (${sg(N13[i])}): try every j < k after it. ${hits.length ? 'Zero sums: ' + hits.join('; ') + '.' : 'No triple sums to 0.'}`, a(N13, { i: 1, h: H(hh), p: P([i, 'i']) }), kvr([['set', found.join(' ') || '{ }']])));
    }
    return f;
  });
  T(13, 1, () => {
    const found = [], f = [];
    for (let i = 0; i < 4; i++) {
      const seen = [], log = [], hh = { [i]: 'y' };
      for (let j = i + 1; j < 6; j++) {
        const need = -(N13[i] + N13[j]);
        if (seen.includes(need)) { const key = L([N13[i], N13[j], need].sort((x, y) => x - y)); log.push(`${sg(N13[j])}: need ${sg(need)} ✓ ${found.includes(key) ? '(dup)' : key}`); if (!found.includes(key)) found.push(key); hh[j] = 'g'; hh[N13.indexOf(need, i + 1)] = 'g'; }
        else log.push(`${sg(N13[j])}: need ${sg(need)} ✗`);
        seen.push(N13[j]);
      }
      f.push(F(`i = ${i} (${sg(N13[i])}): walk j with a set of the numbers in between. ${log.join(' · ')}.`, a(N13, { i: 1, h: H(hh), p: P([i, 'i']) }), kvr([['found', found.join(' ') || '{ }']])));
    }
    return f;
  });
  T(13, 2, () => {
    const v = [...N13].sort((x, y) => x - y), f = [F('Sort: [−4, −1, −1, 0, 1, 2]. Fix i, then squeeze l and r towards each other.', a(v, { x: 'sorted', i: 1 }))], res = [];
    for (let i = 0; i < 4; i++) {
      if (i > 0 && v[i] === v[i - 1]) { f.push(F(`i = ${i}: same value as i = ${i - 1} (${sg(v[i])}) → skip, or we would repeat triplets.`, a(v, { i: 1, h: H({ [i]: 'm' }), p: P([i, 'i']) }))); continue; }
      let l = i + 1, r = 5;
      while (l < r) {
        const sm = v[i] + v[l] + v[r];
        if (sm === 0) { res.push(L([v[i], v[l], v[r]])); f.push(F(`i = ${i}, l = ${l}, r = ${r}: ${sg(v[i])} + ${sg(v[l])} + ${sg(v[r])} = 0 ✓ → save ${res[res.length - 1]}. Move both pointers.`, a(v, { i: 1, h: H({ [i]: 'g', [l]: 'g', [r]: 'g' }), p: P([i, 'i'], [l, 'l'], [r, 'r']) }), kvr([['found', res.join(' ')]]))); l++; r--; while (l < r && v[l] === v[l - 1]) l++; }
        else { f.push(F(`i = ${i}, l = ${l}, r = ${r}: sum = ${sg(sm)} ${sm < 0 ? '< 0 → need bigger → l++.' : '> 0 → need smaller → r−−.'}`, a(v, { i: 1, h: H({ [i]: 'y', [l]: sm < 0 ? 'r' : 'y', [r]: sm > 0 ? 'r' : 'y' }), p: P([i, 'i'], [l, 'l'], [r, 'r']) }))); if (sm < 0) l++; else r--; }
      }
    }
    return f;
  });

  /* 14 · Container With Most Water */
  const N14 = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  T(14, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 8; i++) {
      let bj = i + 1, ba = 0; for (let j = i + 1; j < 9; j++) { const ar = (j - i) * Math.min(N14[i], N14[j]); if (ar > ba) { ba = ar; bj = j; } }
      best = Math.max(best, ba);
      f.push(F(`Left wall i = ${i} (${N14[i]}): try every right wall j. Best is j = ${bj}: width ${bj - i} × min(${N14[i]}, ${N14[bj]}) = ${ba}. Overall best = ${best}.`, b(N14, { p: P([i, 'i'], [bj, 'j']), rect: [i, bj, Math.min(N14[i], N14[bj])] })));
    }
    return f;
  });
  T(14, 1, () => {
    let l = 0, r = 8, best = 0; const f = [];
    while (l < r) {
      const h = Math.min(N14[l], N14[r]), ar = h * (r - l); best = Math.max(best, ar);
      const mv = N14[l] < N14[r] ? 'l' : 'r';
      f.push(F(`l = ${l} (${N14[l]}), r = ${r} (${N14[r]}): ${r - l} × ${h} = ${ar}. best = ${best}. The shorter wall (${mv}) can never do better → move it.`, b(N14, { p: P([l, 'l'], [r, 'r']), rect: [l, r, h], h: H({ [mv === 'l' ? l : r]: 'r' }) })));
      if (mv === 'l') l++; else r--;
    }
    return f;
  });

  /* 15 · Trapping Rain Water */
  const H15 = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  const Lm = H15.map((_, i) => Math.max(...H15.slice(0, i + 1))), Rm = H15.map((_, i) => Math.max(...H15.slice(i)));
  const Wt = H15.map((h, i) => Math.min(Lm[i], Rm[i]) - h);
  T(15, 0, () => {
    const wat = H15.map(() => 0), f = []; let tot = 0;
    H15.forEach((h, i) => {
      wat[i] = Wt[i]; tot += Wt[i];
      const li = H15.indexOf(Lm[i]), ri = i + H15.slice(i).indexOf(Rm[i]);
      f.push(F(`Bar ${i} (h ${h}): scan left → tallest ${Lm[i]}, scan right → tallest ${Rm[i]}. Water = min(${Lm[i]}, ${Rm[i]}) − ${h} = ${Wt[i]}. Total = ${tot}.`, b(H15, { p: P([i, 'i']), h: H({ [li]: 'y', [ri]: 'y' }), water: wat.slice() })));
    });
    return f;
  });
  T(15, 1, () => {
    const f = [
      F('Left pass: L[i] = tallest bar from 0 to i.', a(H15, { x: 'height' }), a(Lm, { x: 'L', h: '1y,3y,7y' })),
      F('Right pass: R[i] = tallest bar from i to the end.', a(H15, { x: 'height' }), a(Rm, { x: 'R', h: '7y,8y,10y,11y' }))
    ];
    const wat = H15.map(() => 0); let tot = 0;
    H15.forEach((h, i) => { if (!Wt[i]) return; wat[i] = Wt[i]; tot += Wt[i]; f.push(F(`i = ${i}: min(L ${Lm[i]}, R ${Rm[i]}) − h ${h} = ${Wt[i]}. Total = ${tot}. (Bars with 0 water are skipped here.)`, b(H15, { p: P([i, 'i']), water: wat.slice() }))); });
    return f;
  });
  T(15, 2, () => {
    let l = 0, r = 11, lm = 0, rm = 0, tot = 0; const wat = H15.map(() => 0), f = [];
    while (l < r) {
      if (H15[l] < H15[r]) {
        let msg; if (H15[l] >= lm) { lm = H15[l]; msg = `h ${H15[l]} ≥ leftMax → leftMax = ${lm}, no water`; } else { const w = lm - H15[l]; wat[l] = w; tot += w; msg = `water = leftMax ${lm} − ${H15[l]} = ${w}`; }
        f.push(F(`h[l] ${H15[l]} < h[r] ${H15[r]} → work on the left (the right side is guaranteed taller). l = ${l}: ${msg}. Total = ${tot}.`, b(H15, { p: P([l, 'l'], [r, 'r']), h: H({ [l]: 'y' }), water: wat.slice() }))); l++;
      } else {
        let msg; if (H15[r] >= rm) { rm = H15[r]; msg = `h ${H15[r]} ≥ rightMax → rightMax = ${rm}, no water`; } else { const w = rm - H15[r]; wat[r] = w; tot += w; msg = `water = rightMax ${rm} − ${H15[r]} = ${w}`; }
        f.push(F(`h[l] ${H15[l]} ≥ h[r] ${H15[r]} → work on the right. r = ${r}: ${msg}. Total = ${tot}.`, b(H15, { p: P([l, 'l'], [r, 'r']), h: H({ [r]: 'y' }), water: wat.slice() }))); r--;
      }
    }
    return f;
  });

  /* 16 · Sort Colors */
  const N16 = [2, 0, 2, 1, 1, 0];
  T(16, 0, () => [
    F('Call sort() on the whole array.', a(N16, { x: 'nums' })),
    F('Sorted → [0, 0, 1, 1, 2, 2].', a([0, 0, 1, 1, 2, 2], { x: 'nums', h: '0g,1g,2g,3g,4g,5g' }))
  ]);
  T(16, 1, () => {
    const c = [0, 0, 0], f = [];
    N16.forEach((v, i) => { c[v]++; f.push(F(`Pass 1, i = ${i}: colour ${v} → count[${v}] = ${c[v]}.`, a(N16, { x: 'nums', i: 1, h: H(range(0, i - 1, 'g', { [i]: 'y' })) }), kvr(c.map((x, k) => [k, '×' + x]), { x: 'count', h: v + 'y' }))); });
    f.push(F('Pass 2: write two 0s …', a([0, 0, '·', '·', '·', '·'], { x: 'nums', h: '0y,1y' })));
    f.push(F('… then two 1s, then two 2s → sorted.', a([0, 0, 1, 1, 2, 2], { x: 'nums', h: '0g,1g,2g,3g,4g,5g' })));
    return f;
  });
  T(16, 2, () => {
    const v = N16.slice(), f = []; let lo = 0, mid = 0, hi = 5;
    f.push(F('lo = 0 (next slot for 0), mid = 0 (scanner), hi = 5 (next slot for 2).', a(v.slice(), { i: 1, p: P([lo, 'lo'], [mid, 'mid'], [hi, 'hi']) })));
    while (mid <= hi) {
      const x = v[mid]; let msg;
      if (x === 0) { [v[lo], v[mid]] = [v[mid], v[lo]]; msg = `nums[mid] = 0 → swap with lo, then lo++ and mid++.`; lo++; mid++; }
      else if (x === 1) { msg = 'nums[mid] = 1 → already in the middle → mid++.'; mid++; }
      else { [v[mid], v[hi]] = [v[hi], v[mid]]; msg = 'nums[mid] = 2 → swap with hi, hi−− (mid stays: the new value is unchecked).'; hi--; }
      const hh = {}; for (let k = 0; k < lo; k++) hh[k] = 'r'; for (let k = hi + 1; k < 6; k++) hh[k] = 'b';
      f.push(F(msg, a(v.slice(), { i: 1, h: H(hh), p: P([lo, 'lo'], [mid, 'mid'], [hi, 'hi']) })));
    }
    f.push(F('mid passed hi → done: [0, 0, 1, 1, 2, 2].', a(v, { h: '0g,1g,2g,3g,4g,5g' })));
    return f;
  });

  /* 17 · Longest Substring Without Repeating */
  const S17 = [...'abcabcbb'];
  T(17, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 8; i++) {
      const seen = new Set(); let j = i; while (j < 8 && !seen.has(S17[j])) { seen.add(S17[j]); j++; }
      best = Math.max(best, j - i);
      f.push(F(`Start i = ${i}: add letters while they are new → "${S17.slice(i, j).join('')}"${j < 8 ? `, then "${S17[j]}" repeats` : ' (end of string)'} → length ${j - i}. best = ${best}.`, a(S17, { i: 1, w: [i, j - 1], h: H({ [j]: j < 8 ? 'r' : '' }), p: P([i, 'i']) })));
    }
    return f;
  });
  T(17, 1, () => {
    const set = [], f = []; let l = 0, best = 0;
    S17.forEach((ch, r) => {
      const rem = []; while (set.includes(ch)) { rem.push(S17[l]); set.splice(set.indexOf(S17[l]), 1); l++; }
      set.push(ch); best = Math.max(best, r - l + 1);
      f.push(F(`r = ${r} ("${ch}"): ${rem.length ? `"${ch}" is already in the set → remove ${rem.map(x => '"' + x + '"').join(', ')} from the left (l = ${l}), then add it` : 'new letter → add it'}. Window length ${r - l + 1}, best = ${best}.`, a(S17, { i: 1, w: [l, r], h: H({ [r]: rem.length ? 'y' : 'g' }), p: P([l, 'l'], [r, 'r']) }), kvr([['set', set.join(' ')]])));
    });
    return f;
  });
  T(17, 2, () => {
    const last = {}, f = []; let l = 0, best = 0;
    S17.forEach((ch, r) => {
      const jump = last[ch] !== undefined && last[ch] >= l, old = last[ch];
      if (jump) l = last[ch] + 1;
      last[ch] = r; best = Math.max(best, r - l + 1);
      f.push(F(`r = ${r} ("${ch}"): ${jump ? `last seen at ${old}, inside the window → jump l to ${old} + 1 = ${l}` : 'not inside the window'}. last["${ch}"] = ${r}. Length ${r - l + 1}, best = ${best}.`, a(S17, { i: 1, w: [l, r], h: H({ [r]: 'y', [jump ? old : -1]: 'r' }), p: P([l, 'l'], [r, 'r']) }), kvr(Object.entries(last), { x: 'last', h: ch + 'y' })));
    });
    return f;
  });

  /* 18 · Longest Repeating Character Replacement */
  const S18 = [...'AABABBA'];
  T(18, 0, () => {
    let best = 0; const f = [];
    for (let i = 0; i < 7; i++) {
      const c = {}; let mx = 0, j = i, end = i - 1;
      for (; j < 7; j++) { c[S18[j]] = (c[S18[j]] || 0) + 1; mx = Math.max(mx, c[S18[j]]); if (j - i + 1 - mx <= 1) end = j; else break; }
      best = Math.max(best, end - i + 1);
      f.push(F(`Start i = ${i}: extend while (length − most common count) ≤ k = 1 → "${S18.slice(i, end + 1).join('')}" (length ${end - i + 1})${j < 7 ? `; adding "${S18[j]}" would need 2 repaints` : ''}. best = ${best}.`, a(S18, { i: 1, w: [i, end], h: H({ [j < 7 ? j : -1]: 'r' }), p: P([i, 'i']) })));
    }
    return f;
  });
  T(18, 1, () => {
    const c = { A: 0, B: 0 }, f = []; let l = 0, mx = 0, best = 0;
    S18.forEach((ch, r) => {
      c[ch]++; mx = Math.max(mx, c[ch]);
      let msg = `add "${ch}" → counts A ${c.A}, B ${c.B}, maxFreq ${mx}. Repaints needed = ${r - l + 1} − ${mx} = ${r - l + 1 - mx}`;
      if (r - l + 1 - mx > 1) { c[S18[l]]--; msg += ` > k → drop "${S18[l]}" from the left`; l++; }
      best = Math.max(best, r - l + 1);
      f.push(F(`r = ${r}: ${msg}. Window ${r - l + 1}, best = ${best}.`, a(S18, { i: 1, w: [l, r], h: H({ [r]: 'y' }), p: P([l, 'l'], [r, 'r']) }), kvr([['A', c.A], ['B', c.B], ['best', best]])));
    });
    return f;
  });

  /* 19 · Permutation in String */
  const S19 = [...'eidbaooo'];
  T(19, 0, () => {
    const f = [];
    for (let i = 0; i + 1 < 8; i++) {
      const w = S19.slice(i, i + 2), sw = [...w].sort().join(''), ok = sw === 'ab';
      f.push(F(`Window "${w.join('')}" → sorted "${sw}" ${ok ? '= "ab" ✓ → true.' : '≠ "ab" → slide.'}`, a(S19, { i: 1, w: [i, i + 1], h: H({ [i]: ok ? 'g' : 'r', [i + 1]: ok ? 'g' : 'r' }) })));
      if (ok) break;
    }
    return f;
  });
  const win19 = (best) => () => {
    const f = [], c = { a: 0, b: 0 };
    for (let r = 0; r < 8; r++) {
      if (c[S19[r]] !== undefined) c[S19[r]]++;
      const l = r - 1; if (l >= 1 && c[S19[l - 1]] !== undefined) c[S19[l - 1]]--;
      if (r < 1) continue;
      const lo = r - 1, ok = c.a === 1 && c.b === 1;
      const matches = (c.a === 1 ? 1 : 0) + (c.b === 1 ? 1 : 0);
      const cap = best
        ? `Window "${S19[lo]}${S19[r]}": add "${S19[r]}"${lo > 0 ? `, drop "${S19[lo - 1]}"` : ''}. Only the touched letters change, so "matches" is updated in O(1): ${matches + 24} / 26 letters agree.${ok ? ' 26 / 26 → true.' : ''}`
        : `Window "${S19[lo]}${S19[r]}": add "${S19[r]}"${lo > 0 ? `, drop "${S19[lo - 1]}"` : ''}. Compare all 26 counts with s1: a ${c.a} vs 1, b ${c.b} vs 1 → ${ok ? 'equal ✓ → true.' : 'different.'}`;
      f.push(F(cap, a(S19, { i: 1, w: [lo, r], h: H({ [lo]: ok ? 'g' : '', [r]: ok ? 'g' : 'y' }) }), kvr([['a', c.a + ' | 1'], ['b', c.b + ' | 1']], { x: 'win | s1', h: (c.a === 1 ? 'ag,' : '') + (c.b === 1 ? 'bg' : '') })));
      if (ok) break;
    }
    return f;
  };
  T(19, 1, win19(false));
  T(19, 2, win19(true));

  /* 20 · Minimum Window Substring */
  const S20 = [...'ADOBECODEBANC'];
  T(20, 0, () => {
    let best = '', bi = -1, bj = -1; const f = [];
    for (let i = 0; i < 13; i++) {
      const need = new Set(['A', 'B', 'C']); let j = i;
      for (; j < 13; j++) { need.delete(S20[j]); if (!need.size) break; }
      if (j < 13 && (!best || j - i + 1 < best.length)) { best = S20.slice(i, j + 1).join(''); bi = i; bj = j; }
      f.push(F(`Start i = ${i}: ${j < 13 ? `extend until A, B, C are all inside → "${S20.slice(i, j + 1).join('')}" (${j - i + 1})` : 'reaching the end never covers A, B and C'}. Shortest so far: "${best || '—'}".`, a(S20, { i: 1, w: j < 13 ? [i, j] : undefined, h: H(bi >= 0 ? range(bi, bj, 'g') : {}), p: P([i, 'i']) })));
    }
    return f;
  });
  T(20, 1, () => {
    const need = { A: 1, B: 1, C: 1 }, have = {}, f = []; let l = 0, formed = 0, best = '', bi = -1, bj = -1;
    S20.forEach((ch, r) => {
      const notes = [];
      if (need[ch]) { have[ch] = (have[ch] || 0) + 1; if (have[ch] === need[ch]) { formed++; notes.push(`"${ch}" satisfied (${formed}/3)`); } }
      while (formed === 3) {
        if (!best || r - l + 1 < best.length) { best = S20.slice(l, r + 1).join(''); bi = l; bj = r; notes.push(`valid "${best}" → new best`); }
        const lc = S20[l]; if (need[lc]) { have[lc]--; if (have[lc] < need[lc]) { formed--; notes.push(`shrink: dropping "${lc}" breaks it`); } }
        l++;
      }
      f.push(F(`r = ${r} ("${ch}"): ${notes.length ? notes.join('; ') : 'still missing ' + ['A', 'B', 'C'].filter(x => !(have[x] >= 1)).join(', ')}. Best: "${best || '—'}".`, a(S20, { i: 1, w: [l, r], h: H(bi >= 0 ? range(bi, bj, 'g', { [r]: 'y' }) : { [r]: 'y' }), p: P([l, 'l'], [r, 'r']) })));
    });
    return f;
  });

  VIZ.DRY = VIZ.DRY || {};
  Object.keys(X).forEach(id => { VIZ.DRY[id] = Object.assign(VIZ.DRY[id] || {}, X[id]); });
})();
