/* Full dry runs, problems 61-80. */
(function () {
  const { a, s, kvr, n, l, tr, g, gr, m, F } = VIZ.h;
  const X = {};
  const T = (id, si, fn) => { (X[id] = X[id] || {})[si] = fn(); };
  const H = o => Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + v).join(',');
  const range = (lo, hi, cls, o = {}) => { for (let i = lo; i <= hi; i++) o[i] = cls; return o; };
  const D = '·';

  /* 61 · Course Schedule II */
  const E61 = [[0, 1, '', '', 1], [0, 2, '', '', 1], [1, 3, '', '', 1], [2, 3, '', '', 1]];
  const G61 = (k, lab) => gr([0, 1, 2, 3].map((i, j) => [i, [40, 150, 150, 270][j], [58, 30, 92, 58][j], k[i] || '', lab[i] || '']), E61, { H: 112 });
  T(61, 0, () => [
    F('dfs(0) → dfs(1) → dfs(3). Course 3 has nothing after it → it finishes 1st.', G61({ 0: 'y', 1: 'y', 3: 'g' }, { 3: 'done 1st' }), a([3], { x: 'finish' })),
    F('Back in dfs(1): all its edges are done → 1 finishes 2nd.', G61({ 0: 'y', 1: 'g', 3: 'g' }, { 1: 'done 2nd', 3: 'done 1st' }), a([3, 1], { x: 'finish' })),
    F('dfs(2): its edge leads to 3, already done → 2 finishes 3rd.', G61({ 0: 'y', 1: 'g', 2: 'g', 3: 'g' }, { 1: 'done 2nd', 2: 'done 3rd', 3: 'done 1st' }), a([3, 1, 2], { x: 'finish' })),
    F('Back in dfs(0) → 0 finishes 4th. Finish order 3, 1, 2, 0.', G61({ 0: 'g', 1: 'g', 2: 'g', 3: 'g' }, { 0: 'done 4th', 1: 'done 2nd', 2: 'done 3rd', 3: 'done 1st' }), a([3, 1, 2, 0], { x: 'finish' })),
    F('Reverse it → [0, 2, 1, 3]: every course comes after its prerequisites.', a([0, 2, 1, 3], { x: 'order', h: '0g,1g,2g,3g' }))
  ]);
  T(61, 1, () => [
    F('Indegrees: 0 → 0, 1 → 1, 2 → 1, 3 → 2. Queue = [0].', G61({ 0: 'y' }, { 0: 'in 0', 1: 'in 1', 2: 'in 1', 3: 'in 2' }), a([0], { x: 'queue' })),
    F('Pop 0 → order [0]. Lower 1 and 2 to 0 → queue them.', G61({ 0: 'g', 1: 'y', 2: 'y' }, { 0: '1st', 1: 'in 0', 2: 'in 0', 3: 'in 2' }), a([1, 2], { x: 'queue' }), a([0], { x: 'order' })),
    F('Pop 1 → order [0, 1]. 3 drops to indegree 1.', G61({ 0: 'g', 1: 'g', 2: 'y' }, { 0: '1st', 1: '2nd', 2: 'in 0', 3: 'in 1' }), a([2], { x: 'queue' }), a([0, 1], { x: 'order' })),
    F('Pop 2 → order [0, 1, 2]. 3 drops to 0 → queue it.', G61({ 0: 'g', 1: 'g', 2: 'g', 3: 'y' }, { 0: '1st', 1: '2nd', 2: '3rd', 3: 'in 0' }), a([3], { x: 'queue' }), a([0, 1, 2], { x: 'order' })),
    F('Pop 3 → order [0, 1, 2, 3]. 4 popped = n → valid order.', G61({ 0: 'g', 1: 'g', 2: 'g', 3: 'g' }, { 0: '1st', 1: '2nd', 2: '3rd', 3: '4th' }), a([0, 1, 2, 3], { x: 'order', h: '0g,1g,2g,3g' }))
  ]);

  /* 62 · Network Delay Time */
  const G62 = (k, lab, ek = {}) => gr([[2, 50, 60, k[2] || '', lab[2]], [1, 160, 30, k[1] || '', lab[1]], [3, 160, 92, k[3] || '', lab[3]], [4, 280, 92, k[4] || '', lab[4]]], [[2, 1, 1, ek['21'] || '', 1], [2, 3, 1, ek['23'] || '', 1], [3, 4, 1, ek['34'] || '', 1]], { H: 112 });
  T(62, 0, () => [
    F('dist: node 2 = 0, everything else ∞. Relax all edges n − 1 = 3 times.', G62({ 2: 'g' }, { 2: '0', 1: '∞', 3: '∞', 4: '∞' })),
    F('Round 1, edge 2 → 1 (1): 0 + 1 < ∞ → dist[1] = 1.', G62({ 2: 'g', 1: 'y' }, { 2: '0', 1: '1', 3: '∞', 4: '∞' }, { 21: 'g' })),
    F('Round 1, edge 2 → 3 (1): dist[3] = 1.', G62({ 2: 'g', 1: 'g', 3: 'y' }, { 2: '0', 1: '1', 3: '1', 4: '∞' }, { 23: 'g' })),
    F('Round 1, edge 3 → 4 (1): 1 + 1 = 2 → dist[4] = 2.', G62({ 2: 'g', 1: 'g', 3: 'g', 4: 'y' }, { 2: '0', 1: '1', 3: '1', 4: '2' }, { 34: 'g' })),
    F('Rounds 2 and 3: no edge improves anything. No ∞ left → answer = max dist = 2.', G62({ 2: 'g', 1: 'g', 3: 'g', 4: 'g' }, { 2: '0', 1: '1', 3: '1', 4: '2' }))
  ]);
  T(62, 1, () => [
    F('Heap = {(0, node 2)}. dist[2] = 0.', G62({ 2: 'y' }, { 2: '0', 1: '∞', 3: '∞', 4: '∞' }), s(['0:2'], { x: 'heap' })),
    F('Pop (0, 2). Relax 2 → 1 and 2 → 3: both become 1 → push them.', G62({ 2: 'g', 1: 'y', 3: 'y' }, { 2: '0', 1: '1', 3: '1', 4: '∞' }, { 21: 'g', 23: 'g' }), s(['1:3', '1:1'], { x: 'heap' })),
    F('Pop (1, 1): no outgoing edges.', G62({ 2: 'g', 1: 'g', 3: 'y' }, { 2: '0', 1: '1', 3: '1', 4: '∞' }), s(['1:3'], { x: 'heap' })),
    F('Pop (1, 3): relax 3 → 4 → 1 + 1 = 2 → push (2, 4).', G62({ 2: 'g', 1: 'g', 3: 'g', 4: 'y' }, { 2: '0', 1: '1', 3: '1', 4: '2' }, { 34: 'g' }), s(['2:4'], { x: 'heap' })),
    F('Pop (2, 4): no edges. Heap empty. Last node to hear it is 4 at time 2.', G62({ 2: 'g', 1: 'g', 3: 'g', 4: 'g' }, { 2: '0', 1: '1', 3: '1', 4: '2' }), kvr([['answer', 2]], { h: 'answerg' }))
  ]);

  /* 63 · Word Ladder */
  const E63 = [['hit', 'hot'], ['hot', 'dot'], ['hot', 'lot'], ['dot', 'dog'], ['lot', 'log'], ['dog', 'cog'], ['log', 'cog'], ['dot', 'lot'], ['dog', 'log']];
  const W63 = (k, lab = {}) => gr([['hit', 28, 62], ['hot', 92, 62], ['dot', 158, 30], ['lot', 158, 94], ['dog', 224, 30], ['log', 224, 94], ['cog', 300, 62]].map(([id, x, y]) => [id, x, y, k[id] || '', lab[id] || '']), E63, { H: 114 });
  const lvl = (how) => [
    F(`Level 1: queue = [hit]. Find its neighbours ${how}: only "hot".`, W63({ hit: 'y', hot: 'b' }, { hit: '1' }), a(['hot'], { x: 'queue' })),
    F(`Level 2: pop "hot" → neighbours ${how}: "dot", "lot" (unused).`, W63({ hit: 'g', hot: 'y', dot: 'b', lot: 'b' }, { hit: '1', hot: '2' }), a(['dot', 'lot'], { x: 'queue' })),
    F('Level 3: pop "dot" → "dog"; pop "lot" → "log" ("dot"/"lot" are already used).', W63({ hit: 'g', hot: 'g', dot: 'y', lot: 'y', dog: 'b', log: 'b' }, { hit: '1', hot: '2', dot: '3', lot: '3' }), a(['dog', 'log'], { x: 'queue' })),
    F('Level 4: pop "dog" → its neighbour "cog" is the end word → it sits on level 5.', W63({ hit: 'g', hot: 'g', dot: 'g', lot: 'g', dog: 'y', log: 'm', cog: 'g' }, { hit: '1', hot: '2', dot: '3', lot: '3', dog: '4', cog: '5' })),
    F('Shortest chain: hit → hot → dot → dog → cog = 5 words.', W63({ hit: 'g', hot: 'g', dot: 'g', dog: 'g', cog: 'g' }, { hit: '1', hot: '2', dot: '3', dog: '4', cog: '5' }))
  ];
  T(63, 0, () => lvl('by comparing it with EVERY dictionary word'));
  T(63, 1, () => lvl('by trying a–z at each of the 3 positions (h?t, ?it, hi? …) and checking the set'));
  T(63, 2, () => [
    F('front = {hit}, back = {cog}, length 1. Sizes equal → expand front: hit → {hot}. length 2.', W63({ hit: 'y', hot: 'y', cog: 'b' })),
    F('front {hot} (1) vs back {cog} (1) → expand front: hot → {dot, lot}. length 3.', W63({ hit: 'g', hot: 'g', dot: 'y', lot: 'y', cog: 'b' })),
    F('front {dot, lot} (2) > back {cog} (1) → swap and expand the smaller side: cog → {dog, log}. length 4.', W63({ hit: 'g', hot: 'g', dot: 'y', lot: 'y', cog: 'b', dog: 'b', log: 'b' })),
    F('Expand {dog, log}: "dog" → "dot" is in the other frontier → they meet! Answer = 4 + 1 = 5.', W63({ hit: 'g', hot: 'g', dot: 'g', dog: 'g', cog: 'g', lot: 'm', log: 'm' }))
  ]);

  /* 64 · Cheapest Flights Within K Stops */
  const E64 = (ek = {}) => [[0, 1, 100, ek['01'] || '', 1], [1, 2, 100, ek['12'] || '', 1], [2, 0, 100, ek['20'] || '', 1], [1, 3, 600, ek['13'] || '', 1], [2, 3, 200, ek['23'] || '', 1]];
  const G64 = (k, lab, ek) => gr([[0, 40, 62, k[0] || '', lab[0]], [1, 150, 30, k[1] || '', lab[1]], [2, 190, 104, k[2] || '', lab[2]], [3, 300, 62, k[3] || '', lab[3]]], E64(ek), { H: 126 });
  T(64, 0, () => [
    F('d = [0, ∞, ∞, ∞]. k = 1 stop → run k + 1 = 2 rounds; each round reads the OLD d (a copy), so it adds at most one flight.', G64({ 0: 'g' }, ['0', '∞', '∞', '∞'])),
    F('Round 1: only 0 → 1 can be relaxed (0 + 100). d = [0, 100, ∞, ∞].', G64({ 0: 'g', 1: 'y' }, ['0', '100', '∞', '∞'], { '01': 'g' })),
    F('Round 2 (from old d): 1 → 2 = 200, 1 → 3 = 700. 2 → 3 uses old d[2] = ∞ → skipped.', G64({ 0: 'g', 1: 'g', 2: 'y', 3: 'y' }, ['0', '100', '200', '700'], { '12': 'g', '13': 'g', '23': 'm' })),
    F('Rounds used up. d[3] = 700 (0 → 1 → 3). The cheaper 400 route needs 2 stops → not allowed.', G64({ 0: 'g', 1: 'g', 3: 'g' }, ['0', '100', '200', '700'], { '01': 'g', '13': 'g' }))
  ]);
  T(64, 1, () => [
    F('Heap = {(cost 0, city 0, 0 flights)}.', G64({ 0: 'y' }, ['0', '', '', '']), s(['0·c0·0'], { x: 'heap' })),
    F('Pop (0, 0, 0). Fly to 1 → push (100, 1, 1 flight).', G64({ 0: 'g', 1: 'y' }, ['0', '100', '', ''], { '01': 'g' }), s(['100·c1·1'], { x: 'heap' })),
    F('Pop (100, 1, 1). Fly to 2 → (200, 2, 2) and to 3 → (700, 3, 2).', G64({ 0: 'g', 1: 'g', 2: 'y', 3: 'y' }, ['0', '100', '200', '700'], { '12': 'g', '13': 'g' }), s(['700·c3·2', '200·c2·2'], { x: 'heap' })),
    F('Pop (200, 2, 2): already 2 flights = k + 1 → it cannot fly on to 3 → skip.', G64({ 0: 'g', 1: 'g', 2: 'r', 3: 'y' }, ['0', '100', '200', '700'], { '23': 'r' }), s(['700·c3·2'], { x: 'heap' })),
    F('Pop (700, 3, 2): it is the destination → the first pop of dst is the cheapest valid → 700.', G64({ 0: 'g', 1: 'g', 3: 'g' }, ['0', '100', '', '700'], { '01': 'g', '13': 'g' }), kvr([['answer', 700]], { h: 'answerg' }))
  ]);

  /* 65 · Subsets of [1, 2] */
  const T65 = ['{ }', '{1}', '{ }', '{1,2}', '{1}', '{2}', '{ }'];
  const L65 = { 1: 'take 1', 2: 'skip 1', 3: 'take 2', 4: 'skip 2', 5: 'take 2', 6: 'skip 2' };
  T(65, 0, () => [
    F('bt(0) with cur = { }. First choice: take 1 → cur = {1}.', tr(T65, { lab: L65, h: '0y,1y' })),
    F('bt(1) with {1}: take 2 → {1,2}. Index 2 = end → save {1,2}. Undo 2.', tr(T65, { lab: L65, h: '0y,1y,3g' }), a(['{1,2}'], { x: 'saved' })),
    F('Skip 2 → end → save {1}. Undo 1.', tr(T65, { lab: L65, h: '0y,1y,3g,4g' }), a(['{1,2}', '{1}'], { x: 'saved' })),
    F('Skip 1 → cur = { }. Take 2 → save {2}.', tr(T65, { lab: L65, h: '0y,2y,3g,4g,5g' }), a(['{1,2}', '{1}', '{2}'], { x: 'saved' })),
    F('Skip 2 → save { }. All 2² = 4 leaves visited.', tr(T65, { lab: L65, h: '3g,4g,5g,6g' }), a(['{1,2}', '{1}', '{2}', '{ }'], { x: 'saved', h: '0g,1g,2g,3g' }))
  ]);
  T(65, 1, () => [
    F('Start with one subset: the empty set.', a(['{ }'], { x: 'result' })),
    F('x = 1: copy every existing subset and add 1 → { } gives {1}.', a(['{ }', '{1}'], { x: 'result', h: '1y' })),
    F('x = 2: copy { } and {1}, add 2 → {2}, {1,2}. Done: 4 subsets.', a(['{ }', '{1}', '{2}', '{1,2}'], { x: 'result', h: '2y,3y' }))
  ]);
  T(65, 2, () => {
    const f = [];
    for (let mk = 0; mk < 4; mk++) {
      const sub = [1, 2].filter((_, i) => mk >> i & 1), bits = (mk >> 1 & 1) + '' + (mk & 1);
      f.push(F(`mask ${mk} = ${bits} (bit 0 → 1, bit 1 → 2) → {${sub.join(',')}}.`, a([...bits], { x: 'mask', il: ['bit1 (2)', 'bit0 (1)'], h: H({ 0: bits[0] === '1' ? 'g' : '', 1: bits[1] === '1' ? 'g' : '' }) }), kvr([['subset', `{${sub.join(',') || ' '}}`]])));
    }
    return f;
  });

  /* 66 · Permutations */
  T(66, 0, () => {
    const f = [], res = [], path = [], used = [0, 0, 0], v = [1, 2, 3];
    const bt = () => {
      if (path.length === 3) { res.push(path.join('')); f.push(F(`All 3 chairs filled → save ${path.join(' ')}. Unmark and try the next unused number.`, a(path.slice(), { x: 'path', h: '0g,1g,2g' }), a(v, { x: 'used', h: H(Object.fromEntries(used.map((u, i) => [i, u ? 'm' : '']))) }), kvr([['saved', res.join(' ')]]))); return; }
      for (let i = 0; i < 3; i++) if (!used[i]) { used[i] = 1; path.push(v[i]); bt(); path.pop(); used[i] = 0; }
    };
    bt();
    return f;
  });
  T(66, 1, () => {
    const f = [], arr = [1, 2, 3], res = [];
    const go = (i) => {
      if (i === 3) { res.push(arr.join('')); f.push(F(`i = 3 → save ${arr.join(' ')}.`, a(arr.slice(), { h: '0g,1g,2g' }), kvr([['saved', res.join(' ')]]))); return; }
      for (let j = i; j < 3; j++) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (i < 2 && j !== i) f.push(F(`Position ${i}: swap index ${j} into it → ${arr.join(' ')}. Recurse on ${i + 1}.`, a(arr.slice(), { i: 1, h: H({ [i]: 'y', [j]: 'b' }), p: `${i}:i` })));
        go(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };
    f.push(F('Start with [1, 2, 3]. Position i takes each index j ≥ i in turn (j = i means "keep it"), then recurses on i + 1.', a([1, 2, 3], { i: 1, p: '0:i' })));
    go(0);
    return f;
  });

  /* 67 · Combination Sum */
  T(67, 0, () => [
    F('bt(0, 7): take 2 again and again → 2+2+2 = 6, rem 1. Trying 2, 3, 6, 7 all overshoot (rem < 0) → 4 dead ends.', a([2, 3, 6, 7], { x: 'coins', h: '0y' }), a([2, 2, 2], { x: 'path' }), kvr([['rem', 1]])),
    F('Back to 2+2 (rem 3): try 3 → rem 0 ✓ save [2, 2, 3]. Try 6, 7 → overshoot.', a([2, 3, 6, 7], { x: 'coins', h: '1g' }), a([2, 2, 3], { x: 'path', h: '0g,1g,2g' }), kvr([['found', '[2,2,3]']])),
    F('2+3 (rem 2): 3, 6, 7 all overshoot. 2+6, 2+7 overshoot.', a([2, 3, 6, 7], { x: 'coins', h: '1r,2r,3r' }), a([2, 3], { x: 'path' }), kvr([['found', '[2,2,3]']])),
    F('Start with 3 (rem 4): 3+3 (rem 1) → 3, 6, 7 overshoot; 3+6, 3+7 overshoot.', a([2, 3, 6, 7], { x: 'coins', h: '0m,1y' }), a([3, 3], { x: 'path' }), kvr([['found', '[2,2,3]']])),
    F('Start with 6 (rem 1): 6+6, 6+7 overshoot.', a([2, 3, 6, 7], { x: 'coins', h: '0m,1m,2y' }), a([6], { x: 'path' }), kvr([['found', '[2,2,3]']])),
    F('Start with 7 → rem 0 ✓ save [7]. 20 leaves explored in total, 18 of them dead ends.', a([2, 3, 6, 7], { x: 'coins', h: '0m,1m,2m,3g' }), a([7], { x: 'path', h: '0g' }), kvr([['found', '[2,2,3] [7]']], { h: 'foundg' }))
  ]);
  T(67, 1, () => [
    F('Sort the coins (already sorted). 2+2+2 → rem 1; next coin 2 > 1 → BREAK the loop (bigger coins are worse).', a([2, 3, 6, 7], { x: 'coins', h: '0r' }), a([2, 2, 2], { x: 'path' }), kvr([['rem', 1]])),
    F('2+2 → rem 3: take 3 → rem 0 ✓ save [2, 2, 3]. Next coin 6 > 3 → break.', a([2, 3, 6, 7], { x: 'coins', h: '1g,2r' }), a([2, 2, 3], { x: 'path', h: '0g,1g,2g' })),
    F('2+3 → rem 2: next coin 3 > 2 → break. Back at 2 (rem 5): 6 > 5 → break.', a([2, 3, 6, 7], { x: 'coins', h: '1r,2r' }), a([2, 3], { x: 'path' })),
    F('3+3 → rem 1: 3 > 1 → break. Back at 3 (rem 4): 6 > 4 → break.', a([2, 3, 6, 7], { x: 'coins', h: '1r,2r' }), a([3, 3], { x: 'path' })),
    F('6 → rem 1: 6 > 1 → break. 7 → rem 0 ✓ save [7]. Only 9 stops instead of 20.', a([2, 3, 6, 7], { x: 'coins', h: '3g' }), a([7], { x: 'path', h: '0g' }), kvr([['found', '[2,2,3] [7]']], { h: 'foundg' }))
  ]);

  /* 68 · Word Search */
  const B68 = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];
  const walk = (cells, word, cap) => cells.map((_, k) => F(cap(k), g(B68, { h: cells.slice(0, k + 1).map(([r, c], j) => `${r}.${c}${j === k ? 'y' : 'g'}`).join(',') }), a([...word], { x: 'word', h: H(range(0, k - 1, 'g', { [k]: 'y' })) })));
  T(68, 0, () => {
    const cells = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1]];
    const caps = ['Start at (0,0) = "A" = word[0] ✓. Mark it # (in use).', '"B" needed: down (1,0) = S ✗ … right (0,1) = B ✓.', '"C" needed: down (1,1) = F ✗ … right (0,2) = C ✓.', '"C" needed: down (1,2) = C ✓.', '"E" needed: down (2,2) = E ✓.', '"D" needed: up is in use, right (2,3) = E ✗, left (2,1) = D ✓.'];
    const f = walk(cells, 'ABCCED', k => caps[k]);
    f.push(F('All 6 letters matched → true. (Each cell is unmarked again on the way back.)', g(B68, { h: cells.map(([r, c]) => `${r}.${c}g`).join(',') })));
    return f;
  });
  T(68, 1, () => {
    const cells = [[2, 1], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0]];
    const f = [F('Prune 1: count letters. The board has A 2, B 1, C 2, E 3, D 1 — enough for A B C C E D ✓. Prune 2: first letter A appears 2 times, last letter D only once → search the reversed word "DECCBA" (fewer starts).', g(B68), a([...'DECCBA'], { x: 'reversed' }))];
    const caps = ['Start at the only "D", (2,1).', '"E": right (2,2) ✓.', '"C": up (1,2) ✓.', '"C": up (0,2) ✓.', '"B": left (0,1) ✓.', '"A": left (0,0) ✓.'];
    f.push(...walk(cells, 'DECCBA', k => caps[k]));
    f.push(F('Matched → true, after trying a single start cell.', g(B68, { h: cells.map(([r, c]) => `${r}.${c}g`).join(',') })));
    return f;
  });

  /* 69 · Climbing Stairs */
  const T69 = ['f5', 'f4', 'f3', 'f3', 'f2', 'f2', 'f1', 'f2', 'f1'];
  T(69, 0, () => [
    F('f(5) calls f(4) and f(3); each of those calls two more … down to the base cases f(1) = 1, f(2) = 2.', tr(T69, { h: '0y' })),
    F('The leaves return: every f(2) → 2, every f(1) → 1.', tr(T69, { h: '4g,5g,6g,7g,8g', lab: { 4: '2', 5: '2', 6: '1', 7: '2', 8: '1' } })),
    F('f(3) = f(2) + f(1) = 3 — computed TWICE (both orange nodes). Repeated work grows like 2ⁿ.', tr(T69, { h: '2r,3r', lab: { 2: '3', 3: '3', 4: '2', 5: '2', 6: '1', 7: '2', 8: '1' } })),
    F('f(4) = f(3) + f(2) = 3 + 2 = 5.', tr(T69, { h: '1y', lab: { 1: '5', 2: '3', 3: '3', 4: '2' } })),
    F('f(5) = f(4) + f(3) = 5 + 3 = 8.', tr(T69, { h: '0g', lab: { 0: '8', 1: '5', 2: '3' } }))
  ]);
  T(69, 1, () => {
    const dp = [1, 2, D, D, D], f = [F('Base cases: ways(1) = 1, ways(2) = 2.', a(dp.slice(), { x: 'ways', il: ['n=1', 'n=2', 'n=3', 'n=4', 'n=5'], h: '0g,1g' }))];
    for (let i = 2; i < 5; i++) { dp[i] = dp[i - 1] + dp[i - 2]; f.push(F(`ways(${i + 1}) = ways(${i}) + ways(${i - 1}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`, a(dp.slice(), { x: 'ways', il: ['n=1', 'n=2', 'n=3', 'n=4', 'n=5'], h: H({ [i]: 'y' }), arc: [[i - 2, i], [i - 1, i]] }))); }
    return f;
  });
  T(69, 2, () => {
    let x = 1, y = 2; const f = [F('a = ways(1) = 1, b = ways(2) = 2.', kvr([['a', 1], ['b', 2]]))];
    for (let k = 3; k <= 5; k++) { const c = x + y; f.push(F(`n = ${k}: c = a + b = ${x} + ${y} = ${c}. Slide: a = ${y}, b = ${c}.`, a([x, y, c], { x: 'a b → c', h: '2y' }), kvr([['a', y], ['b', c]]))); x = y; y = c; }
    return f;
  });

  /* 70 · House Robber */
  const N70 = [2, 7, 9, 3, 1];
  T(70, 0, () => [
    F('go(4) = max(go(3) [skip house 4], 1 + go(2) [rob it]). Each call branches into two → 2ⁿ calls.', a(N70, { x: 'house', i: 1, h: '4y' })),
    F('Bottom of the recursion: go(0) = 2, go(1) = max(7, 2) = 7.', a(N70, { x: 'house', i: 1 }), a([2, 7, D, D, D], { x: 'go(i)', h: '0g,1g' })),
    F('go(2) = max(go(1) 7, 9 + go(0) 2) = 11 — called again and again from different branches.', a(N70, { x: 'house', i: 1 }), a([2, 7, 11, D, D], { x: 'go(i)', h: '2r' })),
    F('go(3) = max(go(2) 11, 3 + go(1) 7) = 11.', a(N70, { x: 'house', i: 1 }), a([2, 7, 11, 11, D], { x: 'go(i)', h: '3y' })),
    F('go(4) = max(go(3) 11, 1 + go(2) 11) = 12.', a(N70, { x: 'house', i: 1 }), a([2, 7, 11, 11, 12], { x: 'go(i)', h: '4g' }))
  ]);
  T(70, 1, () => {
    const dp = [0, 0, D, D, D, D, D], f = [F('dp[0] = dp[1] = 0 (no houses yet). dp[i + 2] = best for the first i + 1 houses.', a(N70, { x: 'house' }), a(dp.slice(), { x: 'dp', i: 1, h: '0g,1g' }))];
    for (let i = 0; i < 5; i++) { const skip = dp[i + 1], rob = dp[i] + N70[i]; dp[i + 2] = Math.max(skip, rob); f.push(F(`House ${i} (${N70[i]}): skip → ${skip}, rob → ${dp[i]} + ${N70[i]} = ${rob} → dp[${i + 2}] = ${dp[i + 2]}.`, a(N70, { x: 'house', h: H({ [i]: rob >= skip ? 'g' : 'r' }) }), a(dp.slice(), { x: 'dp', i: 1, h: H({ [i + 2]: 'y' }), arc: [[i, i + 2, '+' + N70[i]]] }))); }
    return f;
  });
  T(70, 2, () => {
    let p2 = 0, p1 = 0; const f = [F('prev2 = 0, prev1 = 0.', a(N70, { x: 'house' }), kvr([['prev2', 0], ['prev1', 0]]))];
    N70.forEach((x, i) => { const cur = Math.max(p1, p2 + x); f.push(F(`House ${i} (${x}): cur = max(prev1 ${p1}, prev2 ${p2} + ${x}) = ${cur}. Slide: prev2 = ${p1}, prev1 = ${cur}.`, a(N70, { x: 'house', h: H({ [i]: 'y' }), p: `${i}:i` }), kvr([['prev2', p1], ['prev1', cur]]))); p2 = p1; p1 = cur; });
    return f;
  });

  /* 71 · Coin Change */
  const C71 = [1, 2, 5];
  const best71 = [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3];
  const how71 = a0 => { for (const c of C71) if (a0 >= c && best71[a0 - c] + 1 === best71[a0]) return c; };
  T(71, 0, () => [
    F('f(11) tries every coin: f(10) (coin 1), f(9) (coin 2), f(6) (coin 5), and keeps the smallest + 1.', tr([11, 10, 9, 6], { lab: { 1: '−1', 2: '−2', 3: '−5' }, h: '0y' })),
    F('Each of those branches three ways again … f(9) is reached from f(11) and from f(10), and so on.', tr([11, 10, 9, 9, 8, 7, 4], { lab: { 1: '−1', 2: '−2', 3: '−1', 4: '−2' }, h: '2r,3r' })),
    F('Counting every call for amount 11: 928 calls for only 12 different amounts → massive repetition.', kvr([['calls', 928], ['distinct amounts', 12]])),
    F('The minimum found: 5 + 5 + 1 → 3 coins.', a([5, 5, 1], { x: 'coins', h: '0g,1g,2g' }))
  ]);
  T(71, 1, () => {
    const memo = Array(12).fill(D), f = [F('f(11) → f(10) → … → f(0) = 0 (coin 1 first, depth first). memo[0] = 0.', a((memo[0] = 0, memo.slice()), { x: 'memo', i: 1, h: '0g' }))];
    for (let x = 1; x <= 11; x++) { memo[x] = best71[x]; const c = how71(x); f.push(F(`Unwinding: f(${x}) = min over coins = f(${x - c}) + 1 using coin ${c} = ${memo[x]}. Stored — any later call for ${x} is O(1).`, a(memo.slice(), { x: 'memo', i: 1, h: H({ [x]: 'y', [x - c]: 'b' }) }))); }
    return f;
  });
  T(71, 2, () => {
    const dp = Array(12).fill('∞'); dp[0] = 0;
    const f = [F('dp[0] = 0; every other amount starts at ∞.', a(dp.slice(), { x: 'dp', i: 1, h: '0g' }))];
    for (let x = 1; x <= 11; x++) {
      const tries = C71.filter(c => c <= x).map(c => `dp[${x - c}] + 1 = ${dp[x - c] + 1}`);
      dp[x] = best71[x]; const c = how71(x);
      f.push(F(`dp[${x}]: ${tries.join(', ')} → min ${dp[x]} (coin ${c}).`, a(dp.slice(), { x: 'dp', i: 1, h: H({ [x]: 'y', [x - c]: 'b' }), arc: [[x - c, x, String(c)]] })));
    }
    return f;
  });

  /* 72 · LIS */
  const N72 = [10, 9, 2, 5, 3, 7, 101, 18];
  T(72, 0, () => {
    const f = [F('At every index choose: take it (only if bigger than the last taken) or skip it. 2⁸ = 256 paths in the worst case.', a(N72, { x: 'nums', i: 1 }))];
    let best = 0; const path = [];
    const go = (i, prev) => {
      if (i === 8) { if (path.length > best) { best = path.length; const idx = path.map(v => N72.indexOf(v)); f.push(F(`A complete path: [${path.join(', ')}] → length ${best} — a new best.`, a(N72, { x: 'nums', i: 1, h: H(Object.fromEntries(idx.map(k => [k, 'g']))) }), kvr([['best', best]]))); } return; }
      if (prev < 0 || N72[i] > N72[prev]) { path.push(N72[i]); go(i + 1, i); path.pop(); }
      go(i + 1, prev);
    };
    go(0, -1);
    f.push(F(`Every path checked → longest = ${best}.`, kvr([['best', best]], { h: 'bestg' })));
    return f;
  });
  T(72, 1, () => {
    const dp = Array(8).fill(D), f = [];
    N72.forEach((x, i) => {
      let b = 1, from = -1; for (let j = 0; j < i; j++) if (N72[j] < x && dp[j] + 1 > b) { b = dp[j] + 1; from = j; }
      dp[i] = b;
      const smaller = N72.slice(0, i).map((v, j) => (v < x ? j : -1)).filter(j => j >= 0);
      f.push(F(`i = ${i} (${x}): smaller numbers before it: ${smaller.length ? smaller.map(j => `${N72[j]} (dp ${dp[j]})`).join(', ') : 'none'} → dp[${i}] = ${b}.`, a(N72, { x: 'nums', i: 1, h: H(Object.assign(Object.fromEntries(smaller.map(j => [j, 'b'])), { [i]: 'y' })), arc: from >= 0 ? [[from, i, '+1']] : undefined }), a(dp.slice(), { x: 'dp', h: H({ [i]: 'y' }) })));
    });
    f.push(F('Answer = max(dp) = 4 (e.g. 2, 3, 7, 18).', a(dp, { x: 'dp', h: '6g,7g' })));
    return f;
  });
  T(72, 2, () => {
    const tails = [], f = [];
    N72.forEach((x, i) => {
      let k = tails.findIndex(t => t >= x), msg;
      if (k < 0) { tails.push(x); k = tails.length - 1; msg = `${x} is bigger than every tail → append. A run of length ${tails.length} exists now.`; }
      else { msg = `lower_bound(${x}) = slot ${k} (tail ${tails[k]}) → replace it with ${x} (a smaller tail is easier to extend).`; tails[k] = x; }
      f.push(F(`x = ${x}: ${msg}`, a(N72, { x: 'nums', h: H({ [i]: 'y' }) }), a(tails.slice(), { x: 'tails', h: H({ [k]: 'y' }) })));
    });
    f.push(F(`tails has ${tails.length} entries → LIS length = ${tails.length}.`, a(tails, { x: 'tails', h: tails.map((_, k) => k + 'g').join(',') })));
    return f;
  });

  /* 73 · LCS */
  const A73 = [...'abcde'], B73 = [...'ace'];
  const lcs = (() => { const d = Array.from({ length: 6 }, () => Array(4).fill(0)); for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) d[i][j] = A73[i - 1] === B73[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]); return d; })();
  T(73, 0, () => {
    const steps = [[0, 0, 'a = a → match: 1 + go(1, 1).'], [1, 1, 'b ≠ c → two branches: go(2, 1) and go(1, 2). Both are explored (that is the 2ⁿ blow-up).'], [2, 1, 'c = c → match: 1 + go(3, 2).'], [3, 2, 'd ≠ e → branches go(4, 2) and go(3, 3).'], [4, 2, 'e = e → match: 1 + go(5, 3) = 1 + 0.']];
    const f = steps.map(([i, j, cap], k) => F(`go(${i}, ${j}): ${cap}`, a(A73, { x: 'text1', p: `${i}:i`, h: H(Object.assign(Object.fromEntries(steps.slice(0, k).filter(([ii, jj]) => A73[ii] === B73[jj]).map(([ii]) => [ii, 'g'])), { [i]: A73[i] === B73[j] ? 'g' : 'r' })) }), a(B73, { x: 'text2', p: `${j}:j`, h: H(Object.assign(Object.fromEntries(steps.slice(0, k).filter(([ii, jj]) => A73[ii] === B73[jj]).map(([, jj]) => [jj, 'g'])), { [j]: A73[i] === B73[j] ? 'g' : 'r' })) })));
    f.push(F('Best branch returns 3 matches: a, c, e → LCS = 3.', a(A73, { x: 'text1', h: '0g,2g,4g' }), a(B73, { x: 'text2', h: '0g,1g,2g' })));
    return f;
  });
  T(73, 1, () => {
    const view = r => lcs.map((row, i) => row.map((v, j) => (i <= r || j === 0 || i === 0 ? v : D)));
    const f = [F('Row ε and column ε are 0: an empty string shares nothing.', m(['', ...A73], ['', ...B73], view(0)))];
    for (let i = 1; i <= 5; i++) {
      const hl = []; for (let j = 1; j <= 3; j++) if (A73[i - 1] === B73[j - 1]) hl.push(`${i}.${j}g`);
      f.push(F(`Row "${A73[i - 1]}": ${hl.length ? `"${A73[i - 1]}" matches → diagonal + 1; ` : 'no match in "ace" → '}other cells take max(up, left) → [${lcs[i].slice(1).join(', ')}].`, m(['', ...A73], ['', ...B73], view(i), { h: hl.join(',') || `${i}.1y` })));
    }
    f.push(F('Bottom-right cell = 3.', m(['', ...A73], ['', ...B73], lcs, { h: '5.3g' })));
    return f;
  });
  T(73, 2, () => {
    const f = [F('One row for the empty prefix: [0, 0, 0, 0].', a([0, 0, 0, 0], { x: 'row', il: ['ε', 'a', 'c', 'e'] }))];
    for (let i = 1; i <= 5; i++) f.push(F(`Process "${A73[i - 1]}": left to right, keeping the old diagonal in a variable → row = [${lcs[i].join(', ')}].`, a(lcs[i].slice(), { x: `row ${A73[i - 1]}`, il: ['ε', 'a', 'c', 'e'], h: H(Object.fromEntries([1, 2, 3].filter(j => lcs[i][j] !== lcs[i - 1][j]).map(j => [j, 'y']))) })));
    f.push(F('Last cell = 3.', a(lcs[5], { x: 'row', il: ['ε', 'a', 'c', 'e'], h: '3g' })));
    return f;
  });

  /* 74 · Word Break */
  const S74 = [...'leetcode'];
  T(74, 0, () => [
    F('Prefixes of "leetcode": "l", "le", "lee" are not words …', a(S74, { i: 1, w: [0, 2], h: '0r,1r,2r' })),
    F('"leet" is a word ✓ → recurse on the rest "code".', a(S74, { i: 1, w: [0, 3], h: '0g,1g,2g,3g' })),
    F('Prefixes of "code": "c", "co", "cod" no; "code" ✓ → recurse on "".', a(S74, { i: 1, w: [4, 7], h: '0g,1g,2g,3g,4g,5g,6g,7g' })),
    F('Empty string → true. leet + code.', a(['leet', 'code'], { h: '0g,1g' }))
  ]);
  const wb = (lim) => () => {
    const dp = Array(9).fill(D); dp[0] = 'T';
    const f = [F(`dp[i] = "the first i letters can be split". dp[0] = T (empty prefix).${lim ? ' The longest word has L = 4 letters, so each i looks back at most 4.' : ''}`, a(dp.slice(), { x: 'dp', i: 1, h: '0g' }))];
    for (let i = 1; i <= 8; i++) {
      let ok = false, hit = -1; const j0 = lim ? Math.max(0, i - 4) : 0;
      for (let j = j0; j < i; j++) if (dp[j] === 'T' && ['leet', 'code'].includes(S74.slice(j, i).join(''))) { ok = true; hit = j; break; }
      dp[i] = ok ? 'T' : 'F';
      f.push(F(`i = ${i} ("${S74.slice(0, i).join('')}"): check j = ${j0} … ${i - 1}${ok ? ` → dp[${hit}] = T and "${S74.slice(hit, i).join('')}" is a word ✓ → T` : ' → no split works → F'}.`, a(dp.slice(), { x: 'dp', i: 1, h: H({ [i]: ok ? 'g' : 'r', [hit]: ok ? 'b' : '' }), arc: ok ? [[hit, i, S74.slice(hit, i).join('')]] : undefined })));
    }
    return f;
  };
  T(74, 1, wb(false));
  T(74, 2, wb(true));

  /* 75 · Edit Distance */
  const A75 = [...'horse'], B75 = [...'ros'];
  const ed = (() => { const d = Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))); for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) d[i][j] = A75[i - 1] === B75[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]); return d; })();
  T(75, 0, () => [
    F('go(h, r): h ≠ r → 1 + min(delete h, insert r, replace h → r). Three branches every time → 3ⁿ calls.', a(A75, { x: 'word1', p: '0:i', h: '0r' }), a(B75, { x: 'word2', p: '0:j', h: '0r' })),
    F('Best branch: replace h → r (1 edit). Move both: go(o, o).', a(['r', 'o', 'r', 's', 'e'], { x: 'word1', p: '1:i', h: '0y' }), a(B75, { x: 'word2', p: '1:j', h: '0g' })),
    F('o = o → free, move both: go(r, s).', a(['r', 'o', 'r', 's', 'e'], { x: 'word1', p: '2:i', h: '0y,1g' }), a(B75, { x: 'word2', p: '2:j', h: '0g,1g' })),
    F('r ≠ s → best is delete r (2 edits). go(s, s).', a(['r', 'o', 's', 'e'], { x: 'word1', p: '2:i', h: '0y,1g' }), a(B75, { x: 'word2', p: '2:j', h: '0g,1g' })),
    F('s = s → free. word2 is finished; "e" is left → delete it (3 edits).', a(['r', 'o', 's'], { x: 'word1', h: '0g,1g,2g' }), a(B75, { x: 'word2', h: '0g,1g,2g' }), kvr([['edits', 3]], { h: 'editsg' }))
  ]);
  T(75, 1, () => {
    const view = r => ed.map((row, i) => row.map((v, j) => (i <= r || j === 0 ? v : D)));
    const f = [F('Row ε = 0 1 2 3 (insert letters), column ε = 0 1 2 3 4 5 (delete letters).', m(['', ...A75], ['', ...B75], view(0)))];
    for (let i = 1; i <= 5; i++) {
      const hl = []; for (let j = 1; j <= 3; j++) if (A75[i - 1] === B75[j - 1]) hl.push(`${i}.${j}g`);
      f.push(F(`Row "${A75[i - 1]}": ${hl.length ? 'a matching letter copies the diagonal for free; ' : ''}other cells = 1 + min(up, left, diagonal) → [${ed[i].join(', ')}].`, m(['', ...A75], ['', ...B75], view(i), { h: hl.join(',') || `${i}.1y` })));
    }
    f.push(F('Bottom-right = 3 edits.', m(['', ...A75], ['', ...B75], ed, { h: '5.3g' })));
    return f;
  });
  T(75, 2, () => {
    const f = [F('One row: turning "" into "", "r", "ro", "ros" → [0, 1, 2, 3].', a(ed[0].slice(), { x: 'row ε', il: ['ε', 'r', 'o', 's'] }))];
    for (let i = 1; i <= 5; i++) f.push(F(`Letter "${A75[i - 1]}": row[0] = ${i}; then left to right with the saved diagonal → [${ed[i].join(', ')}].`, a(ed[i].slice(), { x: `row ${A75[i - 1]}`, il: ['ε', 'r', 'o', 's'], h: H(Object.fromEntries([1, 2, 3].filter(j => A75[i - 1] === B75[j - 1]).map(j => [j, 'g']))) })));
    f.push(F('Last cell = 3.', a(ed[5], { x: 'row e', il: ['ε', 'r', 'o', 's'], h: '3g' })));
    return f;
  });

  /* 76 · Partition Equal Subset Sum */
  const N76 = [1, 5, 11, 5];
  T(76, 0, () => [
    F('Total = 22 (even) → target = 11. Take 1 → sum 1.', a(N76, { x: 'nums', h: '0y' }), kvr([['sum', 1], ['target', 11]])),
    F('Take 5 → sum 6.', a(N76, { x: 'nums', h: '0y,1y' }), kvr([['sum', 6]])),
    F('Take 11 → 17 > 11 ✗ → undo, skip 11.', a(N76, { x: 'nums', h: '0y,1y,2r' }), kvr([['sum', 6]])),
    F('Take the last 5 → 11 = target ✓ → true ({1, 5, 5} vs {11}).', a(N76, { x: 'nums', h: '0g,1g,2b,3g' }), kvr([['sum', 11]], { h: 'sumg' }))
  ]);
  const sums = arr => { let st = new Set([0]); const out = []; arr.forEach(x => { const nx = new Set(st); st.forEach(v => { if (v + x <= 11) nx.add(v + x); }); st = nx; out.push(new Set(st)); }); return out; };
  T(76, 1, () => {
    const st = sums(N76), row = set => Array.from({ length: 12 }, (_, j) => (set.has(j) ? 'T' : 'F'));
    const f = [F('dp[j] = "some items make sum j". dp[0] = T. Loop j DOWNWARD so each item is used once.', a(row(new Set([0])), { x: 'dp', i: 1, h: '0g' }))];
    let prev = new Set([0]);
    N76.forEach((x, k) => { const nw = [...st[k]].filter(v => !prev.has(v)); f.push(F(`Item ${x}: dp[j] |= dp[j − ${x}] → new sums ${nw.length ? nw.join(', ') : 'none'}.${st[k].has(11) ? ' dp[11] = T ✓' : ''}`, a(row(st[k]), { x: 'dp', i: 1, h: H(Object.fromEntries(nw.map(v => [v, v === 11 ? 'g' : 'y']))) }))); prev = st[k]; });
    return f;
  });
  T(76, 2, () => {
    const st = sums(N76), SUMS = Array.from({ length: 12 }, (_, j) => j);
    const f = [F('A bitset: bit j on = sum j reachable. Start with bit 0.', a(SUMS, { x: 'bit', h: '0g' }))];
    N76.forEach((x, k) => f.push(F(`b |= b << ${x}: every lit bit also lights the bit ${x} places higher (one machine word handles 64 sums at once).`, a(SUMS, { x: 'bit', h: H(Object.fromEntries([...st[k]].map(v => [v, v === 11 ? 'g' : 'b']))) }))));
    f.push(F('Bit 11 is on → true.', a(SUMS, { x: 'bit', h: '11g' })));
    return f;
  });

  /* 77 · Jump Game */
  const N77 = [2, 3, 1, 1, 4];
  T(77, 0, () => {
    const rc = [1, 0, 0, 0, 0], f = [];
    for (let i = 0; i < 4; i++) {
      if (!rc[i]) continue;
      const nw = []; for (let k = i + 1; k <= Math.min(4, i + N77[i]); k++) if (!rc[k]) { rc[k] = 1; nw.push(k); }
      f.push(F(`Index ${i} is reachable (jump up to ${N77[i]}) → mark ${i + 1} … ${Math.min(4, i + N77[i])}${nw.length ? ' (new: ' + nw.join(', ') + ')' : ' (nothing new)'}.`, a(N77, { i: 1, h: H(Object.assign(Object.fromEntries(rc.map((r, k) => [k, r ? 'g' : ''])), { [i]: 'y' })), p: `${i}:i` })));
    }
    f.push(F('The last index is marked → true.', a(N77, { i: 1, h: '4g' })));
    return f;
  });
  T(77, 1, () => {
    const run = (arr, tag) => { const f = []; let far = 0; for (let i = 0; i < arr.length; i++) { if (i > far) { f.push(F(`${tag} i = ${i} > far = ${far} → index ${i} can never be reached → false.`, a(arr, { i: 1, h: H({ [i]: 'r' }), p: `${i}:i` }), kvr([['far', far]]))); return f; } far = Math.max(far, i + arr[i]); f.push(F(`${tag} i = ${i}: far = max(far, ${i} + ${arr[i]}) = ${far}.${far >= arr.length - 1 ? ' It reaches the last index → true.' : ''}`, a(arr, { i: 1, w: [0, Math.min(far, arr.length - 1)], h: H({ [i]: 'y' }), p: `${i}:i` }), kvr([['far', far]]))); if (far >= arr.length - 1) return f; } return f; };
    return [...run(N77, '[2,3,1,1,4]'), ...run([3, 2, 1, 0, 4], '[3,2,1,0,4]')];
  });

  /* 78 · Jump Game II */
  T(78, 0, () => {
    const dp = [0, '∞', '∞', '∞', '∞'], f = [F('dp[0] = 0 jumps; every other index starts at ∞.', a(N77, { x: 'nums', i: 1 }), a(dp.slice(), { x: 'jumps' }))];
    for (let i = 0; i < 4; i++) {
      const up = []; for (let k = i + 1; k <= Math.min(4, i + N77[i]); k++) if (dp[i] + 1 < (dp[k] === '∞' ? Infinity : dp[k])) { dp[k] = dp[i] + 1; up.push(k); }
      f.push(F(`From ${i} (${dp[i]} jumps, reach ${N77[i]}): relax ${i + 1} … ${Math.min(4, i + N77[i])} with ${dp[i] + 1}${up.length ? ' → improved ' + up.join(', ') : ' → nothing improves'}.`, a(N77, { x: 'nums', i: 1, h: H({ [i]: 'y' }) }), a(dp.slice(), { x: 'jumps', h: H(Object.fromEntries(up.map(k => [k, 'g']))) })));
    }
    return f;
  });
  T(78, 1, () => [
    F('i = 0: far = max(0, 0 + 2) = 2. i == end of the current level (0) → jump! jumps = 1, end = 2.', a(N77, { i: 1, w: [1, 2], h: '0y', p: '0:i,2:end' }), kvr([['jumps', 1], ['far', 2]])),
    F('i = 1: far = max(2, 1 + 3) = 4.', a(N77, { i: 1, w: [1, 2], h: '1y', p: '1:i,2:end' }), kvr([['jumps', 1], ['far', 4]])),
    F('i = 2: far stays 4. i == end → jump! jumps = 2, end = 4 ≥ last index → stop.', a(N77, { i: 1, w: [3, 4], h: '2y', p: '2:i,4:end' }), kvr([['jumps', 2], ['far', 4]], { h: 'jumpsg' })),
    F('Path: 0 → 1 → 4 = 2 jumps.', a(N77, { i: 1, h: '0g,1g,4g', arc: [[0, 1], [1, 4]] }))
  ]);

  /* 79 · Gas Station */
  const G79 = [1, 2, 3, 4, 5], C79 = [3, 4, 5, 1, 2], DF = G79.map((g0, i) => g0 - C79[i]);
  T(79, 0, () => {
    const f = [];
    for (let st = 0; st < 5; st++) {
      let tank = 0, k = 0, fail = -1; const tr0 = [];
      for (; k < 5; k++) { const i = (st + k) % 5; tank += DF[i]; tr0.push(tank); if (tank < 0) { fail = i; break; } }
      f.push(F(`Start ${st}: tank after each station ${tr0.join(', ')}${fail >= 0 ? ` → negative at station ${fail} ✗` : ' → the full loop works ✓ → answer 3'}.`, a(DF, { x: 'gas−cost', i: 1, h: H(fail >= 0 ? { [st]: 'y', [fail]: 'r' } : Object.fromEntries([0, 1, 2, 3, 4].map(x => [x, 'g']))), p: `${st}:start` })));
      if (fail < 0) break;
    }
    return f;
  });
  T(79, 1, () => {
    let total = 0, tank = 0, start = 0; const f = [F('diff = gas − cost = [−2, −2, −2, 3, 3]. total = 0, tank = 0, start = 0.', a(DF, { x: 'diff', i: 1 }))];
    DF.forEach((d, i) => {
      total += d; tank += d; let msg = `total = ${total}, tank = ${tank}`;
      if (tank < 0) { msg += ` < 0 → no start up to ${i} works → start = ${i + 1}, tank = 0`; start = i + 1; tank = 0; }
      f.push(F(`i = ${i} (${d}): ${msg}.`, a(DF, { x: 'diff', i: 1, h: H(Object.assign(range(0, start - 1, 'm'), { [i]: 'y' })), p: start < 5 ? `${start}:start` : '' }), kvr([['total', total], ['tank', tank]])));
    });
    f.push(F(`total = ${total} ≥ 0 → a full loop exists → start at ${start}.`, a(DF, { x: 'diff', i: 1, h: '3g', p: '3:start' })));
    return f;
  });

  /* 80 · Trie */
  T(80, 0, () => [
    F('insert("apple"), insert("app") → a hash set of whole words.', kvr([['set', 'apple · app']])),
    F('search("ap"): is "ap" in the set? No → false.', kvr([['set', 'apple · app'], ['search ap', 'false']], { h: 'search apr' })),
    F('startsWith("ap"): scan EVERY word: "apple" starts with "ap" ✓ → true. (O(N·L) per query.)', kvr([['set', 'apple · app'], ['startsWith ap', 'true']], { h: 'startsWith apg' }))
  ]);
  T(80, 1, () => [
    F('insert("apple"): from the root create a → p → p → l → e; flag "e" as a word end.', l(['root', 'a', 'p', 'p', 'l', 'e'], { h: '1y,2y,3y,4y,5g' })),
    F('insert("app"): a → p → p already exist → just flag the second "p" as a word end.', l(['root', 'a', 'p', 'p', 'l', 'e'], { h: '3g,5g' })),
    F('search("ap"): walk a → p ✓, but that "p" has no end flag → false.', l(['root', 'a', 'p', 'p', 'l', 'e'], { h: '1y,2r,3g,5g', p: '2:stop' })),
    F('startsWith("ap"): the path a → p exists → true. Only 2 steps, no matter how many words are stored.', l(['root', 'a', 'p', 'p', 'l', 'e'], { h: '1g,2g', p: '2:stop' }))
  ]);

  VIZ.DRY = VIZ.DRY || {};
  Object.keys(X).forEach(id => { VIZ.DRY[id] = Object.assign(VIZ.DRY[id] || {}, X[id]); });
})();
