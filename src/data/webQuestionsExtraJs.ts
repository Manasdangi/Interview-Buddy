import type { WebQuestion } from './webQuestions'

/** Second batch of JavaScript questions (merged into webQuestions). */
export const jsExtra: WebQuestion[] = [
  /* types & basics */
  {
    id: 'typeof-instanceof',
    topic: 'js',
    title: 'typeof vs instanceof vs Array.isArray',
    level: 'Basic',
    answer:
      'typeof returns a string for the primitive kind: "string", "number", "boolean", "undefined", "symbol", "bigint", "function" — and "object" for objects, arrays AND null. instanceof walks the prototype chain to check if an object was made by a constructor; it fails across iframes/realms and on primitives. Array.isArray is the reliable array check.',
    remember: 'typeof for primitives, Array.isArray for arrays, === null for null.',
    code: `typeof null            // "object"  (old bug)
typeof []              // "object"
typeof (() => {})      // "function"
[] instanceof Array    // true
Array.isArray([])      // true, works across iframes
Object.prototype.toString.call(new Date()) // "[object Date]"`,
    diagram: {
      kind: 'table',
      head: ['value', 'typeof', 'better check'],
      rows: [
        ['null', '"object"', 'x === null'],
        ['[]', '"object"', 'Array.isArray(x)'],
        ['new Date()', '"object"', 'x instanceof Date'],
        ['NaN', '"number"', 'Number.isNaN(x)'],
        ['function', '"function"', 'typeof x === "function"'],
      ],
    },
  },
  {
    id: 'short-circuit',
    topic: 'js',
    title: '&&, || and ?? return values (and ||=, &&=, ??=)',
    level: 'Basic',
    answer:
      '&& and || do not return true/false: they return one of the operands. a || b returns a if a is truthy, else b. a && b returns a if a is falsy, else b. a ?? b returns b only when a is null or undefined, so 0 and "" are kept. The assignment forms only assign when needed: x ||= y, x &&= y, x ??= y.',
    remember: '|| = first truthy, && = first falsy (or last), ?? = first not-null.',
    code: `0 || 10        // 10
0 ?? 10        // 0
'' && 'x'      // ''
user && user.name
count ??= 0    // set only if null/undefined`,
    diagram: {
      kind: 'table',
      head: ['expression', 'result'],
      rows: [
        ["'' || 'guest'", "'guest'"],
        ["'' ?? 'guest'", "''"],
        ['0 && fn()', '0 (fn never runs)'],
        ["'a' && 'b'", "'b'"],
        ['null ?? undefined ?? 3', '3'],
      ],
    },
  },
  {
    id: 'array-like',
    topic: 'js',
    title: 'Array-like objects: arguments, NodeList, Array.from',
    level: 'Core',
    answer:
      'An array-like has a length and numbered keys but no array methods: arguments, HTMLCollection, older NodeLists, strings. Convert with Array.from(x) (also takes a map function) or [...x] if it is iterable. querySelectorAll returns a static NodeList that has forEach; getElementsByClassName returns a LIVE HTMLCollection that changes as the DOM changes.',
    remember: 'Looks like an array, is not one: Array.from it.',
    code: `function sum() { return Array.from(arguments).reduce((a, b) => a + b, 0) }
const items = [...document.querySelectorAll('li')]
Array.from({ length: 3 }, (_, i) => i * 2) // [0, 2, 4]`,
    diagram: {
      kind: 'compare',
      left: { title: 'array-like', tone: 'amber', items: ['length + 0,1,2 keys', 'no map/filter', 'arguments, HTMLCollection'] },
      right: { title: 'real array', tone: 'emerald', items: ['Array.from(x)', '[...iterable]', 'all array methods'] },
    },
  },

  /* objects */
  {
    id: 'getter-defineproperty',
    topic: 'js',
    title: 'Getters, setters and Object.defineProperty',
    level: 'Core',
    answer:
      'A getter runs a function when a property is read; a setter runs when it is assigned. Object.defineProperty creates properties with fine control: writable, enumerable, configurable and get/set. Properties created this way default to all false. Vue 2 used defineProperty getters/setters for reactivity; Vue 3 switched to Proxy.',
    remember: 'A getter is a property that is secretly a function.',
    code: `const user = {
  first: 'Manas', last: 'Raj',
  get full() { return \`\${this.first} \${this.last}\` },
  set full(v) { [this.first, this.last] = v.split(' ') },
}
Object.defineProperty(user, 'id', { value: 7, writable: false, enumerable: false })`,
    diagram: {
      kind: 'table',
      head: ['descriptor', 'meaning', 'default (defineProperty)'],
      rows: [
        ['value', 'the stored value', 'undefined'],
        ['writable', 'can be reassigned', 'false'],
        ['enumerable', 'shows in for…in / keys', 'false'],
        ['configurable', 'can be deleted / redefined', 'false'],
        ['get / set', 'functions instead of value', '—'],
      ],
    },
  },
  {
    id: 'object-keys-order',
    topic: 'js',
    title: 'In what order does Object.keys return keys?',
    level: 'Advanced',
    answer:
      'Integer-like keys come first in ascending numeric order, then string keys in the order they were added, then symbols (only in Reflect.ownKeys / getOwnPropertySymbols). So an object keyed by IDs like "10", "2" comes out sorted, not in insert order. If order matters, use a Map, which always keeps insertion order.',
    remember: 'Numbers first (sorted), then strings (as inserted). Need order? Use a Map.',
    code: `Object.keys({ b: 1, 10: 1, a: 1, 2: 1 })
// ["2", "10", "b", "a"]`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'integer keys', note: 'ascending: "2", "10"', tone: 'indigo' },
        { label: 'string keys', note: 'insertion order: "b", "a"', tone: 'emerald' },
        { label: 'symbols', note: 'only via Reflect.ownKeys', tone: 'slate' },
      ],
    },
  },

  /* scope & functions */
  {
    id: 'hoisting-puzzle',
    topic: 'js',
    title: 'Output puzzle: hoisting and the TDZ',
    level: 'Core',
    answer:
      'Function declarations are hoisted with their body, so they can be called before the line. var is hoisted as undefined. let/const/class are hoisted but in the temporal dead zone until their line, so reading them throws a ReferenceError. A function expression assigned to var is undefined before its line, so calling it throws a TypeError.',
    remember: 'function = fully ready, var = undefined, let/const = do not touch (TDZ).',
    code: `// what does each line print, if run on its own at the top?
console.log(a)    // undefined
console.log(sum(1, 2)) // 3
console.log(b)    // ReferenceError (TDZ)
greet()           // TypeError: greet is not a function

var a = 1
let b = 2
function sum(x, y) { return x + y }
var greet = function () {}`,
    diagram: {
      kind: 'table',
      head: ['declared with', 'used before its line'],
      rows: [
        ['function f() {}', 'works'],
        ['var x', 'undefined'],
        ['let / const / class', 'ReferenceError (TDZ)'],
        ['var f = function () {}', 'TypeError: not a function'],
      ],
    },
  },
  {
    id: 'this-puzzle',
    topic: 'js',
    title: 'Output puzzle: losing `this`',
    level: 'Core',
    answer:
      'this is set by HOW a function is called. Calling obj.method() gives this = obj, but passing obj.method as a callback (setTimeout, an event handler, a destructured variable) calls it without obj, so this is undefined (strict mode) or window. Arrow functions take this from the surrounding scope, so an arrow as an object method does not get the object. Fix with bind, an arrow wrapper, or a class field arrow.',
    remember: 'Look at the call site, not where the function was written.',
    code: `const user = {
  name: 'Manas',
  hi() { return this.name },
  arrow: () => this?.name,
}
user.hi()               // 'Manas'
const { hi } = user; hi() // undefined (lost this)
setTimeout(user.hi)     // undefined
user.arrow()            // undefined (outer this)
setTimeout(() => user.hi()) // 'Manas'`,
    diagram: {
      kind: 'table',
      head: ['call', 'this'],
      rows: [
        ['user.hi()', 'user'],
        ['const f = user.hi; f()', 'undefined (strict)'],
        ['setTimeout(user.hi)', 'undefined / window'],
        ['user.hi.bind(user)', 'user, always'],
        ['arrow method', 'outer scope this'],
      ],
    },
  },

  /* async */
  {
    id: 'callbacks-to-promises',
    topic: 'js',
    title: 'Callbacks vs promises vs async/await',
    level: 'Basic',
    answer:
      'Callbacks pass a function to call later; nesting several gives "callback hell" and every step must handle its own error. Promises represent a future value, can be chained flat with .then and send any error to one .catch. async/await is syntax over promises that reads top to bottom and uses try/catch. All three are still asynchronous — await only pauses the current function, not the thread.',
    remember: 'Callback = "call me back", promise = "a receipt for a future value", await = "wait for the receipt here".',
    code: `// callbacks
getUser(id, (err, user) => { getOrders(user, (err, orders) => { /* … */ }) })

// promises
getUser(id).then(getOrders).then(show).catch(handle)

// async/await
try { const user = await getUser(id); show(await getOrders(user)) } catch (e) { handle(e) }`,
    diagram: {
      kind: 'compare',
      left: { title: 'callbacks', tone: 'rose', items: ['nesting grows right', 'error checked at every level', 'easy to call twice'] },
      right: { title: 'promise / await', tone: 'emerald', items: ['flat chain', 'one catch / try-catch', 'settles exactly once'] },
    },
  },
  {
    id: 'settimeout-setinterval',
    topic: 'js',
    title: 'setTimeout vs setInterval (and why timers drift)',
    level: 'Core',
    answer:
      'setTimeout runs once after AT LEAST the delay; setInterval queues the callback every N ms. Delays are minimums: the callback waits for the call stack to be empty, nested timers clamp to ~4 ms, and background tabs slow timers to 1 s or more. setInterval does not wait for slow work, so callbacks can bunch up; a recursive setTimeout schedules the next run only after the current one finishes. For accurate countdowns, compute from Date.now() instead of counting ticks.',
    remember: 'The delay is "not before", never "exactly at".',
    code: `// safer than setInterval for async work
async function poll() {
  await fetchStatus()
  timer = setTimeout(poll, 5000) // next run after this one finishes
}

// accurate countdown
const end = Date.now() + 60_000
setInterval(() => render(Math.max(0, end - Date.now())), 250)`,
    diagram: {
      kind: 'timeline',
      max: 12,
      rows: [
        { title: 'setInterval(3)', segs: [{ from: 0, to: 2, label: 'run', tone: 'amber' }, { from: 3, to: 5, label: 'run', tone: 'amber' }, { from: 6, to: 8, label: 'run', tone: 'amber' }, { from: 9, to: 11, label: 'run', tone: 'amber' }] },
        { title: 'recursive setTimeout(3)', segs: [{ from: 0, to: 2, label: 'run', tone: 'emerald' }, { from: 5, to: 7, label: 'run', tone: 'emerald' }, { from: 10, to: 12, label: 'run', tone: 'emerald' }] },
      ],
    },
  },
  {
    id: 'async-order-puzzle',
    topic: 'js',
    title: 'Output puzzle: what runs after await?',
    level: 'Advanced',
    answer:
      'An async function runs synchronously until its first await. Everything after the await is queued as a microtask, like a .then. So the sync code outside runs first, then microtasks in queue order, and setTimeout callbacks (macrotasks) only after all microtasks are done.',
    remember: 'Sync first → microtasks (await, then) → macrotasks (setTimeout).',
    code: `async function a() {
  console.log(1)
  await null
  console.log(2)
}
console.log(3)
setTimeout(() => console.log(4))
a()
Promise.resolve().then(() => console.log(5))
console.log(6)
// 3 1 6 2 5 4`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'sync (call stack)', tone: 'indigo', items: ['3', '1 (a runs until await)', '6'] },
        { title: 'microtasks', tone: 'emerald', items: ['2 (after await)', '5 (then)'] },
        { title: 'macrotasks', tone: 'amber', items: ['4 (setTimeout)'] },
      ],
    },
  },
  {
    id: 'for-await',
    topic: 'js',
    title: 'Sequential vs parallel awaits (and for await…of)',
    level: 'Advanced',
    answer:
      'await inside a for loop runs requests one after another — total time is the sum. Start them all and await Promise.all to run in parallel — total time is the slowest one. forEach with an async callback does NOT wait at all. for await…of loops over async iterables (streams, paginated APIs) one item at a time.',
    remember: 'for + await = queue, Promise.all = together, forEach + async = nobody waits.',
    code: `// sequential: 3 × 1s = 3s
for (const id of ids) await fetchUser(id)

// parallel: ~1s
const users = await Promise.all(ids.map(fetchUser))

// ❌ does not wait
ids.forEach(async (id) => await fetchUser(id))

// async iterable
for await (const chunk of response.body) process(chunk)`,
    diagram: {
      kind: 'timeline',
      max: 9,
      rows: [
        { title: 'for + await', segs: [{ from: 0, to: 3, label: 'user 1', tone: 'amber' }, { from: 3, to: 6, label: 'user 2', tone: 'amber' }, { from: 6, to: 9, label: 'user 3', tone: 'amber' }] },
        { title: 'Promise.all', segs: [{ from: 0, to: 3, label: 'all 3 at once', tone: 'emerald' }] },
      ],
    },
  },

  /* DOM & browser */
  {
    id: 'realtime-transports',
    topic: 'js',
    title: 'Polling vs long polling vs SSE vs WebSockets',
    level: 'Core',
    answer:
      'Polling asks the server every N seconds — simple but wasteful and laggy. Long polling keeps a request open until there is news, then reconnects. Server-Sent Events (EventSource) keep one HTTP connection open for server → client messages, with automatic reconnect — great for notifications and live scores. WebSockets give a full two-way connection — needed for chat, multiplayer and collaborative editing.',
    remember: 'Server talks only → SSE. Both talk → WebSocket. Rare updates → polling is fine.',
    code: `const es = new EventSource('/api/notifications')
es.onmessage = (e) => show(JSON.parse(e.data))

const ws = new WebSocket('wss://chat.example.com')
ws.onmessage = (e) => addMessage(e.data)
ws.send(JSON.stringify({ text: 'hi' }))

// short polling: ask every 5 s
setInterval(async () => render(await (await fetch('/api/status')).json()), 5000)

// long polling: server holds the request open until there is news
async function poll() {
  const res = await fetch('/api/events?since=' + last)   // waits up to ~30 s
  handle(await res.json())
  poll()                                                 // immediately ask again
}`,
    diagram: {
      kind: 'table',
      head: ['', 'direction', 'connection', 'use for'],
      rows: [
        ['polling', 'client asks', 'new request each time', 'rare updates'],
        ['long polling', 'client asks, server waits', 'held open', 'fallback'],
        ['SSE', 'server → client', 'one HTTP stream', 'notifications, feeds, AI tokens'],
        ['WebSocket', 'both ways', 'one TCP socket', 'chat, games, live cursors'],
      ],
    },
  },
  {
    id: 'mutation-resize-observer',
    topic: 'js',
    title: 'MutationObserver and ResizeObserver',
    level: 'Core',
    answer:
      'MutationObserver calls you back when the DOM changes (children added or removed, attributes, text) — useful for third-party widgets you do not control. ResizeObserver calls you back when an element\'s size changes, not just the window — perfect for components that adapt to their container, charts and auto-growing textareas. Both batch changes and run asynchronously; always disconnect() when done.',
    remember: 'Mutation = "the DOM changed", Resize = "this box changed size", Intersection = "this box is on screen".',
    code: `const ro = new ResizeObserver(([entry]) => {
  chart.resize(entry.contentRect.width)
})
ro.observe(container)

const mo = new MutationObserver((records) => console.log(records))
mo.observe(list, { childList: true, subtree: true })
// later: ro.disconnect(); mo.disconnect()`,
    diagram: {
      kind: 'table',
      head: ['observer', 'fires when', 'example'],
      rows: [
        ['MutationObserver', 'nodes / attributes change', 'react to a widget injecting HTML'],
        ['ResizeObserver', 'element size changes', 'responsive chart'],
        ['IntersectionObserver', 'element enters the viewport', 'lazy load, infinite scroll'],
      ],
    },
  },
  {
    id: 'layout-thrashing',
    topic: 'js',
    title: 'What is layout thrashing and how do you avoid it?',
    level: 'Advanced',
    answer:
      'Reading layout (offsetHeight, getBoundingClientRect, scrollTop) after writing styles forces the browser to recalculate layout immediately. Doing read-write-read-write in a loop forces a layout every iteration. Batch all reads first, then all writes; put DOM changes in requestAnimationFrame; build many nodes in a DocumentFragment and insert once; animate transform/opacity instead of size.',
    remember: 'Read all, then write all. Never read right after a write in a loop.',
    code: `// ❌ forces layout 100 times
items.forEach((el) => { el.style.width = el.offsetWidth + 10 + 'px' })

// ✅ read everything, then write
const widths = items.map((el) => el.offsetWidth)
items.forEach((el, i) => { el.style.width = widths[i] + 10 + 'px' })

// batch writes in the next frame
requestAnimationFrame(() => {
  items.forEach((el, i) => { el.style.width = widths[i] + 10 + 'px' })
})
// getBoundingClientRect() forces layout too
const { height } = el.getBoundingClientRect()`,
    diagram: {
      kind: 'compare',
      left: { title: 'thrashing', tone: 'rose', items: ['write width', 'read offsetWidth → layout!', 'write, read → layout!', '× every item'] },
      right: { title: 'batched', tone: 'emerald', items: ['read all widths', 'write all widths', 'one layout'] },
    },
  },
  {
    id: 'postmessage',
    topic: 'js',
    title: 'postMessage and structured clone',
    level: 'Advanced',
    answer:
      'postMessage sends data between windows, iframes, tabs (via BroadcastChannel) and workers. The data is copied with the structured clone algorithm: it handles Maps, Sets, Dates, typed arrays and circular references, but not functions or DOM nodes. When receiving from another window, always check event.origin; when sending, pass an exact targetOrigin instead of "*". Large ArrayBuffers can be transferred instead of copied.',
    remember: 'postMessage copies, never shares — and always check who sent it.',
    code: `iframe.contentWindow.postMessage({ type: 'theme', value: 'dark' }, 'https://widget.example.com')

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://app.example.com') return
  handle(e.data)
})

const copy = structuredClone(state) // same algorithm, deep copy`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'postMessage(data, origin)', tone: 'indigo' },
        { label: 'structured clone (copy)', note: 'no functions, no DOM', tone: 'amber' },
        { label: 'message event', tone: 'cyan' },
        { label: 'check e.origin', note: 'then use e.data', tone: 'emerald' },
      ],
    },
  },

  /* implement it */
  {
    id: 'implement-once',
    topic: 'js',
    title: 'Implement once()',
    level: 'Basic',
    answer:
      'Return a wrapper that calls the original function the first time, saves the result, and returns that saved result on every later call without running the function again. Keep this and arguments with apply. Used for init code, analytics events and payment buttons.',
    remember: 'A flag plus a saved result in a closure.',
    code: `function once(fn) {
  let called = false
  let result
  return function (...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}

const init = once(() => console.log('init'))
init(); init() // logs once`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'call 1', tone: 'indigo' },
        { label: 'called = false → run fn', tone: 'emerald' },
        { label: 'save result, called = true', tone: 'amber' },
        { label: 'call 2+ → return saved result', tone: 'slate' },
      ],
    },
  },
  {
    id: 'implement-deep-clone',
    topic: 'js',
    title: 'Implement deepClone (with circular references)',
    level: 'Core',
    answer:
      'Return primitives as they are. For objects and arrays create an empty copy and recursively clone each own key. Keep a WeakMap from original to copy so circular references point to the copy instead of recursing forever. Handle Date and Map/Set if asked. In real code, structuredClone does all of this.',
    remember: 'Recurse, and remember what you already copied (WeakMap) to survive cycles.',
    code: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value)
  if (seen.has(value)) return seen.get(value)

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
  seen.set(value, copy)
  for (const key of Reflect.ownKeys(value)) {
    copy[key] = deepClone(value[key], seen)
  }
  return copy
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'primitive? → return it', tone: 'slate' },
        { label: 'seen before? → return its copy', note: 'handles cycles', tone: 'amber' },
        { label: 'make empty copy, remember it', tone: 'indigo' },
        { label: 'clone each key recursively', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'implement-flatten',
    topic: 'js',
    title: 'Implement flatten (with depth)',
    level: 'Core',
    answer:
      'Walk the array; if an item is an array and depth is left, flatten it one level deeper and spread the result in, else push the item. Built-in arr.flat(depth) does the same (flat(Infinity) for all levels). An iterative version with a stack avoids deep recursion.',
    remember: 'Array inside? Go one level deeper. Otherwise push.',
    code: `function flatten(arr, depth = Infinity) {
  const out = []
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) out.push(...flatten(item, depth - 1))
    else out.push(item)
  }
  return out
}

flatten([1, [2, [3, [4]]]], 1) // [1, 2, [3, [4]]]
flatten([1, [2, [3, [4]]]])    // [1, 2, 3, 4]`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: '[1, [2, [3, [4]]]]', tone: 'slate' },
        { label: 'depth 1 → [2, [3, [4]]]', tone: 'indigo' },
        { label: 'depth 2 → [3, [4]]', tone: 'emerald' },
        { label: 'depth 3 → [4]', note: 'result [1, 2, 3, 4]', tone: 'amber' },
      ],
    },
  },
  {
    id: 'implement-get-path',
    topic: 'js',
    title: 'Implement get(obj, "a.b[0].c", default) (lodash get)',
    level: 'Core',
    answer:
      'Turn the path into keys: replace [0] with .0 and split on dots. Walk the object one key at a time; if you hit null or undefined, stop and return the default. Return the default also when the final value is undefined. Optional chaining does this for fixed paths, but get works with paths stored as strings (forms, configs).',
    remember: 'Split the path, walk key by key, bail out on null.',
    code: `function get(obj, path, fallback) {
  const keys = Array.isArray(path) ? path : path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean)
  let cur = obj
  for (const key of keys) {
    if (cur == null) return fallback
    cur = cur[key]
  }
  return cur === undefined ? fallback : cur
}

get({ a: { b: [{ c: 3 }] } }, 'a.b[0].c')   // 3
get({ a: null }, 'a.b.c', 'none')         // 'none'`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '"a.b[0].c"', tone: 'slate' },
        { label: '["a", "b", "0", "c"]', tone: 'indigo' },
        { label: 'obj → a → b → 0 → c', tone: 'emerald' },
        { label: 'null on the way → default', tone: 'amber' },
      ],
    },
  },
  {
    id: 'implement-deep-equal',
    topic: 'js',
    title: 'Implement deepEqual',
    level: 'Advanced',
    answer:
      'If the two values are identical (Object.is), they are equal. If either is not an object, they are not. Otherwise both must be the same kind (array vs object), have the same number of own keys, and every key must be deepEqual in both. Mention edge cases: NaN equals NaN with Object.is, Dates compare by getTime, and cycles need a seen map.',
    remember: 'Same reference → yes. Primitive → compare. Object → same keys, and recurse.',
    code: `function deepEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
}`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'Object.is(a, b)', note: 'same → true', tone: 'emerald' },
        { label: 'not both objects', note: '→ false', tone: 'rose' },
        { label: 'array vs object, key count', note: 'differ → false', tone: 'amber' },
        { label: 'every key deepEqual', note: 'recurse', tone: 'indigo' },
      ],
    },
  },
  {
    id: 'implement-promisify',
    topic: 'js',
    title: 'Implement promisify',
    level: 'Core',
    answer:
      'Node-style functions take a callback last, called as (error, result). promisify returns a function that returns a new Promise, calls the original with the given arguments plus a callback, and rejects on error or resolves with the result. Keep this with call/apply.',
    remember: 'Wrap in new Promise; the callback decides resolve or reject.',
    code: `function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => (err ? reject(err) : resolve(result)))
    })
  }
}

const readFile = promisify(fs.readFile)
const text = await readFile('a.txt', 'utf8')`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'promisified(args)', tone: 'indigo' },
        { label: 'new Promise', tone: 'slate' },
        { label: 'fn(...args, callback)', tone: 'amber' },
        { label: 'err → reject · else resolve', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'implement-retry',
    topic: 'js',
    title: 'Implement retry with exponential backoff',
    level: 'Advanced',
    answer:
      'Call the async function; if it fails and attempts are left, wait and try again, doubling the wait each time (200 ms, 400 ms, 800 ms…) plus a little random jitter so many clients do not retry at the same moment. Only retry errors that can succeed later (network errors, 429, 5xx), never 400/401/404. After the last attempt, throw the last error.',
    remember: 'Try, wait, double the wait, try again — and only for errors worth retrying.',
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function retry(fn, { retries = 3, base = 200, shouldRetry = () => true } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err)) throw err
      const delay = base * 2 ** attempt + Math.random() * 100
      await sleep(delay)
    }
  }
}`,
    diagram: {
      kind: 'timeline',
      max: 16,
      rows: [
        {
          title: 'attempts',
          segs: [
            { from: 0, to: 1, label: '✗', tone: 'rose' },
            { from: 1, to: 3, label: 'wait 200', tone: 'slate' },
            { from: 3, to: 4, label: '✗', tone: 'rose' },
            { from: 4, to: 8, label: 'wait 400', tone: 'slate' },
            { from: 8, to: 9, label: '✗', tone: 'rose' },
            { from: 9, to: 15, label: 'wait 800', tone: 'slate' },
            { from: 15, to: 16, label: '✓', tone: 'emerald' },
          ],
        },
      ],
    },
  },
  {
    id: 'implement-promise-pool',
    topic: 'js',
    title: 'Run async tasks with a concurrency limit',
    level: 'Advanced',
    answer:
      'Promise.all starts everything at once, which can overload a server or hit rate limits. Instead start `limit` workers; each worker takes the next task index from a shared counter, awaits it, stores the result at that index (to keep order), and loops until no tasks remain. Return Promise.all of the workers.',
    remember: 'N workers pulling from one queue; results go back to their own index.',
    code: `async function runWithLimit(tasks, limit) {
  const results = new Array(tasks.length)
  let next = 0

  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

await runWithLimit(urls.map((u) => () => fetch(u)), 3)`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'worker 1', tone: 'indigo', items: ['task 0', 'task 3', 'task 6'] },
        { title: 'worker 2', tone: 'emerald', items: ['task 1', 'task 4'] },
        { title: 'worker 3', tone: 'amber', items: ['task 2', 'task 5'] },
      ],
    },
  },
  {
    id: 'implement-lru-cache',
    topic: 'js',
    title: 'Implement an LRU cache',
    level: 'Advanced',
    answer:
      'An LRU (least recently used) cache keeps at most N items and throws out the one used longest ago. A JavaScript Map remembers insertion order, so: on get, delete the key and set it again to move it to the end (most recent); on put, do the same, and if size is over capacity, delete the first key (map.keys().next().value). Both are O(1). The classic non-JS answer is a hash map plus a doubly linked list.',
    remember: 'Map order = usage order: touch → move to the end, evict → first key.',
    code: `class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map() }

  get(key) {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, value)       // now most recent
    return value
  }

  put(key, value) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value)
  }
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'oldest ← A B C → newest', tone: 'slate' },
        { label: 'get(A) → B C A', note: 'A moved to the end', tone: 'indigo' },
        { label: 'put(D) → B C A D', tone: 'emerald' },
        { label: 'over capacity → evict B', tone: 'rose' },
      ],
    },
  },
  {
    id: 'implement-classnames',
    topic: 'js',
    title: 'Implement classnames()',
    level: 'Basic',
    answer:
      'Accept any number of arguments. Strings and numbers are added as they are; arrays are flattened recursively; objects add each key whose value is truthy; falsy values are skipped. Join with spaces. It is a common warm-up in React interviews.',
    remember: 'Strings in, arrays recurse, objects by truthy value, falsy out.',
    code: `function classNames(...args) {
  const out = []
  for (const arg of args) {
    if (!arg) continue
    if (typeof arg === 'string' || typeof arg === 'number') out.push(arg)
    else if (Array.isArray(arg)) out.push(classNames(...arg))
    else if (typeof arg === 'object') for (const [k, v] of Object.entries(arg)) if (v) out.push(k)
  }
  return out.filter(Boolean).join(' ')
}

classNames('btn', { active: true, disabled: false }, ['lg', null]) // "btn active lg"`,
    diagram: {
      kind: 'table',
      head: ['input', 'adds'],
      rows: [
        ["'btn'", 'btn'],
        ['{ active: true, disabled: false }', 'active'],
        ["['lg', null]", 'lg'],
        ['null / false / 0 / ""', 'nothing'],
      ],
    },
  },
]
