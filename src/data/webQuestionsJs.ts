import type { WebQuestion } from './webQuestions'

/** More JavaScript questions (merged into webQuestions). */
export const jsMore: WebQuestion[] = [
  /* basics & types */
  {
    id: 'data-types',
    topic: 'js',
    title: 'Primitive vs reference types',
    level: 'Basic',
    answer:
      'There are 7 primitives — string, number, bigint, boolean, undefined, null, symbol — which are immutable and copied by value. Everything else (objects, arrays, functions, dates) is a reference: the variable holds a pointer, so copying the variable shares the same object.',
    remember: 'Primitives are photocopies; objects are shared addresses.',
    code: `let a = 5; let b = a; b++      // a is still 5
const x = { n: 1 }; const y = x
y.n = 2                         // x.n is 2 too`,
    diagram: {
      kind: 'compare',
      left: { title: 'primitive (by value)', tone: 'indigo', items: ['string number bigint', 'boolean undefined null symbol', 'b = a copies the value'] },
      right: { title: 'reference', tone: 'amber', items: ['object array function', 'Date Map Set', 'y = x copies the pointer'] },
    },
  },
  {
    id: 'pass-by-value',
    topic: 'js',
    title: 'Is JavaScript pass-by-value or pass-by-reference?',
    level: 'Core',
    answer:
      'Always pass-by-value — but for objects the value IS a reference. So a function can mutate the object you passed in (same object), but reassigning the parameter to a new object does not change the caller\'s variable.',
    remember: 'You get a copy of the address: you can redecorate the house, not move the caller to a new one.',
    code: `function update(user) {
  user.name = 'Ravi'   // caller sees this
  user = { name: 'X' } // caller does NOT see this
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'caller: user → #A', tone: 'indigo' },
        { label: 'param: user → #A (copy)', tone: 'cyan' },
        { label: 'user.name = … changes #A', note: 'visible outside', tone: 'emerald' },
        { label: 'user = {…} → #B', note: 'caller still → #A', tone: 'rose' },
      ],
    },
  },
  {
    id: 'type-coercion',
    topic: 'js',
    title: 'Type coercion puzzles: [] + {}, \'5\' - 2, \'5\' + 2',
    level: 'Core',
    answer:
      '+ with a string concatenates, so \'5\' + 2 is \'52\'. Other maths operators convert to numbers, so \'5\' - 2 is 3. Objects are first turned into primitives (valueOf, then toString): [] becomes \'\' and {} becomes \'[object Object]\'. Unary + converts to a number.',
    remember: 'Plus loves strings; minus, times and divide love numbers.',
    code: `'5' + 2       // '52'
'5' - 2       // 3
[] + {}       // '[object Object]'
[] + []       // ''
+'42'         // 42
true + 1      // 2`,
    diagram: {
      kind: 'compare',
      left: { title: '+ with a string → concat', tone: 'amber', items: ["'5' + 2 → '52'", "[] + {} → '[object Object]'", "'1' + true → '1true'"] },
      right: { title: '- * / → numbers', tone: 'indigo', items: ["'5' - 2 → 3", "'6' * '2' → 12", "'a' - 1 → NaN"] },
    },
  },
  {
    id: 'float-precision',
    topic: 'js',
    title: 'Why is 0.1 + 0.2 !== 0.3? (and NaN)',
    level: 'Core',
    answer:
      'Numbers are 64-bit binary floating point, and 0.1 and 0.2 can\'t be stored exactly, so the sum is 0.30000000000000004. Compare with a tolerance (Number.EPSILON) or work in integers (paise, cents). NaN is the only value not equal to itself — check with Number.isNaN. Use BigInt beyond 2^53 − 1.',
    remember: 'Money in paise, compare with epsilon, NaN with Number.isNaN.',
    code: `0.1 + 0.2                    // 0.30000000000000004
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true
NaN === NaN                  // false
Number.isNaN(NaN)            // true
2 ** 53 + 1                  // 9007199254740992 (lost precision)`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'problem', tone: 'rose', items: ['0.1 + 0.2 → 0.30000000000000004', 'NaN !== NaN', '2**53 + 1 loses precision'] },
        { title: 'fix', tone: 'emerald', items: ['integers (paise)', 'Number.EPSILON compare', 'Number.isNaN', 'BigInt: 2n ** 64n'] },
      ],
    },
  },
  {
    id: 'optional-chaining',
    topic: 'js',
    title: 'Optional chaining (?.) and nullish coalescing (??)',
    level: 'Basic',
    answer:
      '?. stops and returns undefined if the value on its left is null or undefined, instead of throwing. ?? gives a fallback only for null or undefined — unlike ||, it keeps valid falsy values like 0, \'\' and false.',
    remember: '?. = "if it exists". ?? = "default only when missing".',
    code: `user?.address?.city        // undefined, no crash
user.getName?.()           // call only if it exists
const count = data.count ?? 10   // keeps 0
const count2 = data.count || 10  // turns 0 into 10 ❌`,
    diagram: {
      kind: 'table',
      head: ['left side', 'a || b', 'a ?? b'],
      rows: [
        ['undefined', 'b', 'b'],
        ['null', 'b', 'b'],
        ['0', 'b', '0'],
        ["''", 'b', "''"],
        ['false', 'b', 'false'],
      ],
    },
  },
  {
    id: 'spread-rest',
    topic: 'js',
    title: 'Destructuring, spread and rest',
    level: 'Basic',
    answer:
      'Destructuring pulls values out of arrays/objects into variables, with defaults and renaming. Spread (...) expands an iterable or object into individual items (copy, merge, pass as arguments). Rest (...) does the opposite: it collects the remaining items into an array or object.',
    remember: 'Same three dots: spread expands, rest collects.',
    code: `const { name, age = 18, city: town } = user
const [first, ...others] = [1, 2, 3]   // rest
const merged = { ...defaults, ...options } // spread
Math.max(...nums)
function log(level, ...msgs) {}`,
    diagram: {
      kind: 'compare',
      left: { title: 'spread — expand', tone: 'emerald', items: ['[...a, ...b]', '{ ...obj, x: 1 }', 'fn(...args)'] },
      right: { title: 'rest — collect', tone: 'indigo', items: ['const [x, ...rest] = arr', 'const { a, ...others } = obj', 'function f(...args)'] },
    },
  },
  {
    id: 'for-in-of',
    topic: 'js',
    title: 'for...in vs for...of (vs forEach)',
    level: 'Basic',
    answer:
      'for...in loops over enumerable property KEYS of an object (including inherited ones) — not meant for arrays. for...of loops over VALUES of any iterable (arrays, strings, Map, Set) and supports break / continue / await. forEach can\'t break and doesn\'t wait for async callbacks.',
    remember: 'in = keys, of = values.',
    code: `for (const key in { a: 1, b: 2 }) {}   // 'a', 'b'
for (const v of [10, 20]) {}            // 10, 20
for (const [k, v] of map) {}
for (const ch of 'hi') {}               // 'h', 'i'`,
    diagram: {
      kind: 'table',
      head: ['', 'gives', 'works on', 'break / await'],
      rows: [
        ['for...in', 'keys (strings)', 'objects', 'break yes, not for arrays'],
        ['for...of', 'values', 'any iterable', 'yes / yes'],
        ['forEach', 'value, index', 'arrays', 'no / no'],
      ],
    },
  },
  {
    id: 'mutating-array-methods',
    topic: 'js',
    title: 'Which array methods mutate? (and the sort() gotcha)',
    level: 'Core',
    answer:
      'push, pop, shift, unshift, splice, sort, reverse and fill change the original array. map, filter, slice, concat and the newer toSorted, toReversed, toSpliced and with return a new one — important for React state. sort() without a comparator sorts as STRINGS, so [10, 1, 2] becomes [1, 10, 2].',
    remember: 'splice mutates, slice doesn\'t. Always pass (a, b) => a - b to sort numbers.',
    code: `[10, 1, 2].sort()               // [1, 10, 2] 😬
[10, 1, 2].sort((a, b) => a - b) // [1, 2, 10]
const sorted = nums.toSorted((a, b) => a - b) // original untouched`,
    diagram: {
      kind: 'compare',
      left: { title: 'mutate (in place)', tone: 'rose', items: ['push pop shift unshift', 'splice', 'sort reverse fill'] },
      right: { title: 'return a new array', tone: 'emerald', items: ['map filter slice concat', 'toSorted toReversed', 'toSpliced with'] },
    },
  },
  {
    id: 'json-gotchas',
    topic: 'js',
    title: 'JSON.stringify gotchas',
    level: 'Core',
    answer:
      'JSON.stringify drops undefined, functions and symbols from objects (they become null in arrays), turns Dates into strings, NaN and Infinity into null, Map and Set into {}, and throws on circular references or BigInt. It also takes a replacer and an indent argument.',
    remember: 'JSON keeps only strings, numbers, booleans, null, arrays and plain objects.',
    code: `JSON.stringify({ a: undefined, f() {}, d: new Date(0), n: NaN })
// '{"d":"1970-01-01T00:00:00.000Z","n":null}'
JSON.stringify(data, null, 2)   // pretty print`,
    diagram: {
      kind: 'table',
      head: ['value', 'in an object', 'in an array'],
      rows: [
        ['undefined / function / symbol', 'dropped', 'null'],
        ['NaN / Infinity', 'null', 'null'],
        ['Date', 'ISO string', 'ISO string'],
        ['Map / Set', '{}', '{}'],
        ['circular / BigInt', 'throws', 'throws'],
      ],
    },
  },

  /* scope, functions, objects */
  {
    id: 'scope-chain',
    topic: 'js',
    title: 'Lexical scope and the scope chain',
    level: 'Core',
    answer:
      'Scope is decided by where code is WRITTEN (lexical), not where it is called. When a variable is used, JS looks in the current scope, then the enclosing one, and so on out to global; the first match wins (shadowing). Not found anywhere → ReferenceError.',
    remember: 'Look inside out, stop at the first match.',
    code: `const x = 'global'
function outer() {
  const x = 'outer'
  function inner() { return x }  // 'outer'
  return inner
}`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'global', note: 'x = "global"', tone: 'slate' },
        { label: 'outer()', note: 'x = "outer" ← found here', tone: 'emerald' },
        { label: 'inner()', note: 'uses x → not here, look outward', tone: 'indigo' },
      ],
    },
  },
  {
    id: 'execution-context',
    topic: 'js',
    title: 'Execution context and the call stack',
    level: 'Core',
    answer:
      'Every function call creates an execution context (its variables, scope chain and this) and pushes it on the call stack; when the function returns it is popped. JS has one call stack, so long synchronous work blocks everything; unbounded recursion overflows it.',
    remember: 'Call = push a plate, return = pop the plate. One stack, one thing at a time.',
    code: `function a() { b() }
function b() { c() }
function c() { console.trace() }
a()   // stack: c ← b ← a ← global`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'c()', note: 'top: running now', tone: 'emerald' },
        { label: 'b()', note: 'waiting for c', tone: 'cyan' },
        { label: 'a()', note: 'waiting for b', tone: 'indigo' },
        { label: 'global context', note: 'bottom', tone: 'slate' },
      ],
    },
  },
  {
    id: 'iife',
    topic: 'js',
    title: 'What is an IIFE and why was it used?',
    level: 'Basic',
    answer:
      'An Immediately Invoked Function Expression runs as soon as it is defined. Before let/const and modules, it was the way to create a private scope so variables didn\'t leak into the global object. Today block scope and ES modules do the same job.',
    remember: 'Wrap it, call it, nothing leaks.',
    code: `(function () {
  var secret = 42      // not global
})()

const counter = (() => { let n = 0; return () => ++n })()`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '( function … )', note: 'make it an expression', tone: 'indigo' },
        { label: '()', note: 'call it immediately', tone: 'amber' },
        { label: 'private scope', note: 'no globals leaked', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'higher-order-pure',
    topic: 'js',
    title: 'Higher-order functions and pure functions',
    level: 'Basic',
    answer:
      'A higher-order function takes a function as an argument or returns one (map, filter, debounce, React HOCs). A pure function always returns the same output for the same input and has no side effects (no mutation, network, DOM, random) — easy to test, cache and reason about.',
    remember: 'HOF = functions as values. Pure = same in, same out, touches nothing else.',
    code: `const twice = fn => x => fn(fn(x))      // higher-order
const add = (a, b) => a + b             // pure
let total = 0; const addToTotal = x => (total += x) // impure`,
    diagram: {
      kind: 'compare',
      left: { title: 'pure', tone: 'emerald', items: ['same input → same output', 'no mutation', 'easy to memoise & test'] },
      right: { title: 'impure', tone: 'amber', items: ['reads/changes outside state', 'Date.now(), Math.random()', 'fetch, DOM, console'] },
    },
  },
  {
    id: 'new-keyword',
    topic: 'js',
    title: 'What does the new keyword do?',
    level: 'Core',
    answer:
      'new Fn(args) creates an empty object, links its prototype to Fn.prototype, runs Fn with this bound to that object, and returns the object — unless Fn explicitly returns another object.',
    remember: 'Create, link, call, return.',
    code: `function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype)
  const result = Fn.apply(obj, args)
  return result instanceof Object ? result : obj
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'create {}', tone: 'indigo' },
        { label: 'link __proto__', note: '= Fn.prototype', tone: 'cyan' },
        { label: 'call Fn', note: 'this = new object', tone: 'amber' },
        { label: 'return it', note: 'unless Fn returns an object', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'classes',
    topic: 'js',
    title: 'Classes: private fields, static, getters, extends/super',
    level: 'Core',
    answer:
      'class is syntax over prototypes. #private fields are truly private (not reachable outside the class). static members live on the class itself, not on instances. get/set define computed properties. extends sets up the prototype chain and super() must be called before using this in a subclass constructor.',
    remember: '# = private, static = on the class, super() before this.',
    code: `class Account {
  #balance = 0
  static count = 0
  constructor(owner) { this.owner = owner; Account.count++ }
  get balance() { return this.#balance }
  deposit(x) { this.#balance += x }
}
class Savings extends Account {
  constructor(owner) { super(owner); this.rate = 0.04 }
}`,
    diagram: {
      kind: 'table',
      head: ['feature', 'lives on', 'reachable from outside?'],
      rows: [
        ['#balance', 'each instance', 'no (SyntaxError)'],
        ['deposit()', 'Account.prototype', 'yes'],
        ['static count', 'Account itself', 'Account.count'],
        ['get balance', 'prototype (accessor)', 'yes, read like a field'],
      ],
    },
  },
  {
    id: 'freeze-seal',
    topic: 'js',
    title: 'Object.freeze vs Object.seal vs const',
    level: 'Core',
    answer:
      'const only stops reassigning the variable. Object.seal stops adding or deleting properties but lets you change existing ones. Object.freeze stops all of that — but only at the top level (shallow); nested objects stay mutable unless you freeze them too.',
    remember: 'const locks the name, seal locks the shape, freeze locks the values (one level).',
    code: `const cfg = Object.freeze({ api: '/v1', nested: { a: 1 } })
cfg.api = '/v2'      // ignored (throws in strict mode)
cfg.nested.a = 2     // works — freeze is shallow`,
    diagram: {
      kind: 'table',
      head: ['', 'reassign var', 'add / delete props', 'change values'],
      rows: [
        ['const', 'no', 'yes', 'yes'],
        ['Object.seal', 'yes', 'no', 'yes'],
        ['Object.freeze', 'yes', 'no', 'no (shallow)'],
      ],
    },
  },
  {
    id: 'map-set-weakmap',
    topic: 'js',
    title: 'Map/Set vs Object/Array, and WeakMap',
    level: 'Core',
    answer:
      'Map keeps insertion order, accepts any key type (objects too), has .size and is faster for frequent adds/deletes. Set stores unique values. WeakMap and WeakSet hold object keys weakly: when nothing else references the key it can be garbage collected — ideal for caching metadata about DOM nodes or objects without leaking memory. Weak collections aren\'t iterable.',
    remember: 'Map = object with any key; Set = unique list; Weak = doesn\'t keep things alive.',
    code: `const seen = new Set([1, 2, 2])     // {1, 2}
const meta = new Map([[domNode, { clicks: 0 }]])
const cache = new WeakMap()
cache.set(user, expensiveResult)   // freed when user is gone`,
    diagram: {
      kind: 'table',
      head: ['', 'keys', 'ordered', 'size', 'GC-friendly'],
      rows: [
        ['Object', 'strings / symbols', 'mostly', 'Object.keys().length', '—'],
        ['Map', 'anything', 'insertion order', '.size', 'no'],
        ['Set', 'unique values', 'insertion order', '.size', 'no'],
        ['WeakMap', 'objects only', 'not iterable', '—', 'yes'],
      ],
    },
  },
  {
    id: 'symbol-iterator-generator',
    topic: 'js',
    title: 'Symbols, iterators and generators',
    level: 'Advanced',
    answer:
      'A Symbol is a unique, non-string key — used for hidden properties and protocols like Symbol.iterator. An object is iterable if it has [Symbol.iterator]() returning { next() → { value, done } }. A generator function* produces such an iterator for you: each yield pauses and hands out a value, and it resumes on the next call.',
    remember: 'yield = pause and hand over one value. for...of keeps calling next().',
    code: `function* ids() {
  let i = 1
  while (true) yield i++
}
const gen = ids()
gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }`,
    diagram: {
      kind: 'timeline',
      max: 9,
      rows: [
        { title: 'caller', segs: [{ from: 0, to: 1, label: 'next()', tone: 'indigo' }, { from: 3, to: 4, label: 'next()', tone: 'indigo' }, { from: 6, to: 7, label: 'next()', tone: 'indigo' }] },
        { title: 'generator', segs: [{ from: 1, to: 2.5, label: 'yield 1', tone: 'emerald' }, { from: 4, to: 5.5, label: 'yield 2', tone: 'emerald' }, { from: 7, to: 8.5, label: 'yield 3', tone: 'emerald' }] },
      ],
    },
  },
  {
    id: 'proxy-reflect',
    topic: 'js',
    title: 'What are Proxy and Reflect?',
    level: 'Advanced',
    answer:
      'A Proxy wraps an object and intercepts operations on it — get, set, has, deleteProperty and more — through "traps". Reflect provides the default behaviour for each trap, so a trap can add logic and then forward. Vue 3 reactivity, validation layers and logging are built this way.',
    remember: 'Proxy = a receptionist in front of the object. Reflect = "now do the normal thing".',
    code: `const user = new Proxy({}, {
  set(target, key, value) {
    if (key === 'age' && value < 0) throw new Error('bad age')
    return Reflect.set(target, key, value)
  },
})`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'user.age = 5', tone: 'indigo' },
        { label: 'set trap', note: 'validate / log / track', tone: 'amber' },
        { label: 'Reflect.set', note: 'default behaviour', tone: 'cyan' },
        { label: 'target updated', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'strict-mode',
    topic: 'js',
    title: 'What does "use strict" change?',
    level: 'Basic',
    answer:
      'Strict mode turns silent mistakes into errors: assigning to an undeclared variable throws, writing to read-only properties throws, duplicate parameter names are banned, and this is undefined (not window) in plain function calls. ES modules and class bodies are strict automatically.',
    remember: 'Strict = fewer silent bugs. Modules and classes are already strict.',
    code: `'use strict'
total = 10        // ReferenceError (no accidental global)
function f() { return this }
f()               // undefined`,
    diagram: {
      kind: 'compare',
      left: { title: 'sloppy mode', tone: 'rose', items: ['typo creates a global', 'this = window in f()', 'failed writes are silent'] },
      right: { title: 'strict mode', tone: 'emerald', items: ['ReferenceError', 'this = undefined', 'TypeError on bad writes'] },
    },
  },

  /* async */
  {
    id: 'promise-states',
    topic: 'js',
    title: 'Promise states, chaining and error propagation',
    level: 'Core',
    answer:
      'A promise is pending, then settles once as fulfilled or rejected. Each .then returns a NEW promise resolved with whatever the callback returns (a returned promise is waited for). A thrown error or rejection skips the following .then handlers until the nearest .catch; .finally runs either way. Promises fixed "callback hell" by flattening nested callbacks into a chain.',
    remember: 'Return to pass a value down the chain; throw to jump to catch.',
    code: `fetchUser()
  .then(user => fetchOrders(user.id))   // returned promise is awaited
  .then(orders => render(orders))
  .catch(err => showError(err))         // any step above
  .finally(() => hideSpinner())`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'pending', tone: 'slate' },
        { label: 'fulfilled → .then', tone: 'emerald' },
        { label: 'throw / reject → skip to .catch', tone: 'rose' },
        { label: '.finally', note: 'always', tone: 'indigo' },
      ],
    },
  },
  {
    id: 'output-puzzle',
    topic: 'js',
    title: 'Output puzzle: async/await + setTimeout + promises',
    level: 'Advanced',
    answer:
      'Run all synchronous code first (including the part of an async function before its first await). Then drain microtasks in order: promise callbacks and code after await. Then run macrotasks such as setTimeout.',
    remember: 'Sync → microtasks (then / after-await) → timers.',
    code: `console.log(1)
setTimeout(() => console.log(2), 0)
async function f() {
  console.log(3)
  await null
  console.log(4)
}
f()
Promise.resolve().then(() => console.log(5))
console.log(6)
// 1 3 6 4 5 2`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'sync', tone: 'indigo', items: ['1', '3 (f runs until await)', '6'] },
        { title: 'microtasks (FIFO)', tone: 'emerald', items: ['4 (after await, queued first)', '5 (.then)'] },
        { title: 'macrotask', tone: 'amber', items: ['2 (setTimeout)'] },
      ],
    },
  },
  {
    id: 'var-loop-timeout',
    topic: 'js',
    title: 'Classic: setTimeout inside a for loop with var vs let',
    level: 'Core',
    answer:
      'With var there is ONE i shared by every callback; the timeouts run after the loop finished, when i is 3, so it prints 3 3 3. let creates a fresh binding per iteration, so each callback closes over its own i: 0 1 2. The old fix was an IIFE or passing i as setTimeout\'s third argument.',
    remember: 'var = one shared box, let = a new box every lap.',
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))  // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i))  // 0 1 2`,
    diagram: {
      kind: 'compare',
      left: { title: 'var i', tone: 'rose', items: ['one i for all 3 callbacks', 'loop ends with i = 3', '→ 3 3 3'] },
      right: { title: 'let i', tone: 'emerald', items: ['new i each iteration', 'callbacks keep 0, 1, 2', '→ 0 1 2'] },
    },
  },
  {
    id: 'fetch-abort',
    topic: 'js',
    title: 'fetch: errors, timeouts and AbortController',
    level: 'Core',
    answer:
      'fetch only rejects on network failure — a 404 or 500 still resolves, so check response.ok. To cancel (a stale search, a component unmounting, a timeout) pass an AbortController signal and call abort(); the promise rejects with an AbortError. AbortSignal.timeout(ms) gives a ready-made timeout.',
    remember: 'fetch resolves on 404 — check res.ok. Cancel with a signal.',
    code: `const controller = new AbortController()
const res = await fetch('/api/search?q=re', { signal: controller.signal })
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
// later: controller.abort()

await fetch(url, { signal: AbortSignal.timeout(5000) })`,
    diagram: {
      kind: 'table',
      head: ['situation', 'fetch promise', 'you should'],
      rows: [
        ['200 OK', 'resolves', 'await res.json()'],
        ['404 / 500', 'resolves (ok = false)', 'check res.ok and throw'],
        ['offline / DNS / CORS', 'rejects (TypeError)', 'catch'],
        ['controller.abort()', 'rejects (AbortError)', 'ignore quietly'],
      ],
    },
  },
  {
    id: 'raf',
    topic: 'js',
    title: 'requestAnimationFrame vs setTimeout for animation',
    level: 'Advanced',
    answer:
      'requestAnimationFrame runs your callback right before the next paint, in sync with the display refresh (usually 60 Hz), and pauses in background tabs. setTimeout runs on its own clock, can fire mid-frame and drift, which causes jank. Use rAF for visual updates and batch DOM reads before writes inside it.',
    remember: 'rAF = "just before the next frame". Animate there.',
    code: `function tick(time) {
  box.style.transform = \`translateX(\${(time / 10) % 300}px)\`
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)`,
    diagram: {
      kind: 'timeline',
      max: 12,
      rows: [
        { title: 'frames (16ms)', segs: [0, 3, 6, 9].map((x) => ({ from: x + 2.4, to: x + 3, label: 'paint', tone: 'slate' as const })) },
        { title: 'rAF', segs: [0, 3, 6, 9].map((x) => ({ from: x + 1.6, to: x + 2.4, label: 'cb', tone: 'emerald' as const })) },
        { title: 'setTimeout', segs: [0.5, 4.1, 7.2, 10.6].map((x) => ({ from: x, to: x + 0.8, label: 'cb', tone: 'amber' as const })) },
      ],
    },
  },

  /* DOM & browser APIs */
  {
    id: 'intersection-observer',
    topic: 'js',
    title: 'IntersectionObserver (lazy loading, infinite scroll)',
    level: 'Core',
    answer:
      'IntersectionObserver tells you asynchronously when an element enters or leaves the viewport (or a container), without scroll listeners and layout reads on every scroll. Use it for lazy images, infinite scroll sentinels, "seen" analytics and reveal-on-scroll animations.',
    remember: 'Don\'t poll on scroll — let the browser tell you when it\'s visible.',
    code: `const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) loadMore() })
}, { rootMargin: '200px' })
io.observe(document.querySelector('#sentinel'))`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'observe(#sentinel)', tone: 'indigo' },
        { label: 'user scrolls', tone: 'slate' },
        { label: 'enters viewport + 200px', note: 'isIntersecting', tone: 'amber' },
        { label: 'loadMore()', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'history-api',
    topic: 'js',
    title: 'How does client-side routing work? (History API)',
    level: 'Core',
    answer:
      'history.pushState(state, \'\', url) changes the URL without a page load; the router then renders the matching component. Back/forward fire popstate, which the router listens to. The server must return index.html for every app route (a rewrite), otherwise a refresh on /dashboard gives 404.',
    remember: 'pushState changes the URL, popstate handles Back, the server rewrites to index.html.',
    code: `link.addEventListener('click', (e) => {
  e.preventDefault()
  history.pushState({}, '', '/dashboard')
  render(location.pathname)
})
window.addEventListener('popstate', () => render(location.pathname))`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'click <Link>', tone: 'indigo' },
        { label: 'pushState("/dashboard")', note: 'no reload', tone: 'cyan' },
        { label: 'router renders', tone: 'emerald' },
        { label: 'Back button → popstate', tone: 'amber' },
      ],
    },
  },
  {
    id: 'custom-events',
    topic: 'js',
    title: 'preventDefault vs stopPropagation, and custom events',
    level: 'Core',
    answer:
      'preventDefault() stops the browser\'s default action (following a link, submitting a form, checking a box) but the event still bubbles. stopPropagation() stops the bubbling but the default still happens. You can dispatch your own events with new CustomEvent(name, { detail, bubbles: true }).',
    remember: 'preventDefault = "browser, don\'t do your thing". stopPropagation = "parents, don\'t hear this".',
    code: `form.addEventListener('submit', (e) => { e.preventDefault(); save() })

el.dispatchEvent(new CustomEvent('cart:add', { detail: { id: 7 }, bubbles: true }))
document.addEventListener('cart:add', (e) => console.log(e.detail.id))`,
    diagram: {
      kind: 'table',
      head: ['', 'default action', 'bubbling to parents'],
      rows: [
        ['preventDefault()', 'stopped', 'continues'],
        ['stopPropagation()', 'happens', 'stopped'],
        ['both', 'stopped', 'stopped'],
      ],
    },
  },

  /* machine-coding / polyfills */
  {
    id: 'throttle-impl',
    topic: 'js',
    title: 'Implement throttle',
    level: 'Core',
    answer:
      'Run the function immediately, then ignore calls until the wait has passed. A timestamp version is the simplest; production versions also run once more at the end (trailing) with the latest arguments.',
    remember: 'Remember the last run time; if not enough time passed, skip.',
    code: `function throttle(fn, wait) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn.apply(this, args)
    }
  }
}`,
    diagram: {
      kind: 'timeline',
      max: 10,
      rows: [
        { title: 'calls', segs: [0, 1, 2, 3, 4, 5, 6, 7].map((x) => ({ from: x, to: x + 0.5, label: '•', tone: 'slate' as const })) },
        { title: 'throttle(3)', segs: [0, 3, 6].map((x) => ({ from: x, to: x + 0.9, label: 'run', tone: 'emerald' as const })) },
      ],
    },
  },
  {
    id: 'memoize',
    topic: 'js',
    title: 'Implement memoize',
    level: 'Core',
    answer:
      'Wrap a pure function with a cache keyed by its arguments: return the cached result on a hit, compute and store it on a miss. A Map with a serialised key works for primitives; for object arguments use a WeakMap or a custom key function.',
    remember: 'Seen these arguments before? Return the saved answer.',
    code: `function memoize(fn) {
  const cache = new Map()
  return function (...args) {
    const key = JSON.stringify(args)
    if (!cache.has(key)) cache.set(key, fn.apply(this, args))
    return cache.get(key)
  }
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'call(5)', tone: 'indigo' },
        { label: 'cache has "[5]"?', tone: 'amber' },
        { label: 'yes → return saved', tone: 'emerald' },
        { label: 'no → compute, save, return', tone: 'cyan' },
      ],
    },
  },
  {
    id: 'polyfill-bind',
    topic: 'js',
    title: 'Polyfill Function.prototype.bind',
    level: 'Advanced',
    answer:
      'bind returns a new function that calls the original with a fixed this and any pre-filled arguments, followed by the arguments given later. (A full polyfill also handles being called with new.)',
    remember: 'Save fn, this and early args; return a function that merges args and calls apply.',
    code: `Function.prototype.myBind = function (ctx, ...early) {
  const fn = this
  return function (...late) {
    return fn.apply(ctx, [...early, ...late])
  }
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'greet.myBind(user, "Hi")', tone: 'indigo' },
        { label: 'closure keeps fn, ctx, ["Hi"]', tone: 'amber' },
        { label: 'later bound("!")', tone: 'cyan' },
        { label: 'fn.apply(user, ["Hi", "!"])', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'polyfill-promise-all',
    topic: 'js',
    title: 'Polyfill Promise.all',
    level: 'Advanced',
    answer:
      'Return a new promise. Resolve every input with Promise.resolve (so plain values work), store each result at its own index to keep order, count completions, resolve when the count reaches the length, and reject on the first failure. An empty array resolves to [] immediately.',
    remember: 'Keep order by index, count finishes, reject on the first error.',
    code: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = []
    let done = 0
    if (items.length === 0) return resolve([])
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value
        if (++done === items.length) resolve(results)
      }, reject)
    })
  })
}`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'inputs', tone: 'indigo', items: ['p0 (slow)', 'p1 (fast)', 'p2'] },
        { title: 'results[i]', tone: 'cyan', items: ['results[1] first', 'results[2]', 'results[0] last'] },
        { title: 'outcome', tone: 'emerald', items: ['done === 3 → resolve', 'any reject → reject once'] },
      ],
    },
  },
  {
    id: 'polyfill-map-reduce',
    topic: 'js',
    title: 'Polyfill Array.prototype.map and reduce',
    level: 'Core',
    answer:
      'map: create a new array, call the callback with (item, index, array) for each existing index, store the result. reduce: start from the initial value (or the first item when none is given — and throw on an empty array without one), then fold each item into the accumulator.',
    remember: 'map = new array, same length. reduce = carry an accumulator through.',
    code: `Array.prototype.myMap = function (cb, thisArg) {
  const out = new Array(this.length)
  for (let i = 0; i < this.length; i++) {
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this)
  }
  return out
}

Array.prototype.myReduce = function (cb, init) {
  let i = 0, acc = init
  if (arguments.length < 2) {
    if (!this.length) throw new TypeError('Reduce of empty array with no initial value')
    acc = this[i++]
  }
  for (; i < this.length; i++) acc = cb(acc, this[i], i, this)
  return acc
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'acc = init (0)', tone: 'slate' },
        { label: '+ 100 → 100', tone: 'indigo' },
        { label: '+ 250 → 350', tone: 'cyan' },
        { label: '+ 40 → 390', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'event-emitter',
    topic: 'js',
    title: 'Implement an event emitter (pub/sub)',
    level: 'Core',
    answer:
      'Keep a map from event name to a list of listeners. on adds a listener (return an unsubscribe function), off removes it, emit calls every listener with the arguments, and once wraps a listener so it removes itself after the first call.',
    remember: 'A dictionary of arrays: name → [listeners].',
    code: `class Emitter {
  #map = new Map()
  on(name, fn) {
    if (!this.#map.has(name)) this.#map.set(name, new Set())
    this.#map.get(name).add(fn)
    return () => this.off(name, fn)
  }
  off(name, fn) { this.#map.get(name)?.delete(fn) }
  emit(name, ...args) { this.#map.get(name)?.forEach((fn) => fn(...args)) }
  once(name, fn) { const off = this.on(name, (...a) => { off(); fn(...a) }) }
}`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'on("login", fn)', tone: 'indigo', items: ['login → { fnA, fnB }', 'logout → { fnC }'] },
        { title: 'emit("login", user)', tone: 'emerald', items: ['fnA(user)', 'fnB(user)'] },
        { title: 'off / unsubscribe', tone: 'rose', items: ['remove fnB from the set'] },
      ],
    },
  },
  {
    id: 'compose-pipe',
    topic: 'js',
    title: 'compose vs pipe',
    level: 'Core',
    answer:
      'Both chain functions so the output of one is the input of the next. pipe runs left to right (reads like a recipe); compose runs right to left (like math f(g(x))). Both are a one-line reduce.',
    remember: 'pipe → reading order, compose ← math order.',
    code: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)

const slug = pipe(trim, toLower, (s) => s.replace(/\\s+/g, '-'))
slug('  Coin Change ')   // 'coin-change'`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '"  Coin Change "', tone: 'slate' },
        { label: 'trim', note: '"Coin Change"', tone: 'indigo' },
        { label: 'toLower', note: '"coin change"', tone: 'cyan' },
        { label: 'spaces → -', note: '"coin-change"', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'error-handling',
    topic: 'js',
    title: 'Error handling: try/catch/finally, custom errors, unhandled rejections',
    level: 'Core',
    answer:
      'try/catch catches synchronous errors and awaited rejections; it does NOT catch errors thrown later inside a setTimeout callback. finally always runs. Extend Error for meaningful types and use cause to keep the original error. Listen to window "error" and "unhandledrejection" (and React error boundaries) for anything that slips through.',
    remember: 'catch only what you await; report the rest globally.',
    code: `class HttpError extends Error {
  constructor(status, options) { super(\`HTTP \${status}\`, options); this.status = status }
}
try {
  const res = await fetch(url)
  if (!res.ok) throw new HttpError(res.status)
} catch (err) {
  throw new Error('Loading orders failed', { cause: err })
} finally {
  setLoading(false)
}
window.addEventListener('unhandledrejection', (e) => report(e.reason))`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'try / catch sees', tone: 'emerald', items: ['throw in the block', 'await rejected promise'] },
        { title: 'try / catch misses', tone: 'rose', items: ['throw inside setTimeout cb', 'promise you didn\'t await'] },
        { title: 'global safety net', tone: 'indigo', items: ['window.onerror', 'unhandledrejection', 'React error boundary'] },
      ],
    },
  },
]
