/* Full dry runs, problems 41-60. */
(function () {
  const { a, s, kvr, n, l, tr, iv, g, gr, m, F, N } = VIZ.h;
  const X = {};
  const T = (id, si, fn) => { (X[id] = X[id] || {})[si] = fn(); };
  const H = o => Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + v).join(',');
  const sg = x => (typeof x === 'number' && x < 0 ? '−' + (-x) : String(x));

  /* 41 · Invert Binary Tree */
  const S0 = [4, 2, 7, 1, 3, 6, 9], S1 = [4, 7, 2, 6, 9, 1, 3], S2 = [4, 7, 2, 9, 6, 1, 3], S3 = [4, 7, 2, 9, 6, 3, 1];
  T(41, 0, () => [
    F('invert(4): swap its two subtrees (2-side ↔ 7-side), then recurse into both.', tr(S1, { h: '0y,1b,2b' })),
    F('invert(7) (now on the left): swap its children 6 ↔ 9.', tr(S2, { h: '0g,1y,3b,4b' })),
    F('invert(9), invert(6): leaves, their null children swap to null — nothing visible changes.', tr(S2, { h: '0g,1g,3g,4g' })),
    F('invert(2) (now on the right): swap its children 1 ↔ 3.', tr(S3, { h: '0g,1g,3g,4g,2y,5b,6b' })),
    F('invert(3), invert(1): leaves. Every node has been mirrored → [4, 7, 2, 9, 6, 3, 1].', tr(S3, { h: '0g,1g,2g,3g,4g,5g,6g' }))
  ]);
  T(41, 1, () => [
    F('Queue = [4].', tr(S0, { h: '0y' }), a([4], { x: 'queue' })),
    F('Pop 4 → swap its children (2 ↔ 7) → push 7, 2.', tr(S1, { h: '0g,1y,2y' }), a([7, 2], { x: 'queue' })),
    F('Pop 7 → swap 6 ↔ 9 → push 9, 6.', tr(S2, { h: '0g,1g,2y,3y,4y' }), a([2, 9, 6], { x: 'queue' })),
    F('Pop 2 → swap 1 ↔ 3 → push 3, 1.', tr(S3, { h: '0g,1g,2g,3y,4y,5y,6y' }), a([9, 6, 3, 1], { x: 'queue' })),
    F('Pop 9, 6, 3, 1: leaves, nothing to swap. Queue empty → done.', tr(S3, { h: '0g,1g,2g,3g,4g,5g,6g' }), kvr([['queue', 'empty']]))
  ]);

  /* 42 · Diameter */
  const T42 = [1, 2, 3, 4, 5];
  T(42, 0, () => [
    F('Node 1: compute height(left = 2) = 2 and height(right = 3) = 1 from scratch → path through 1 = 2 + 1 = 3. best = 3.', tr(T42, { h: '0y,1b,2b,3b,4b', lab: { 0: '2 + 1 = 3' } })),
    F('Node 2: compute height(4) = 1 and height(5) = 1 again (repeated work) → 1 + 1 = 2. best = 3.', tr(T42, { h: '0g,1y,3b,4b', lab: { 0: '3', 1: '1 + 1 = 2' } })),
    F('Node 3: both children null → 0 + 0 = 0.', tr(T42, { h: '0g,2y', lab: { 0: '3', 1: '2', 2: '0' } })),
    F('Nodes 4 and 5: leaves → 0. The largest value seen is 3 → diameter 3.', tr(T42, { h: '0g,3y,4y', lab: { 0: '3', 1: '2', 2: '0', 3: '0', 4: '0' } }))
  ]);
  T(42, 1, () => [
    F('DFS reaches leaf 4: L = 0, R = 0 → best = max(0, 0) = 0; return height 1.', tr(T42, { h: '3y', lab: { 3: '↑1' } }), kvr([['best', 0]])),
    F('Leaf 5: returns height 1.', tr(T42, { h: '3g,4y', lab: { 3: '↑1', 4: '↑1' } }), kvr([['best', 0]])),
    F('Back at 2: L = 1, R = 1 → a path of 1 + 1 = 2 edges bends here → best = 2. Return 1 + max(1, 1) = 2.', tr(T42, { h: '1y,3g,4g', lab: { 1: '↑2', 3: '↑1', 4: '↑1' } }), kvr([['best', 2]])),
    F('Leaf 3: returns height 1. best stays 2.', tr(T42, { h: '1g,2y', lab: { 1: '↑2', 2: '↑1', 3: '↑1', 4: '↑1' } }), kvr([['best', 2]])),
    F('At 1: L = 2, R = 1 → 2 + 1 = 3 → best = 3. Path 4 → 2 → 1 → 3.', tr(T42, { h: '0g,1g,2g,3g', lab: { 0: 'L2 + R1', 1: '↑2', 2: '↑1' } }), kvr([['best', 3]], { h: 'bestg' }))
  ]);

  /* 43 · Level Order */
  const T43 = [3, 9, 20, N, N, 15, 7];
  T(43, 0, () => [
    F('dfs(3, depth 0): res has no row 0 yet → create it → res[0] = [3].', tr(T43, { h: '0y', lab: { 0: 'd0' } }), kvr([['d0', '3']])),
    F('dfs(9, depth 1): create row 1 → res[1] = [9].', tr(T43, { h: '0g,1y', lab: { 1: 'd1' } }), kvr([['d0', '3'], ['d1', '9']])),
    F('dfs(20, depth 1): row 1 exists → append → res[1] = [9, 20].', tr(T43, { h: '0g,1g,2y', lab: { 2: 'd1' } }), kvr([['d0', '3'], ['d1', '9 20']])),
    F('dfs(15, depth 2): create row 2 → [15].', tr(T43, { h: '0g,1g,2g,5y', lab: { 5: 'd2' } }), kvr([['d0', '3'], ['d1', '9 20'], ['d2', '15']])),
    F('dfs(7, depth 2): append → [15, 7]. Result [[3], [9, 20], [15, 7]].', tr(T43, { h: '0g,1g,2g,5g,6g', lab: { 6: 'd2' } }), kvr([['d0', '3'], ['d1', '9 20'], ['d2', '15 7']], { h: 'd2g' }))
  ]);
  T(43, 1, () => [
    F('Queue = [3]. size = 1 → this level has 1 node.', tr(T43, { h: '0y' }), a([3], { x: 'queue' })),
    F('Pop 1 node: 3 → level [3]. Push 9, 20. size = 2.', tr(T43, { h: '0g,1y,2y' }), a([9, 20], { x: 'queue' }), kvr([['res', '[3]']])),
    F('Pop 2 nodes: 9, 20 → level [9, 20]. Push 15, 7. size = 2.', tr(T43, { h: '0g,1g,2g,5y,6y' }), a([15, 7], { x: 'queue' }), kvr([['res', '[3] [9,20]']])),
    F('Pop 2 nodes: 15, 7 → level [15, 7]. Queue empty → done.', tr(T43, { h: '0g,1g,2g,5g,6g' }), kvr([['res', '[3] [9,20] [15,7]']], { h: 'resg' }))
  ]);

  /* 44 · Validate BST */
  const T44 = [5, 1, 4, N, N, 3, 6];
  T(44, 0, () => [
    F('In-order (left, node, right): go left from 5 to 1. Visit 1.', tr(T44, { h: '1y' }), a([1], { x: 'in-order' })),
    F('Back up: visit 5.', tr(T44, { h: '1g,0y' }), a([1, 5], { x: 'in-order' })),
    F('Go right to 4, then left to 3: visit 3.', tr(T44, { h: '1g,0g,5y' }), a([1, 5, 3], { x: 'in-order' })),
    F('Visit 4, then 6.', tr(T44, { h: '1g,0g,5g,2y,6y' }), a([1, 5, 3, 4, 6], { x: 'in-order' })),
    F('Check strictly increasing: 1 < 5 ✓, 5 < 3 ✗ → not a BST → false.', a([1, 5, 3, 4, 6], { x: 'in-order', h: '0g,1r,2r' }))
  ]);
  T(44, 1, () => [
    F('Node 5 gets the range (−∞, ∞): −∞ < 5 < ∞ ✓.', tr(T44, { h: '0g', lab: { 0: '(−∞, ∞)' } })),
    F('Left child 1 gets (−∞, 5): −∞ < 1 < 5 ✓. It has no children.', tr(T44, { h: '0g,1g', lab: { 0: '(−∞, ∞)', 1: '(−∞, 5)' } })),
    F('Right child 4 gets (5, ∞): is 5 < 4? No ✗ → return false right away.', tr(T44, { h: '0g,1g,2r', lab: { 0: '(−∞, ∞)', 1: '(−∞, 5)', 2: '(5, ∞)' } }))
  ]);

  /* 45 · LCA */
  const T45 = [3, 5, 1, 6, 2, 0, 8, N, N, 7, 4];
  T(45, 0, () => [
    F('DFS from the root to find p = 5, remembering the path: 3 → 5.', tr(T45, { h: '0y,1y' }), a([3, 5], { x: 'path p' })),
    F('DFS again to find q = 1: path 3 → 1.', tr(T45, { h: '0b,2b' }), a([3, 5], { x: 'path p' }), a([3, 1], { x: 'path q' })),
    F('Walk both paths together: index 0 → 3 = 3 ✓, index 1 → 5 ≠ 1 ✗. The last common node is 3.', tr(T45, { h: '0g' }), a([3, 5], { x: 'path p', h: '0g,1r' }), a([3, 1], { x: 'path q', h: '0g,1r' }))
  ]);
  T(45, 1, () => [
    F('lca(3): not null, not p, not q → ask the left subtree.', tr(T45, { h: '0y' })),
    F('lca(5): this node IS p → return 5 at once (no need to look under it).', tr(T45, { h: '0y,1g', lab: { 1: '↑5' } })),
    F('lca(1): this node IS q → return 1.', tr(T45, { h: '0y,1g,2g', lab: { 1: '↑5', 2: '↑1' } })),
    F('Back at 3: left returned 5, right returned 1 → both sides are non-null → 3 is the LCA.', tr(T45, { h: '0g', lab: { 0: 'LCA', 1: '↑5', 2: '↑1' } }))
  ]);

  /* 46 · Kth Smallest in BST */
  const T46 = [5, 3, 6, 2, 4, N, N, 1];
  T(46, 0, () => [
    F('Full in-order walk: 1, 2, 3, 4, 5, 6 (a BST gives sorted order).', tr(T46, { lab: { 7: '1', 3: '2', 1: '3', 4: '4', 0: '5', 2: '6' } }), a([1, 2, 3, 4, 5, 6], { x: 'vector' })),
    F('Return v[k − 1] = v[2] = 3.', a([1, 2, 3, 4, 5, 6], { x: 'vector', i: 1, h: '2g', p: '2:k−1' }))
  ]);
  T(46, 1, () => [
    F('Go left as far as possible, pushing each node: 5, 3, 2, 1.', tr(T46, { h: '0b,1b,3b,7y' }), s([5, 3, 2, 1], { x: 'stack' }), kvr([['k', 3]])),
    F('Pop 1 → 1st smallest. k = 3 → 2. 1 has no right child.', tr(T46, { h: '7g' }), s([5, 3, 2], { x: 'stack' }), kvr([['k', 2]])),
    F('Pop 2 → 2nd smallest. k → 1. 2 has no right child.', tr(T46, { h: '7g,3g' }), s([5, 3], { x: 'stack' }), kvr([['k', 1]])),
    F('Pop 3 → k → 0 → stop: the answer is 3. Nodes 4, 5, 6 are never touched.', tr(T46, { h: '7g,3g,1g,4m,0m,2m' }), s([5], { x: 'stack' }), kvr([['k', 0], ['answer', 3]], { h: 'answerg' }))
  ]);

  /* 47 · Right Side View */
  const T47 = [1, 2, 3, N, 5, N, 4];
  T(47, 0, () => [
    F('Level 1 = [1] → the last node is 1 → seen.', tr(T47, { h: '0g' }), a([1], { x: 'view' })),
    F('Level 2 = [2, 3] → the last node is 3 → seen (2 is hidden behind it).', tr(T47, { h: '0g,1m,2g' }), a([1, 3], { x: 'view' })),
    F('Level 3 = [5, 4] → the last node is 4 → seen.', tr(T47, { h: '0g,1m,2g,4m,6g' }), a([1, 3, 4], { x: 'view', h: '0g,1g,2g' }))
  ]);
  T(47, 1, () => [
    F('dfs(1, depth 0): depth 0 is new → record 1. Go RIGHT first.', tr(T47, { h: '0g' }), a([1], { x: 'view' })),
    F('dfs(3, depth 1): depth 1 is new → record 3.', tr(T47, { h: '0g,2g' }), a([1, 3], { x: 'view' })),
    F('dfs(4, depth 2): depth 2 is new → record 4.', tr(T47, { h: '0g,2g,6g' }), a([1, 3, 4], { x: 'view' })),
    F('dfs(2, depth 1): depth 1 already has a node → skip recording.', tr(T47, { h: '0g,2g,6g,1m' }), a([1, 3, 4], { x: 'view' })),
    F('dfs(5, depth 2): depth 2 already recorded → skip. View = [1, 3, 4].', tr(T47, { h: '0g,2g,6g,1m,4m' }), a([1, 3, 4], { x: 'view', h: '0g,1g,2g' }))
  ]);

  /* 48 · Kth Largest */
  const N48 = [3, 2, 1, 5, 6, 4];
  T(48, 0, () => [
    F('Sort descending.', a(N48, { x: 'nums' }), a([6, 5, 4, 3, 2, 1], { x: 'sorted', i: 1 })),
    F('Return nums[k − 1] = nums[1] = 5.', a([6, 5, 4, 3, 2, 1], { x: 'sorted', i: 1, h: '1g', p: '1:k−1' }))
  ]);
  T(48, 1, () => {
    const hp = [], f = [];
    N48.forEach((x, i) => {
      hp.push(x); hp.sort((p, q) => q - p); let msg = `push ${x}`;
      if (hp.length > 2) { const out = hp.pop(); msg += ` → size 3 > k → pop the smallest (${out})`; }
      f.push(F(`i = ${i}: ${msg}. Heap = {${hp.join(', ')}}, top (smallest) = ${hp[hp.length - 1]}.`, a(N48, { x: 'nums', h: H({ [i]: 'y' }) }), s(hp.slice(), { x: 'min-heap', h: (hp.length - 1) + 'y' })));
    });
    f.push(F('The top of the size-k min-heap is the k-th largest = 5.', s(hp, { x: 'min-heap', h: (hp.length - 1) + 'g' })));
    return f;
  });
  T(48, 2, () => [
    F('k-th largest = index n − k = 4 in ascending order. Pick pivot 1 (the middle element).', a(N48, { x: 'nums', h: '2y' }), kvr([['target index', 4]])),
    F('3-way partition: less [ ] · equal [1] · greater [3, 2, 5, 6, 4]. Index 4 lies in "greater" → keep only it (target index 4 − 1 = 3).', a([1, 3, 2, 5, 6, 4], { h: '0m,1b,2b,3b,4b,5b' })),
    F('Pivot 5: less [3, 2, 4] · equal [5] · greater [6]. Index 3 = first slot of "equal" → the answer is 5.', a([3, 2, 4, 5, 6], { h: '0m,1m,2m,3g,4m', i: 1 }))
  ]);

  /* 49 · K Closest Points */
  const P49 = ['(3,3)', '(5,−1)', '(−2,4)'];
  T(49, 0, () => [
    F('Distance² of each point: 9 + 9 = 18, 25 + 1 = 26, 4 + 16 = 20.', a(P49, { x: 'point' }), a([18, 26, 20], { x: 'dist²' })),
    F('Sort by distance²: (3,3) 18, (−2,4) 20, (5,−1) 26.', a(['(3,3)', '(−2,4)', '(5,−1)'], { x: 'sorted' }), a([18, 20, 26], { x: 'dist²' })),
    F('Take the first k = 2 → (3,3) and (−2,4).', a(['(3,3)', '(−2,4)', '(5,−1)'], { x: 'sorted', h: '0g,1g,2r' }))
  ]);
  T(49, 1, () => [
    F('Push (3,3) dist 18 → max-heap {18}.', a(P49, { x: 'point', h: '0y' }), s(['18'], { x: 'max-heap' })),
    F('Push (5,−1) dist 26 → {26, 18}. The biggest sits on top.', a(P49, { x: 'point', h: '1y' }), s(['18', '26'], { x: 'max-heap', h: '1y' })),
    F('Push (−2,4) dist 20 → size 3 > k → pop the biggest (26, point (5,−1)).', a(P49, { x: 'point', h: '2y,1r' }), s(['18', '20'], { x: 'max-heap' })),
    F('The heap keeps the k closest: (3,3) and (−2,4).', s(['18', '20'], { x: 'max-heap', h: '0g,1g' }))
  ]);
  T(49, 2, () => [
    F('Compute distance²: 18, 26, 20. We want the k = 2 smallest, in any order.', a(P49, { x: 'point' }), a([18, 26, 20], { x: 'dist²' })),
    F('nth_element: pick pivot 20 and partition → smaller [18] · pivot [20] · bigger [26].', a([18, 20, 26], { x: 'dist²', h: '0b,1y,2r' })),
    F('The pivot landed at index k − 1 = 1 → everything up to it is the answer: (3,3), (−2,4).', a(['(3,3)', '(−2,4)', '(5,−1)'], { x: 'point', h: '0g,1g,2r' }))
  ]);

  /* 50 · Merge k Sorted Lists */
  T(50, 0, () => [
    F('Collect every value from the 3 lists.', a([1, 4, 5, 1, 3, 4, 2, 6], { x: 'values' })),
    F('Sort them.', a([1, 1, 2, 3, 4, 4, 5, 6], { x: 'sorted', h: '0y,1y,2y,3y,4y,5y,6y,7y' })),
    F('Build a new list.', l([1, 1, 2, 3, 4, 4, 5, 6], { h: '0g,1g,2g,3g,4g,5g,6g,7g' }))
  ]);
  T(50, 1, () => {
    const Ls = { A: [1, 4, 5], B: [1, 3, 4], C: [2, 6] }, ptr = { A: 0, B: 0, C: 0 }, out = [], f = [];
    let heap = [[1, 'A'], [1, 'B'], [2, 'C']];
    const view = () => s(heap.slice().sort((x, y) => y[0] - x[0] || (y[1] < x[1] ? -1 : 1)).map(([v, k]) => `${v}${k}`), { x: 'min-heap', h: (heap.length - 1) + 'y' });
    f.push(F('Push the head of every list: 1 (A), 1 (B), 2 (C).', l(Ls.A, { x: 'A', h: '0y' }), l(Ls.B, { x: 'B', h: '0y' }), l(Ls.C, { x: 'C', h: '0y' }), view()));
    while (heap.length) {
      heap.sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : 1));
      const [v, k] = heap.shift(); out.push(v); ptr[k]++;
      const nxt = Ls[k][ptr[k]]; if (nxt !== undefined) heap.push([nxt, k]);
      f.push(F(`Pop the smallest: ${v} from ${k} → attach it. ${nxt !== undefined ? `Push ${k}'s next (${nxt}).` : `${k} is empty.`}`, view(), l(out.slice(), { x: 'out', h: (out.length - 1) + 'g' })));
    }
    return f;
  });
  T(50, 2, () => [
    F('Round 1: pair the lists up. Merge A and B (two-list merge); C has no partner, it waits.', l([1, 4, 5], { x: 'A' }), l([1, 3, 4], { x: 'B' }), l([2, 6], { x: 'C' })),
    F('A + B → 1 1 3 4 4 5.', l([1, 1, 3, 4, 4, 5], { x: 'A+B', h: '0g,1g,2g,3g,4g,5g' }), l([2, 6], { x: 'C' })),
    F('Round 2: merge (A+B) with C → 1 1 2 3 4 4 5 6. One list left → done. log k rounds, N work each.', l([1, 1, 2, 3, 4, 4, 5, 6], { h: '2b,7b,0g,1g,3g,4g,5g,6g' }))
  ]);

  /* 51 · Task Scheduler */
  T(51, 0, () => {
    const tl = Array(8).fill('·'), f = [], cnt = { A: 3, B: 3 }, ready = { A: 1, B: 1 };
    for (let t = 1; t <= 8; t++) {
      const avail = ['A', 'B'].filter(k => cnt[k] > 0 && ready[k] <= t).sort((x, y) => cnt[y] - cnt[x]);
      let msg;
      if (avail.length) { const k = avail[0]; cnt[k]--; ready[k] = t + 3; tl[t - 1] = k; msg = `run ${k} (the biggest count that is free) → ${k} left ${cnt[k]}, parked until t${t + 3}.`; }
      else { tl[t - 1] = 'idle'; msg = 'A and B are both cooling down → idle.'; }
      f.push(F(`t${t}: ${msg}`, a(tl.slice(), { il: [1, 2, 3, 4, 5, 6, 7, 8], h: H({ [t - 1]: tl[t - 1] === 'idle' ? 'm' : 'y' }) }), kvr([['A', `×${cnt.A}`], ['B', `×${cnt.B}`]], { x: 'left' })));
    }
    return f;
  });
  T(51, 1, () => [
    F('Count: A ×3, B ×3. maxFreq = 3, and 2 tasks reach it (countOfMax = 2).', kvr([['A', '×3'], ['B', '×3']], { x: 'count' })),
    F('Skeleton: maxFreq − 1 = 2 full blocks of width n + 1 = 3: [A _ _] [A _ _].', a(['A', '_', '_', 'A', '_', '_'], { h: '0y,3y' })),
    F('Fill the gaps with B, then a last row with the countOfMax tasks: A B.', a(['A', 'B', 'idle', 'A', 'B', 'idle', 'A', 'B'], { h: '0y,3y,6y,1b,4b,7b,2m,5m' })),
    F('Answer = max(6 tasks, 2 × 3 + 2) = 8.', kvr([['answer', 8]], { h: 'answerg' }))
  ]);

  /* 52 · Median from Data Stream */
  T(52, 0, () => [
    F('addNum(1): binary-search the slot → [1].', a([1], { x: 'sorted', h: '0y' })),
    F('addNum(2): insert at upper_bound → [1, 2] (O(n) shifting in general).', a([1, 2], { x: 'sorted', h: '1y' })),
    F('findMedian: even size → (1 + 2) / 2 = 1.5.', a([1, 2], { x: 'sorted', h: '0g,1g' })),
    F('addNum(3) → [1, 2, 3].', a([1, 2, 3], { x: 'sorted', h: '2y' })),
    F('findMedian: odd size → the middle = 2.', a([1, 2, 3], { x: 'sorted', h: '1g' }))
  ]);
  T(52, 1, () => [
    F('addNum(1): push into lo (max-heap), move lo.top to hi, hi is bigger → move it back. lo {1}, hi { }.', s([1], { x: 'lo (max)', h: '0y' }), kvr([['hi (min)', 'empty']])),
    F('addNum(2): push into lo → {2, 1}; move lo.top 2 to hi. lo {1}, hi {2} — balanced.', s([1], { x: 'lo (max)' }), s([2], { x: 'hi (min)', h: '0y' })),
    F('findMedian: equal sizes → (lo.top 1 + hi.top 2) / 2 = 1.5.', s([1], { x: 'lo (max)', h: '0g' }), s([2], { x: 'hi (min)', h: '0g' })),
    F('addNum(3): push into lo → {3, 1}; move 3 to hi → hi {2, 3}. hi is bigger → move 2 back. lo {2, 1}, hi {3}.', s([1, 2], { x: 'lo (max)', h: '1y' }), s([3], { x: 'hi (min)' })),
    F('findMedian: lo has one more → median = lo.top = 2.', s([1, 2], { x: 'lo (max)', h: '1g' }), s([3], { x: 'hi (min)' }))
  ]);

  /* 53 · Merge Intervals */
  T(53, 0, () => [
    F('Check every pair for overlap: [1,3] and [2,6] overlap (2 ≤ 3).', iv([[1, 3, 'y'], [2, 6, 'y'], [8, 10], [15, 18]], { max: 18 })),
    F('Merge them → [1,6]. Start the search again from scratch.', iv([[1, 6, 'g'], [8, 10], [15, 18]], { max: 18 })),
    F('Check every pair again: no pair overlaps → stop. [1,6] [8,10] [15,18].', iv([[1, 6, 'g'], [8, 10, 'g'], [15, 18, 'g']], { max: 18 }))
  ]);
  T(53, 1, () => [
    F('Sort by start (already sorted). Put [1,3] into the result.', iv([[1, 3, 'g'], [2, 6], [8, 10], [15, 18]], { max: 18 })),
    F('[2,6]: start 2 ≤ last end 3 → overlap → extend the last end to max(3, 6) = 6.', iv([[1, 6, 'g'], [2, 6, 'y'], [8, 10], [15, 18]], { max: 18 })),
    F('[8,10]: start 8 > 6 → no overlap → append.', iv([[1, 6, 'g'], [8, 10, 'g'], [15, 18]], { max: 18 })),
    F('[15,18]: 15 > 10 → append. Result [1,6] [8,10] [15,18].', iv([[1, 6, 'g'], [8, 10, 'g'], [15, 18, 'g']], { max: 18 }))
  ]);

  /* 54 · Insert Interval */
  T(54, 0, () => [
    F('Append [4,8] and sort by start.', iv([[1, 2], [3, 5], [4, 8, 'b'], [6, 7], [8, 10], [12, 16]], { max: 16 })),
    F('Merge pass: [1,2] → result. [3,5] → result.', iv([[1, 2, 'g'], [3, 5, 'g'], [4, 8, 'b'], [6, 7], [8, 10], [12, 16]], { max: 16 })),
    F('[4,8] overlaps [3,5] → [3,8]. [6,7] inside → [3,8]. [8,10] touches → [3,10].', iv([[1, 2, 'g'], [3, 10, 'g'], [12, 16]], { max: 16 })),
    F('[12,16] → append. Result [1,2] [3,10] [12,16].', iv([[1, 2, 'g'], [3, 10, 'g'], [12, 16, 'g']], { max: 16 }))
  ]);
  T(54, 1, () => [
    F('Phase 1: copy every interval that ends before 4. [1,2] ✓. [3,5] ends at 5 → stop.', iv([[1, 2, 'g'], [3, 5, 'y'], [6, 7], [8, 10], [12, 16], [4, 8, 'b', 'new 4–8']], { max: 16 })),
    F('Phase 2: [3,5] starts before 8 → swallow it: new = [min(3,4), max(5,8)] = [3,8].', iv([[1, 2, 'g'], [3, 5, 'r'], [6, 7], [8, 10], [12, 16], [3, 8, 'b', 'new 3–8']], { max: 16 })),
    F('[6,7] starts 6 ≤ 8 → swallow (still [3,8]). [8,10] starts 8 ≤ 8 → swallow → [3,10].', iv([[1, 2, 'g'], [6, 7, 'r'], [8, 10, 'r'], [12, 16], [3, 10, 'b', 'new 3–10']], { max: 16 })),
    F('Phase 3: [12,16] starts after 10 → copy it. Result [1,2] [3,10] [12,16].', iv([[1, 2, 'g'], [3, 10, 'g'], [12, 16, 'g']], { max: 16 }))
  ]);

  /* 55 · Meeting Rooms II */
  const I55 = [[0, 30], [5, 10], [15, 20]];
  T(55, 0, () => [
    F('t = 0 (start of [0,30]): meetings running → [0,30] → 1.', iv([[0, 30, 'y'], [5, 10], [15, 20]], { max: 30 }), kvr([['max', 1]])),
    F('t = 5: running → [0,30], [5,10] → 2.', iv([[0, 30, 'y'], [5, 10, 'y'], [15, 20]], { max: 30 }), kvr([['max', 2]])),
    F('t = 15: running → [0,30], [15,20] ([5,10] ended) → 2. Answer = max = 2.', iv([[0, 30, 'y'], [5, 10, 'm'], [15, 20, 'y']], { max: 30 }), kvr([['max', 2]], { h: 'maxg' }))
  ]);
  T(55, 1, () => [
    F('Sort by start. [0,30]: heap empty → new room. Heap of end times = {30}.', iv([[0, 30, 'y'], [5, 10], [15, 20]], { max: 30 }), s([30], { x: 'ends' })),
    F('[5,10]: earliest end 30 > 5 → no room is free → new room. Heap {10, 30}.', iv([[0, 30, 'g'], [5, 10, 'y'], [15, 20]], { max: 30 }), s([30, 10], { x: 'ends', h: '1y' })),
    F('[15,20]: earliest end 10 ≤ 15 → that room is free → pop 10, push 20. Heap {20, 30}.', iv([[0, 30, 'g'], [5, 10, 'm'], [15, 20, 'y']], { max: 30 }), s([30, 20], { x: 'ends', h: '1y' })),
    F('Heap size = rooms needed = 2.', s([30, 20], { x: 'ends', h: '0g,1g' }))
  ]);
  T(55, 2, () => [
    F('Sort starts and ends separately.', a([0, 5, 15], { x: 'starts' }), a([10, 20, 30], { x: 'ends' })),
    F('Start 0: is end 10 ≤ 0? no → rooms = 1.', a([0, 5, 15], { x: 'starts', h: '0y', p: '0:s' }), a([10, 20, 30], { x: 'ends', p: '0:e' }), kvr([['rooms', 1]])),
    F('Start 5: is end 10 ≤ 5? no → rooms = 2.', a([0, 5, 15], { x: 'starts', h: '0g,1y', p: '1:s' }), a([10, 20, 30], { x: 'ends', p: '0:e' }), kvr([['rooms', 2]])),
    F('Start 15: end 10 ≤ 15 → one meeting finished → reuse its room (e++). rooms stays 2. Max = 2.', a([0, 5, 15], { x: 'starts', h: '0g,1g,2y', p: '2:s' }), a([10, 20, 30], { x: 'ends', h: '0r', p: '1:e' }), kvr([['rooms', 2]], { h: 'roomsg' }))
  ]);

  /* 56 · Non-overlapping Intervals */
  T(56, 0, () => [
    F('Sort by start: [1,2], [1,3], [2,3], [3,4]. dp[i] = longest non-overlapping chain ending at i.', iv([[1, 2], [1, 3], [2, 3], [3, 4]], { max: 4 }), a([1, 1, 1, 1], { x: 'dp' })),
    F('[1,3]: [1,2] ends at 2 > 1 → overlaps → dp stays 1.', iv([[1, 2, 'r'], [1, 3, 'y'], [2, 3], [3, 4]], { max: 4 }), a([1, 1, 1, 1], { x: 'dp', h: '1y' })),
    F('[2,3]: [1,2] ends at 2 ≤ 2 ✓ → dp = 2. [1,3] ends at 3 > 2 ✗.', iv([[1, 2, 'g'], [1, 3, 'r'], [2, 3, 'y'], [3, 4]], { max: 4 }), a([1, 1, 2, 1], { x: 'dp', h: '2y' })),
    F('[3,4]: best compatible is [2,3] (dp 2) → dp = 3. Longest chain 3 → remove 4 − 3 = 1.', iv([[1, 2, 'g'], [1, 3, 'r'], [2, 3, 'g'], [3, 4, 'g']], { max: 4 }), a([1, 1, 2, 3], { x: 'dp', h: '3g' }))
  ]);
  T(56, 1, () => [
    F('Sort by END: [1,2], [2,3], [1,3], [3,4]. Keep [1,2] → lastEnd = 2.', iv([[1, 2, 'g'], [2, 3], [1, 3], [3, 4]], { max: 4 }), kvr([['lastEnd', 2], ['removed', 0]])),
    F('[2,3]: start 2 ≥ 2 → keep → lastEnd = 3.', iv([[1, 2, 'g'], [2, 3, 'g'], [1, 3], [3, 4]], { max: 4 }), kvr([['lastEnd', 3], ['removed', 0]])),
    F('[1,3]: start 1 < 3 → overlaps → remove it.', iv([[1, 2, 'g'], [2, 3, 'g'], [1, 3, 'r'], [3, 4]], { max: 4 }), kvr([['lastEnd', 3], ['removed', 1]])),
    F('[3,4]: start 3 ≥ 3 → keep. Removed = 1.', iv([[1, 2, 'g'], [2, 3, 'g'], [1, 3, 'r'], [3, 4, 'g']], { max: 4 }), kvr([['lastEnd', 4], ['removed', 1]], { h: 'removedg' }))
  ]);

  /* 57 · Number of Islands */
  const G0 = [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const cp = gr0 => gr0.map(r => r.slice());
  const flood = (bfs) => () => {
    const gd = cp(G0), f = []; let count = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      if (gd[r][c] !== '1') continue;
      count++;
      f.push(F(`Scan reaches (${r},${c}) = land → island #${count}. ${bfs ? 'Push it into the queue' : 'Start a DFS'} and sink every connected land cell.`, g(cp(gd), { h: `${r}.${c}y` }), kvr([['islands', count]])));
      const order = [], st = [[r, c]]; gd[r][c] = '0';
      if (bfs) { const q = [[r, c]]; while (q.length) { const [x, y] = q.shift(); order.push([x, y]); DIRS.forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < 4 && ny < 5 && gd[nx][ny] === '1') { gd[nx][ny] = '0'; q.push([nx, ny]); } }); } }
      else { const dfs = (x, y) => { order.push([x, y]); DIRS.forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < 4 && ny < 5 && gd[nx][ny] === '1') { gd[nx][ny] = '0'; dfs(nx, ny); } }); }; dfs(r, c); }
      if (order.length > 1) {
        const view = cp(G0); for (let x = 0; x < 4; x++) for (let y = 0; y < 5; y++) if (gd[x][y] === '0' && G0[x][y] === '1') view[x][y] = '0';
        f.push(F(`${bfs ? 'BFS' : 'DFS'} order: ${order.map(([x, y]) => `(${x},${y})`).join(' → ')}. Each visited cell is set to 0 so it is never counted again.`, g(view, { h: order.map(([x, y], k) => `${x}.${y}${k === order.length - 1 ? 'y' : 'r'}`).join(',') }), kvr([['islands', count]])));
      }
    }
    f.push(F(`Scan finished → ${count} islands.`, g(cp(gd)), kvr([['islands', count]], { h: 'islandsg' })));
    return f;
  };
  T(57, 0, flood(false));
  T(57, 1, flood(true));
  T(57, 2, () => {
    const id = (r, c) => r * 5 + c, par = {}, f = [], land = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) if (G0[r][c] === '1') { par[id(r, c)] = id(r, c); land.push(`${r}.${c}`); }
    const find = x => (par[x] === x ? x : (par[x] = find(par[x])));
    let count = land.length;
    f.push(F(`${count} land cells → start with ${count} separate islands (each cell is its own root).`, g(G0, { h: land.map(x => x + 'y').join(',') }), kvr([['islands', count]])));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      if (G0[r][c] !== '1') continue;
      [[0, 1, 'right'], [1, 0, 'down']].forEach(([dr, dc, nm]) => {
        const nr = r + dr, nc = c + dc; if (nr >= 4 || nc >= 5 || G0[nr][nc] !== '1') return;
        const ra = find(id(r, c)), rb = find(id(nr, nc)), ok = ra !== rb; if (ok) { par[ra] = rb; count--; }
        f.push(F(`(${r},${c}) and its ${nm} neighbour (${nr},${nc}) are both land → union: ${ok ? `different roots → merge → islands = ${count}` : 'already the same root → nothing changes'}.`, g(G0, { h: `${r}.${c}y,${nr}.${nc}${ok ? 'g' : 'm'}` }), kvr([['islands', count]])));
      });
    }
    f.push(F(`Every neighbour pair checked → ${count} islands.`, g(G0, { h: '0.0g,0.1g,1.0g,1.1g,2.2b,3.3y,3.4y' }), kvr([['islands', count]], { h: 'islandsg' })));
    return f;
  });

  /* 58 · Rotting Oranges */
  const O58 = [['2', '1', '1'], ['1', '1', '0'], ['0', '1', '1']];
  const rotSteps = () => { const gd = cp(O58), out = []; for (;;) { const nw = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (gd[r][c] === '1' && DIRS.some(([dr, dc]) => (gd[r + dr] || [])[c + dc] === '2')) nw.push([r, c]); if (!nw.length) break; nw.forEach(([r, c]) => { gd[r][c] = '2'; }); out.push({ nw, gd: cp(gd) }); } return out; };
  T(58, 0, () => {
    const st = rotSteps(), f = [F('Minute 0: one rotten orange at (0,0); 6 fresh ones.', g(O58, { h: '0.0r' }))];
    st.forEach(({ nw, gd }, k) => f.push(F(`Minute ${k + 1}: scan the WHOLE grid; fresh oranges touching a rotten one rot: ${nw.map(([r, c]) => `(${r},${c})`).join(', ')}.`, g(gd, { h: nw.map(([r, c]) => `${r}.${c}y`).join(',') }))));
    f.push(F(`Minute ${st.length + 1}: a full scan changes nothing → stop. No fresh orange left → answer ${st.length}.`, g(st[st.length - 1].gd)));
    return f;
  });
  T(58, 1, () => {
    const st = rotSteps(), f = [F('Push every rotten orange into the queue: (0,0). fresh = 6.', g(O58, { h: '0.0r' }), a(['(0,0)'], { x: 'queue' }), kvr([['fresh', 6]]))];
    let fresh = 6;
    st.forEach(({ nw, gd }, k) => { fresh -= nw.length; f.push(F(`Level ${k + 1} = minute ${k + 1}: pop last minute's oranges, rot their fresh neighbours: ${nw.map(([r, c]) => `(${r},${c})`).join(', ')}. fresh = ${fresh}.`, g(gd, { h: nw.map(([r, c]) => `${r}.${c}y`).join(',') }), a(nw.map(([r, c]) => `(${r},${c})`), { x: 'queue' }), kvr([['fresh', fresh]]))); });
    f.push(F(`Queue empty and fresh = 0 → ${st.length} minutes.`, g(st[st.length - 1].gd), kvr([['minutes', st.length]], { h: 'minutesg' })));
    return f;
  });

  /* 59 · Number of Provinces */
  const M59 = [[1, 1, 0], [1, 1, 0], [0, 0, 1]];
  const C59 = (k, lab) => gr([[0, 70, 30, k[0] || '', lab[0] || ''], [1, 170, 30, k[1] || '', lab[1] || ''], [2, 280, 30, k[2] || '', lab[2] || '']], [[0, 1]], { H: 56 });
  T(59, 0, () => [
    F('City 0 is unvisited → provinces = 1. DFS from 0: row 0 says 0–1 connected → visit 1.', m(['0', '1', '2'], ['0', '1', '2'], M59, { h: '0.1y' }), C59(['g', 'y'], ['p1', 'p1'])),
    F('DFS from 1: row 1 has 0 (visited) and nothing new → back. Province 1 = {0, 1}.', m(['0', '1', '2'], ['0', '1', '2'], M59, { h: '1.0m' }), C59(['g', 'g'], ['p1', 'p1'])),
    F('City 1 already visited → skip. City 2 unvisited → provinces = 2; it has no neighbours.', m(['0', '1', '2'], ['0', '1', '2'], M59, { h: '2.2y' }), C59(['g', 'g', 'b'], ['p1', 'p1', 'p2'])),
    F('All cities seen → 2 provinces.', C59(['g', 'g', 'b'], ['p1', 'p1', 'p2']), kvr([['provinces', 2]], { h: 'provincesg' }))
  ]);
  T(59, 1, () => [
    F('Start: 3 components, every city is its own root.', C59(['', '', ''], ['root', 'root', 'root']), kvr([['components', 3]])),
    F('Pair (0, 1) is connected → roots 0 and 1 differ → union → components = 2.', m(['0', '1', '2'], ['0', '1', '2'], M59, { h: '0.1y' }), C59(['g', 'g', ''], ['', 'root', 'root']), kvr([['components', 2]])),
    F('Pairs (0, 2) and (1, 2) are 0 → no union. Answer = 2 components.', m(['0', '1', '2'], ['0', '1', '2'], M59, { h: '0.2m,1.2m' }), kvr([['components', 2]], { h: 'componentsg' }))
  ]);

  /* 60 · Course Schedule */
  const EA = [[0, 1, '', '', 1], [0, 2, '', '', 1], [1, 3, '', '', 1], [2, 3, '', '', 1]];
  const GA = (k, lab) => gr([0, 1, 2, 3].map((i, j) => [i, [40, 150, 150, 270][j], [58, 30, 92, 58][j], k[i] || '', lab[i] || '']), EA, { H: 112 });
  const GB = (k, lab, ek) => gr([[0, 70, 60, k[0] || '', lab[0] || ''], [1, 180, 30, k[1] || '', lab[1] || ''], [2, 180, 92, k[2] || '', lab[2] || '']], [[0, 1, '', '', 1], [1, 2, '', '', 1], [2, 0, '', ek || '', 1]], { H: 112 });
  T(60, 0, () => [
    F('Graph A. dfs(0): mark 0 grey (on my path) → go to 1 (grey) → go to 3 (grey).', GA({ 0: 'y', 1: 'y', 3: 'y' }, { 0: 'grey', 1: 'grey', 3: 'grey' })),
    F('3 has no outgoing edges → black (done). Back to 1 → black.', GA({ 0: 'y', 1: 'g', 3: 'g' }, { 0: 'grey', 1: 'done', 3: 'done' })),
    F('From 0 go to 2 (grey) → its edge leads to 3, which is black (finished, safe) → 2 black, 0 black. No grey revisited → A is possible.', GA({ 0: 'g', 1: 'g', 2: 'g', 3: 'g' }, { 0: 'done', 1: 'done', 2: 'done', 3: 'done' })),
    F('Graph B. dfs(0) grey → 1 grey → 2 grey.', GB({ 0: 'y', 1: 'y', 2: 'y' }, { 0: 'grey', 1: 'grey', 2: 'grey' })),
    F('2 → 0, and 0 is still GREY (on the current path) → a loop → B is impossible → false.', GB({ 0: 'r', 1: 'y', 2: 'y' }, { 0: 'grey again!', 1: 'grey', 2: 'grey' }, 'r'))
  ]);
  T(60, 1, () => [
    F('Graph A. Indegrees: 0 → 0, 1 → 1, 2 → 1, 3 → 2. Queue = [0].', GA({ 0: 'y' }, { 0: 'in 0', 1: 'in 1', 2: 'in 1', 3: 'in 2' }), a([0], { x: 'queue' })),
    F('Take 0 (taken = 1). Its edges lower 1 and 2 to indegree 0 → queue them.', GA({ 0: 'g', 1: 'y', 2: 'y' }, { 0: 'taken', 1: 'in 0', 2: 'in 0', 3: 'in 2' }), a([1, 2], { x: 'queue' })),
    F('Take 1 (3 → in 1), take 2 (3 → in 0, queue it). Take 3. taken = 4 = n → A is possible.', GA({ 0: 'g', 1: 'g', 2: 'g', 3: 'g' }, { 0: 'taken', 1: 'taken', 2: 'taken', 3: 'taken' }), kvr([['taken', '4 / 4']], { h: 'takeng' })),
    F('Graph B. Every course has indegree 1 → nothing can start → queue empty. taken = 0 < 3 → false.', GB({ 0: 'r', 1: 'r', 2: 'r' }, { 0: 'in 1', 1: 'in 1', 2: 'in 1' }), kvr([['taken', '0 / 3']], { h: 'takenr' }))
  ]);

  VIZ.DRY = VIZ.DRY || {};
  Object.keys(X).forEach(id => { VIZ.DRY[id] = Object.assign(VIZ.DRY[id] || {}, X[id]); });
})();
