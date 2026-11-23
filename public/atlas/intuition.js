/* Intuition for every non-naive solution: [why it works, one line to remember].
   INTU[problemId][solutionIndex] */
window.VIZ = window.VIZ || {};
VIZ.INTU = {
  1: {
    1: ['After sorting, the smallest + largest pair tells you which way to move: too big means the largest can never be used with anything bigger, so drop it; too small means drop the smallest. Each step throws away one number for good.', 'Sort, then squeeze: big sum → drop the biggest, small sum → drop the smallest.'],
    2: ['For every x you already know exactly which partner you need: target − x. The naive loop searches for it; a hash map just remembers everything seen so far, so the search becomes a single O(1) lookup.', 'Don\'t search for the partner, remember it: seen[target − x].']
  },
  2: { 1: ['Order does not matter for an anagram, only how many of each letter. Counting 26 letters is cheaper than sorting, and +1 for s / −1 for t means a perfect match leaves every counter at zero.', 'Anagram = same letter counts → one count array, +s −t, all zeros.'] },
  3: {
    1: ['All anagrams look identical once their letters are sorted, so the sorted word is a perfect group ID. Instead of comparing words pairwise, drop each word into the bucket of its ID.', 'Sorted word = family surname → hash map of surname → words.'],
    2: ['Sorting each word costs k log k. The 26 letter counts identify the family just as well and take O(k) to build, so use the count signature as the key instead.', 'Same counts, same family: the key is the 26 counts, no sorting.']
  },
  4: {
    1: ['You only care about the k best, so never keep more than k. A min-heap of size k keeps the weakest of the current top k on top; anything weaker than it can be thrown out immediately.', 'Top k → min-heap of size k, kick out the weakest.'],
    2: ['A frequency can never exceed n, so frequencies are small whole numbers. Put each number on the shelf of its frequency and read shelves from the top: no comparison sort needed.', 'Frequency ≤ n → bucket by frequency, read from the top shelf.']
  },
  5: {
    1: ['"Everything except me" = everything on my left × everything on my right. Both sides are running products you can build in one pass each, so no division and no repeated multiplying.', 'Except-self = left product × right product.'],
    2: ['The left products can live in the answer array itself, and the right product only needs one running variable while you walk back. Same idea as two arrays, minus the extra memory.', 'Left pass fills the answer, right pass multiplies in a running suffix.']
  },
  6: {
    1: ['Sorting puts every consecutive chain side by side, so one left-to-right walk can count chain lengths. Duplicates are skipped because they neither break nor extend a chain.', 'Sort, then count runs where next = prev + 1.'],
    2: ['A chain only needs to be counted once, from its first number. A number is a chain head exactly when x − 1 is missing from the set, so start counting only there; every number is visited at most twice overall.', 'Only the first domino (no x − 1) starts counting.']
  },
  7: {
    1: ['Each removal should finish off a whole distinct number as cheaply as possible. The cheapest numbers to eliminate are the rarest ones, so sort the frequencies and spend k on the smallest first.', 'Kill the smallest gangs first.'],
    2: ['You only need frequencies in increasing order, and frequencies are at most n. Counting how many numbers have each frequency gives that order without sorting.', 'Counting sort on frequencies: walk sizes 1, 2, 3 … and spend k.']
  },
  8: {
    1: ['A subarray sum is the difference of two prefix sums. For each end point, the best start is the one with the smallest prefix before it, so track the running minimum prefix.', 'Best subarray ending here = prefix now − smallest earlier prefix.'],
    2: ['If the sum carried in from the left is negative, it can only drag you down, so it is better to start fresh at the current number. Otherwise keep extending. The best value ever seen is the answer.', 'Negative balance? Tear up the passbook and start fresh.']
  },
  9: { 1: ['A subarray (i, j] sums to k exactly when prefix[j] − prefix[i] = k, i.e. an earlier prefix equals prefix[j] − k. Counting earlier prefixes in a map answers "how many such i" in O(1) per position. Seed the map with {0: 1} for subarrays starting at index 0.', 'Count of earlier prefixes equal to (now − k); seed with prefix 0.'] },
  10: { 1: ['For a sell day, the best buy day is simply the cheapest day before it. Keep that minimum as you walk, and every day check "what if I sold today?".', 'Remember the cheapest day so far; sell today and compare.'] },
  11: { 1: ['A palindrome compares the i-th character from the left with the i-th from the right. Walk two pointers inward, skipping non-alphanumerics, instead of building a cleaned copy.', 'Two friends walk inward, skip puddles, must match every step.'] },
  12: {
    1: ['The array is sorted, so for each number the partner target − x can be found with binary search instead of a scan.', 'Sorted → binary-search the partner.'],
    2: ['Sorted order gives you direction: if l + r is too big, r can never pair with anything (everything else is ≥ l), so move r left; too small, move l right. One pass, no extra memory.', 'Seesaw: too heavy → r−−, too light → l++.']
  },
  13: {
    1: ['Fix the first number; now you need two others summing to −a[i], which is Two Sum. A hash set of numbers seen between i and j finds the third in O(1); a set of triplets removes duplicates.', '3Sum = fix one + Two Sum with a hash set.'],
    2: ['Sort once, fix a captain, and run the two-pointer Two Sum on the rest. Sorting also makes duplicates neighbours, so skipping equal values gives unique triplets without a set.', 'Sort, fix i, squeeze l and r, skip twins.']
  },
  14: { 1: ['Area is limited by the shorter wall. Moving the taller wall inward can only shrink the width and never raise the limit, so the only move that can help is moving the shorter wall.', 'Always move the shorter wall.'] },
  15: {
    1: ['Water above a bar = min(tallest on its left, tallest on its right) − its height. Those two maxima can be precomputed for every index in two passes, instead of rescanning for each bar.', 'Precompute leftMax[] and rightMax[], then min − height.'],
    2: ['If the left wall is lower than the right wall, the water at l is decided only by leftMax, because something at least as tall is guaranteed on the right. So settle the lower side, add its water and move it inward.', 'The lower side is settled: add water there, move it in.']
  },
  16: {
    1: ['There are only three possible values, so counting how many of each and rewriting the array is enough.', 'Only 3 colours → count, then rewrite.'],
    2: ['Keep three zones: 0s before lo, 2s after hi, 1s between lo and mid. Each element is looked at once and swapped straight into its zone. After swapping with hi, re-check mid because the incoming value is unknown.', '0 → swap left, 1 → step, 2 → swap right (don\'t step).']
  },
  17: {
    1: ['Valid windows only grow on the right and shrink on the left. When a duplicate enters, drop characters from the left until it is gone; each character enters and leaves the set once.', 'Window with a set: duplicate boards → evict from the back.'],
    2: ['Instead of evicting one by one, remember where each character was last seen. If that position is inside the window, jump l straight past it.', 'Store last index; on a repeat jump l to last + 1.']
  },
  18: { 1: ['A window can be made all one letter if (length − count of its most common letter) ≤ k. Grow the window; when it needs too many repaints, slide the left edge. The best window length seen is the answer.', 'Valid if len − maxCount ≤ k; otherwise shrink.'] },
  19: {
    1: ['A permutation of s1 is any window of the same length with the same letter counts. Slide a fixed-size window and update counts incrementally: one letter in, one letter out.', 'Fixed window of |s1|, compare 26 counts while sliding.'],
    2: ['Track how many letters are still missing instead of comparing 26 counts each time. Entering letters that were needed reduce it; leaving letters that become needed increase it. Missing = 0 means a match.', 'Keep a "missing" counter; zero means found.']
  },
  20: { 1: ['Expand right until the window covers everything in t, then shrink from the left as long as it still covers t. Every valid window is visited, each pointer moves at most n times, and the smallest is kept.', 'Expand until it has everything, shrink while it still does.'] },
  21: {
    1: ['Keep the window in a sorted multiset so the maximum is always the last element. Each step inserts one value and erases one, both O(log k).', 'Sorted window: insert new, erase old, max = last.'],
    2: ['A smaller number to the left of a bigger one can never be the max again while the bigger one is in the window. Keep a deque of candidates in decreasing order: pop smaller ones from the back, expired ones from the front.', 'Tall newcomer kicks out shorter ones; front is the king.']
  },
  22: { 1: ['The most recently opened bracket must close first, which is exactly last-in-first-out. Push openers; each closer must match the top.', 'Last opened, first closed → stack.'] },
  23: { 1: ['The minimum only changes when you push or pop, so record "the min at or below me" with every element. When it is popped, the previous min is already stored underneath.', 'Every plate carries a note: min so far.'] },
  24: { 1: ['In postfix, an operator always applies to the two most recent values, which are on top of a stack. Pop two, apply, push the result.', 'Numbers pile up; an operator eats the top two.'] },
  25: {
    1: ['A day waits on the stack until a warmer day shows up. When it does, every colder waiting day gets its answer at once. Each day is pushed and popped once.', 'Colder days wait on a stack; a warm day answers them.'],
    2: ['Going right to left, answers to the right are already known. If day j is not warmer, jump by its answer res[j] straight to the next day warmer than j, skipping everything in between.', 'Hop using answers you already have.']
  },
  26: {
    1: ['The best rectangle using bar i as its height stretches until the first shorter bar on each side. Monotonic stacks find "previous shorter" and "next shorter" for every bar in O(n).', 'Height × (nextSmaller − prevSmaller − 1).'],
    2: ['Keep bars in increasing height on a stack. When a shorter bar arrives, every taller bar it pops now knows both boundaries: the new bar on the right and the bar below it on the left.', 'A shorter bar pops taller ones and closes their rectangles.']
  },
  27: {
    1: ['Keep the index of the last position that cannot be part of a valid run (start with −1) at the bottom of the stack. Every ")" that finds a match measures its length back to that wall; an unmatched ")" becomes the new wall.', 'Stack holds the last wall; length = i − wall.'],
    2: ['Count opens and closes left to right: equal means a valid run, more closes means it is broken, so reset. Runs like "(()" never balance this way, so repeat the scan right to left with the roles swapped.', 'Two passes of counters: reset when it breaks.']
  },
  28: {
    0: ['A ")" with no "(" before it can never be matched, so drop it immediately. A "(" still waiting at the end was never closed, so drop those too. Track waiting "(" positions on a stack.', 'Unmatched ) now, unmatched ( at the end.'],
    1: ['Same rule as the stack, using counts: the first pass drops ")" that arrive with nothing open; the open count left over is exactly how many "(" to drop, taken from the right end.', 'Left pass drops bad ), right pass drops extra (.']
  },
  29: { 1: ['In a sorted array, one comparison with the middle tells you which half cannot contain the target, so you can throw that half away. log n halvings reach a single element.', 'Compare with mid, discard the wrong half.'] },
  30: {
    1: ['A rotated array is two sorted runs. Binary-search the pivot (the smallest element) first, then do a normal binary search in the run that can contain the target.', 'Find the pivot, then search the right run.'],
    2: ['Cut a rotated array anywhere and at least one half is sorted. Check whether the target lies inside the sorted half; if yes go there, otherwise go to the other half.', 'One half is always sorted: is the target inside it?']
  },
  31: { 1: ['Compare mid with the right end. If mid is bigger, the drop (minimum) must be to the right of mid; otherwise mid could be the minimum, so keep it and search left.', 'mid > right end → the cliff is to the right.'] },
  32: { 1: ['If Koko can finish at speed k, she can finish at any speed above k: the yes/no answer flips only once. Binary-search that flip point between 1 and the largest pile.', 'Binary search on the answer: smallest speed that works.'] },
  33: { 1: ['A bigger truck never needs more days, so "can ship in D days" is monotonic in capacity. Binary-search the capacity between the heaviest parcel and the total weight, checking each guess greedily.', 'Monotonic yes/no → binary search on capacity.'] },
  34: { 1: ['If nums[mid] < nums[mid + 1], the path goes up to the right, and an upward path must reach a peak before it ends. So a peak is guaranteed on that side; otherwise mid or something to its left is a peak.', 'Walk uphill; a peak must be there.'] },
  35: {
    1: ['Trust the recursion: reverse everything after head, then the node right after head (now the tail of the reversed part) should point back to head, and head becomes the new tail.', 'Reverse the rest, then hook head on at the end.'],
    2: ['Walk once and flip each next pointer backward. Save next before flipping or you lose the rest of the list; prev ends up as the new head.', 'Save next, flip, step prev and cur.']
  },
  36: {
    1: ['The smaller of the two heads must come first. Its next is just the merge of everything that is left, which is the same problem again.', 'Smaller head wins; its next = merge(rest).'],
    2: ['Like a zipper: keep a tail pointer and always attach the smaller front node. A dummy head removes the special case for the first node; leftovers are already sorted, so attach them as is.', 'Dummy head + always pull the smaller tooth.']
  },
  37: { 1: ['On a loop, a runner moving 2 steps closes the gap to a runner moving 1 step by one node per move, so it must land on it. Without a loop the fast runner falls off the end.', 'Tortoise and hare: they meet only on a loop.'] },
  38: { 1: ['Keep a gap of n + 1 nodes between two pointers. When the front one falls off the end, the back one is exactly one node before the one to delete. A dummy node handles deleting the head.', 'Rope of n + 1 nodes: front hits null, back is just before the victim.'] },
  39: { 1: ['You need O(1) lookup (hash map) and O(1) "move to front / remove from back" (doubly linked list). The map stores each key\'s node, so you can splice it to the front without searching.', 'Hash map for finding, linked list for ordering.'] },
  40: {
    0: ['The depth of a tree is 1 (the root) plus the depth of its deeper subtree. An empty tree has depth 0. The recursion just asks each child and combines.', 'Depth = 1 + max(left, right).'],
    1: ['Process the tree floor by floor with a queue; the number of floors you process is the depth.', 'Count BFS levels.']
  },
  41: {
    0: ['Mirroring a tree means swapping left and right at every node. Do it at the root, then let each child do the same for its own subtree.', 'Swap my children, then recurse.'],
    1: ['The order of swapping does not matter, only that every node gets swapped once, so a queue visiting every node works too.', 'Visit every node once and swap its children.']
  },
  42: { 1: ['The longest path that bends at a node uses its left height + right height. A single DFS that returns heights can update the best bend on the way back up, instead of recomputing heights.', 'Return height, update best with L + R.'] },
  43: {
    0: ['Carry the depth down the DFS and append each value to the list for its depth. Visiting left before right keeps each level in left-to-right order.', 'res[depth].push_back(val).'],
    1: ['A queue serves nodes in the order they were discovered, which is level by level. Snapshot the queue size at the start of a level and pop exactly that many.', 'Queue size at the start = nodes on this floor.']
  },
  44: { 1: ['Every node must respect all of its ancestors, not just its parent. Pass down an allowed (low, high) range: going left lowers the ceiling to the node, going right raises the floor.', 'Each node carries a range ticket from its ancestors.'] },
  45: { 1: ['Each subtree reports whether it contains p or q. The first node that hears from both its left and its right is the lowest node with both below it. If the node itself is p or q, it reports itself.', 'First node with a hit on both sides is the LCA.'] },
  46: { 1: ['An in-order walk of a BST visits values in sorted order. Doing it iteratively lets you stop as soon as you have counted k nodes.', 'In-order = sorted; stop at the k-th.'] },
  47: {
    0: ['From the right side you see the last node of every level. A level-order BFS hands you each level in order, so take its last node.', 'Last node of each BFS level.'],
    1: ['If you always visit the right child first, the first node you reach at each new depth is the one visible from the right.', 'Right-first DFS: first node at each new depth.']
  },
  48: {
    1: ['Keep only the k largest seen so far in a min-heap. Its top is the smallest of those k, which is the k-th largest overall when you finish.', 'Min-heap of size k; top = k-th largest.'],
    2: ['Partitioning around a pivot puts it at its final sorted position. If that is not the target position n − k, you only need to continue on one side, which averages O(n).', 'Quickselect: partition, keep only the side with the target.']
  },
  49: {
    1: ['Keep the k nearest in a max-heap by distance. The farthest of them sits on top, so any closer point replaces it.', 'Max-heap of size k; drop the farthest.'],
    2: ['You do not need the k points sorted, only separated from the rest. nth_element (quickselect) partitions around the k-th distance in average O(n).', 'Partition around the k-th distance.']
  },
  50: {
    1: ['The next node of the merged list is always the smallest among the current heads of the k lists. A min-heap gives that smallest head in O(log k).', 'Heap of list heads; pop smallest, push its next.'],
    2: ['Merging two sorted lists is easy. Merge them in pairs, then pairs of pairs, like a tournament: log k rounds, each touching all N nodes, with no heap.', 'Pairwise merging, tournament style.']
  },
  51: {
    0: ['Always running the task with the most copies left keeps the busiest task from forcing idle time at the end. A queue holds tasks that are cooling down.', 'Run the most frequent ready task; park it for n ticks.'],
    1: ['The busiest task decides the shape: (maxFreq − 1) blocks of length n + 1, plus a final row for every task tied at maxFreq. If there are more tasks than slots, no idle time is needed at all.', 'max(tasks, (maxFreq − 1)(n + 1) + countOfMax).']
  },
  52: { 1: ['The median sits between the smaller half and the larger half. Keep the smaller half in a max-heap and the larger half in a min-heap, balanced in size, so the median is always on top.', 'Two heaps: max-heap small half, min-heap big half.'] },
  53: { 1: ['After sorting by start, an interval can only overlap the one just before it in the merged list. So either extend the last merged interval or start a new one.', 'Sort by start; overlap → stretch the end.'] },
  54: { 1: ['The list is already sorted, so it splits into three runs: intervals entirely before the new one, intervals overlapping it, and intervals after it. Copy, merge, copy.', 'Before, overlap (merge), after.'] },
  55: {
    1: ['Process meetings by start time. A room is free if the meeting that ends earliest has already finished, so keep end times in a min-heap and reuse that room.', 'Min-heap of end times; reuse the earliest-free room.'],
    2: ['Only the number of rooms matters, not which one. Sort starts and ends separately and sweep: a start takes a room, an end that happened by then gives one back. The peak is the answer.', 'Sweep starts and ends; track the peak.']
  },
  56: { 1: ['To keep as many intervals as possible, always keep the one that ends earliest: it leaves the most room for everything after it. Anything that overlaps the last kept interval is removed.', 'Sort by end, keep the earliest finisher.'] },
  57: {
    0: ['Each unvisited land cell starts a new island. Flood-fill from it to mark the whole island, so it is never counted again.', 'New land → count + 1, sink the whole island.'],
    1: ['Same flood fill with a queue instead of recursion, which avoids deep call stacks on large grids. Mark cells when you push them.', 'BFS flood fill; mark on push.'],
    2: ['Treat every land cell as its own island, then join neighbouring land cells. Every successful join merges two islands into one, so subtract one per join.', 'Islands = land cells − successful unions.']
  },
  58: { 1: ['All rotten oranges spread at the same time, so start BFS from all of them at once. Each BFS level is one minute; if fresh oranges remain at the end, they were unreachable.', 'Multi-source BFS: level = minute.'] },
  59: {
    0: ['A province is a connected component. Each DFS from an unvisited city marks its whole province, so count how many DFS calls you start.', 'Count DFS starts.'],
    1: ['Start with every city alone and union each connected pair. Each union that joins two different groups reduces the number of provinces by one.', 'n − successful unions.']
  },
  60: {
    0: ['You can finish everything unless the prerequisites form a cycle. In DFS, reaching a node that is still on the current path (grey) means a cycle.', 'Grey node seen again → cycle → false.'],
    1: ['Repeatedly take a course with no remaining prerequisites and remove its edges. If a cycle exists, its courses never reach zero prerequisites, so fewer than n get taken.', 'Kahn: take indegree 0, count; count < n → cycle.']
  },
  61: {
    0: ['In DFS a course finishes only after every course that depends on it has finished. Reversing the finish order therefore puts every course before its dependents.', 'Reverse post-order = valid order.'],
    1: ['The order in which Kahn\'s algorithm removes indegree-0 courses is already a valid schedule.', 'Kahn\'s pop order is the answer.']
  },
  62: {
    0: ['A shortest path uses at most n − 1 edges. Relaxing every edge n − 1 times lets distances spread along any such path. The slowest node\'s distance is the answer.', 'Relax all edges n − 1 times.'],
    1: ['With non-negative times, the closest unfinished node\'s distance can never improve later. Always finalise the nearest node next with a min-heap, and relax its edges.', 'Always expand the nearest node (min-heap).']
  },
  63: {
    1: ['Each word has only L × 26 possible one-letter changes, far fewer than comparing with every word. Generate them and keep the ones in the dictionary; BFS gives the fewest steps.', 'Generate neighbours by changing one letter.'],
    2: ['BFS from both ends at once and always expand the smaller frontier. The search space grows much more slowly because two small circles meet before one big circle would.', 'Two BFS frontiers meet in the middle.']
  },
  64: {
    0: ['Round i of Bellman-Ford finds the cheapest prices using at most i flights. Run k + 1 rounds, and read only the previous round\'s prices so no round uses two flights.', 'k + 1 rounds, read from last round\'s copy.'],
    1: ['Dijkstra by cost, but the state includes how many flights were used. A cheaper path that uses too many flights is skipped, and a city is revisited only if reached with fewer flights.', 'Cheapest first, but track flights used.']
  },
  65: {
    0: ['Each element is either in the subset or not. Branch on take / skip for every element; the leaves of that tree are all 2ⁿ subsets.', 'Take it or skip it.'],
    1: ['Every subset of the first i + 1 numbers is a subset of the first i numbers, with or without the new number. So copy what you have and add the new number to each copy.', 'Copy every subset and add x.'],
    2: ['Number the subsets 0 … 2ⁿ − 1. Bit i of the number says whether nums[i] is included.', 'Bit i on → take nums[i].']
  },
  66: {
    0: ['Fill positions one by one; each position can take any number not yet used. A used[] array tracks that, and you undo after exploring.', 'Pick unused, recurse, unpick.'],
    1: ['Position i can be filled by swapping any later element into it. After recursing on the rest, swap back so the array is unchanged for the next choice.', 'Swap in, recurse, swap back.']
  },
  67: {
    0: ['Stay on the same index to allow reusing a coin, and only move forward to avoid the same combination in a different order.', 'Recurse with i (reuse), never go back.'],
    1: ['Sorted coins let you stop early: once a coin is bigger than what remains, every later coin is too.', 'Sorted → break on the first coin that overshoots.']
  },
  68: {
    0: ['Try every cell as a start. Mark a cell while it is on the current path so it is not reused, and unmark it when you back out so other paths can use it.', 'Mark, explore 4 ways, unmark.'],
    1: ['Quick checks cut the search: if the board lacks enough of some letter, stop at once; and starting from the rarer end of the word creates fewer false starts.', 'Count check first, start from the rarer end.']
  },
  69: {
    1: ['The last move to step n was either 1 or 2 steps, so ways(n) = ways(n − 1) + ways(n − 2). Store each value once instead of recomputing it.', 'ways(n) = ways(n − 1) + ways(n − 2).'],
    2: ['Each value only depends on the two before it, so two variables are enough.', 'Keep only the last two.']
  },
  70: {
    1: ['At each house you either skip it (best so far stays) or rob it (its money + best from two houses back). Store the best for every prefix.', 'best[i] = max(skip, rob + best[i − 2]).'],
    2: ['Only the last two best values are needed, so roll them forward in two variables.', 'Two rolling variables.']
  },
  71: {
    1: ['The fewest coins for an amount depends on the fewest coins for (amount − coin). The plain recursion solves the same amounts many times; a memo stores each once.', 'Memoise f(amount) = 1 + min f(amount − coin).'],
    2: ['Fill answers from 0 up to the target, so every smaller amount is ready when you need it.', 'dp[a] = 1 + min(dp[a − coin]), bottom-up.']
  },
  72: {
    1: ['The longest increasing run ending at i extends the best run ending at some earlier smaller number.', 'dp[i] = 1 + max dp[j] with nums[j] < nums[i].'],
    2: ['For every length keep the smallest possible ending value. A smaller ending is always better because it leaves more room to extend. Each new number replaces the first ending ≥ it (binary search) or extends the list.', 'Patience piles: lower_bound and replace.']
  },
  73: {
    1: ['If the last letters match, they are part of the LCS: 1 + LCS of both prefixes. Otherwise drop the last letter of one string and take the better result. A 2-D table stores each prefix pair once.', 'Match → diagonal + 1, else max(up, left).'],
    2: ['Each row only reads the row above, so keep one row and remember the old diagonal value in a variable.', 'One row + a diag variable.']
  },
  74: {
    1: ['The first i letters can be split if some earlier split point j works and s[j..i) is a word. Store this for every prefix instead of re-solving suffixes.', 'dp[i] = some dp[j] && s[j..i) is a word.'],
    2: ['The last word cannot be longer than the longest dictionary word, so only check split points within that distance.', 'Only look back L letters.']
  },
  75: {
    1: ['To turn a prefix of word1 into a prefix of word2, the last move was an insert, delete or replace (free if the letters match). Each prefix pair is stored once in a table.', 'Same letter → diagonal; else 1 + min(up, left, diagonal).'],
    2: ['Each row only needs the row above, so keep one row and the old diagonal value.', 'One row + a diag variable.']
  },
  76: {
    1: ['You need a subset summing to half the total. dp[j] says whether sum j is reachable; adding a number x makes j reachable if j − x was. Loop j downward so each number is used once.', 'Reachable sums, loop downward.'],
    2: ['A bitset stores all reachable sums as bits. Shifting left by x adds x to every reachable sum at once, 64 sums per operation.', 'bits |= bits << x.']
  },
  77: { 1: ['You do not need to know how you reach an index, only how far you can reach. Track the farthest reachable index; if you ever stand beyond it, you are stuck.', 'Track the farthest reach.'] },
  78: { 1: ['Think of BFS levels: all indices reachable with j jumps form a range. When you walk past the end of the current range you must take another jump, and the new range ends at the farthest reach seen.', 'End of the current range → jumps++.'] },
  79: { 1: ['If the total gas is at least the total cost, some start works. If the tank goes negative at station i, no station between the current start and i can be the start, so restart from i + 1.', 'Tank negative → restart after this station.'] },
  80: { 1: ['Words that share a prefix share a path from the root, one letter per edge. Lookups take O(word length) no matter how many words are stored; a flag marks where a word ends.', 'Shared prefix = shared path; flag = word ends.'] }
};
