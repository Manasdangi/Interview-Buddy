import type { WebQuestion } from './webQuestions'

/** More HTML + browser questions (merged into webQuestions). */
export const htmlMore: WebQuestion[] = [
  {
    id: 'url-to-page',
    topic: 'html',
    title: 'What happens when you type a URL and press Enter?',
    level: 'Core',
    answer:
      'The browser resolves the domain with DNS, opens a TCP connection and a TLS handshake (for HTTPS), sends an HTTP request, and gets back HTML. It then parses the HTML, requests CSS / JS / images it finds, builds the DOM and CSSOM, lays out, paints and composites — and runs JavaScript along the way.',
    points: ['Caches can short-circuit steps: DNS cache, HTTP cache, service worker.', 'HTTP/2 and HTTP/3 multiplex many requests over one connection.'],
    remember: 'DNS → TCP → TLS → HTTP → parse → render.',
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'DNS', note: 'name → IP', tone: 'indigo' },
        { label: 'TCP + TLS', note: 'connect & encrypt', tone: 'cyan' },
        { label: 'HTTP request', note: 'GET / → HTML', tone: 'amber' },
        { label: 'Parse', note: 'DOM, CSSOM, sub-resources', tone: 'fuchsia' },
        { label: 'Render', note: 'layout, paint, composite', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'block-inline-elements',
    topic: 'html',
    title: 'Block vs inline vs inline-block elements',
    level: 'Basic',
    answer:
      'Block elements (div, p, h1, section) start on a new line and take the full width; width/height and vertical margins apply. Inline elements (span, a, strong) flow inside text and ignore width/height and vertical margins. inline-block flows like text but respects width, height, padding and margin.',
    remember: 'Block = brick on its own row, inline = word in a sentence, inline-block = a word with a box size.',
    code: `span { width: 100px; }            /* ignored */
span { display: inline-block; width: 100px; } /* works */`,
    diagram: {
      kind: 'table',
      head: ['display', 'new line?', 'width / height', 'vertical margin'],
      rows: [
        ['block', 'yes, full width', 'yes', 'yes'],
        ['inline', 'no', 'ignored', 'ignored'],
        ['inline-block', 'no', 'yes', 'yes'],
      ],
    },
  },
  {
    id: 'head-meta-seo',
    topic: 'html',
    title: 'What belongs in <head>? (meta, SEO, social)',
    level: 'Basic',
    answer:
      '<head> holds information about the page, not visible content: <meta charset="utf-8"> first, the viewport meta, <title>, meta description, canonical link, stylesheets, preload hints, favicon and Open Graph / Twitter tags that control link previews.',
    remember: 'charset first, then viewport, title, description, canonical, OG tags.',
    code: `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Coin Change — DSA Atlas</title>
  <meta name="description" content="Fewest coins to make an amount." />
  <link rel="canonical" href="https://example.com/coin-change" />
  <meta property="og:image" content="https://example.com/og.png" />
</head>`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'browser', tone: 'indigo', items: ['meta charset', 'meta viewport', 'link rel=stylesheet / preload'] },
        { title: 'search engines', tone: 'emerald', items: ['title', 'meta description', 'link rel=canonical', 'structured data'] },
        { title: 'social previews', tone: 'amber', items: ['og:title  og:image', 'twitter:card'] },
      ],
    },
  },
  {
    id: 'strong-vs-b',
    topic: 'html',
    title: '<strong> vs <b>, <em> vs <i>',
    level: 'Basic',
    answer:
      'They look the same by default but mean different things. <strong> marks importance and <em> marks stress emphasis — screen readers and search engines can use that. <b> and <i> are purely stylistic offsets (a keyword, a foreign phrase, a ship name) with no extra importance.',
    remember: 'strong / em = meaning; b / i = looks only.',
    code: `<p><strong>Warning:</strong> this deletes everything.</p>
<p>I <em>really</em> mean it.</p>
<p>The word <i lang="fr">déjà vu</i>.</p>`,
    diagram: {
      kind: 'compare',
      left: { title: 'semantic', tone: 'emerald', items: ['<strong> importance', '<em> spoken stress'] },
      right: { title: 'presentational', tone: 'slate', items: ['<b> bold, no importance', '<i> italic voice, no stress'] },
    },
  },
  {
    id: 'target-blank',
    topic: 'html',
    title: 'Why add rel="noopener noreferrer" to target="_blank" links?',
    level: 'Core',
    answer:
      'A page opened with target="_blank" used to get window.opener, letting it redirect your tab to a phishing page (reverse tabnabbing). noopener cuts that link; noreferrer also hides the Referer header. Modern browsers imply noopener for _blank, but adding it is still the safe habit.',
    remember: '_blank + noopener: the new tab can\'t touch the old one.',
    code: `<a href="https://other.site" target="_blank" rel="noopener noreferrer">Docs</a>`,
    diagram: {
      kind: 'compare',
      left: { title: 'without noopener', tone: 'rose', items: ['new tab gets window.opener', 'opener.location = "evil.com"', 'your tab silently changes'] },
      right: { title: 'with noopener', tone: 'emerald', items: ['window.opener = null', 'tabs are independent', 'noreferrer hides Referer too'] },
    },
  },
  {
    id: 'iframe-sandbox',
    topic: 'html',
    title: 'iframes: risks and the sandbox attribute',
    level: 'Advanced',
    answer:
      'An iframe embeds another page. Risks: it can be slow, and YOUR page can be framed by attackers for clickjacking. sandbox on an iframe starts with everything blocked (scripts, forms, popups, same-origin) and you allow only what you need. To stop others framing you, send frame-ancestors in CSP (or X-Frame-Options).',
    remember: 'sandbox = deny all, then allow-scripts / allow-forms one by one.',
    code: `<iframe src="https://widget.example" sandbox="allow-scripts allow-forms" loading="lazy"></iframe>

Content-Security-Policy: frame-ancestors 'self'`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'sandbox (empty)', note: 'no scripts, forms, popups; unique origin', tone: 'emerald' },
        { label: '+ allow-scripts', note: 'JS runs', tone: 'cyan' },
        { label: '+ allow-forms / allow-popups', tone: 'amber' },
        { label: '+ allow-same-origin', note: 'with allow-scripts it can remove its own sandbox — avoid', tone: 'rose' },
      ],
    },
  },
  {
    id: 'picture-element',
    topic: 'html',
    title: '<picture> vs srcset — when do you need <picture>?',
    level: 'Core',
    answer:
      'srcset on <img> lets the browser choose between sizes of the SAME image. <picture> with <source> lets YOU decide: different crops for different screens (art direction) or newer formats (AVIF / WebP) with a fallback. The inner <img> is required and carries alt.',
    remember: 'srcset = browser picks a size. <picture> = you pick the file.',
    code: `<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source media="(max-width: 600px)" srcset="hero-square.jpg" />
  <img src="hero-wide.jpg" alt="Product on a desk" />
</picture>`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'source avif?', note: 'browser supports → use', tone: 'indigo' },
        { label: 'source media?', note: 'query matches → use', tone: 'cyan' },
        { label: '<img> fallback', note: 'always there, has alt', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'canvas-vs-svg',
    topic: 'html',
    title: 'Canvas vs SVG',
    level: 'Core',
    answer:
      'SVG is vector markup: every shape is a DOM node you can style, animate and attach events to, and it stays sharp at any zoom — great for icons, logos and charts with few elements. Canvas is a bitmap you draw on with JS: no DOM per shape, so it scales to thousands of moving objects (games, heavy charts) but you handle hit-testing and accessibility yourself.',
    remember: 'SVG = shapes in the DOM. Canvas = pixels you paint.',
    diagram: {
      kind: 'compare',
      left: { title: 'SVG', tone: 'emerald', items: ['vector, crisp at any size', 'each shape is a DOM node', 'CSS + events per shape', 'slows with 1000s of nodes'] },
      right: { title: 'Canvas', tone: 'amber', items: ['bitmap, resolution-bound', 'one element, draw with JS', 'manual hit-testing', 'fast for many objects'] },
    },
  },
  {
    id: 'web-components',
    topic: 'html',
    title: 'What are Web Components?',
    level: 'Advanced',
    answer:
      'Three browser standards for reusable, framework-free components: Custom Elements (define <my-card> with a class), Shadow DOM (encapsulated DOM and CSS, styles don\'t leak in or out) and <template> / <slot> (inert markup and placeholders for children).',
    remember: 'Custom element = the tag, Shadow DOM = the wall, slot = the window for children.',
    code: `class MyCard extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = '<style>p{color:teal}</style><p><slot></slot></p>'
  }
}
customElements.define('my-card', MyCard)
// <my-card>Hello</my-card>`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: '<my-card>', note: 'custom element (light DOM)', tone: 'indigo' },
        { label: '#shadow-root', note: 'own DOM + scoped CSS', tone: 'fuchsia' },
        { label: '<slot>', note: 'shows the children you passed in', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'workers',
    topic: 'html',
    title: 'Web Worker vs Service Worker',
    level: 'Advanced',
    answer:
      'A Web Worker runs JS on a background thread for heavy computation, talking to the page through postMessage; it has no DOM access. A Service Worker is a programmable network proxy that sits between the page and the network: it caches responses for offline use, handles push notifications and lives beyond a single page.',
    remember: 'Web Worker = extra brain. Service Worker = gatekeeper for the network.',
    code: `// Web Worker
const w = new Worker('crunch.js')
w.postMessage(bigArray)
w.onmessage = (e) => show(e.data)

// Service Worker
navigator.serviceWorker.register('/sw.js')
self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request) || fetch(e.request)))`,
    diagram: {
      kind: 'compare',
      left: { title: 'Web Worker', tone: 'indigo', items: ['background thread', 'CPU-heavy work', 'postMessage ↔ page', 'dies with the page'] },
      right: { title: 'Service Worker', tone: 'emerald', items: ['network proxy (fetch events)', 'offline cache, push', 'HTTPS only', 'outlives the tab'] },
    },
  },
  {
    id: 'cors',
    topic: 'html',
    title: 'Same-origin policy and CORS',
    level: 'Core',
    answer:
      'The same-origin policy stops a page from reading responses from a different origin (scheme + host + port). CORS is how a server opts in: it replies with Access-Control-Allow-Origin. For "non-simple" requests (custom headers, PUT/DELETE, JSON content type) the browser first sends an OPTIONS preflight. CORS is enforced by the browser, not the server.',
    remember: 'Same scheme + host + port = same origin. The SERVER says yes with headers; the BROWSER enforces.',
    code: `// request from https://app.com to https://api.com
OPTIONS /orders            ← preflight
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'app.com JS', note: 'fetch(api.com, PUT)', tone: 'indigo' },
        { label: 'OPTIONS preflight', note: 'may I?', tone: 'amber' },
        { label: 'Allow-Origin: app.com', note: 'server opts in', tone: 'cyan' },
        { label: 'real request', note: 'JS can read the response', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'cookie-security',
    topic: 'html',
    title: 'Cookie flags: HttpOnly, Secure, SameSite (and CSRF)',
    level: 'Advanced',
    answer:
      'HttpOnly hides the cookie from JavaScript, so XSS can\'t steal it. Secure sends it only over HTTPS. SameSite controls cross-site sending: Strict never, Lax only on top-level navigations (the default), None always (needs Secure). SameSite is the main defence against CSRF, where another site makes your browser send an authenticated request.',
    remember: 'HttpOnly vs XSS, SameSite vs CSRF, Secure vs sniffing.',
    code: `Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`,
    diagram: {
      kind: 'table',
      head: ['flag', 'does', 'protects against'],
      rows: [
        ['HttpOnly', 'no document.cookie access', 'XSS stealing the session'],
        ['Secure', 'HTTPS only', 'network sniffing'],
        ['SameSite=Lax', 'not sent on cross-site POST / fetch', 'CSRF'],
        ['SameSite=None', 'sent everywhere (needs Secure)', '— for third-party embeds'],
      ],
    },
  },
  {
    id: 'csp',
    topic: 'html',
    title: 'What is Content Security Policy (CSP)?',
    level: 'Advanced',
    answer:
      'CSP is an HTTP header that whitelists where scripts, styles, images and frames may load from. Even if an attacker injects a <script>, the browser refuses to run it unless it matches the policy. Avoid \'unsafe-inline\'; use nonces or hashes for the inline scripts you need.',
    remember: 'CSP = the bouncer list for resources. Injected script not on the list → not run.',
    code: `Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-r4nd0m';
  img-src 'self' https://cdn.example.com;
  frame-ancestors 'none'`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '<script src="evil.js">', note: 'injected via XSS', tone: 'rose' },
        { label: 'check CSP', note: 'script-src \'self\'', tone: 'amber' },
        { label: 'blocked', note: 'violation reported', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'http-caching',
    topic: 'html',
    title: 'How does HTTP caching work? (Cache-Control, ETag)',
    level: 'Advanced',
    answer:
      'Cache-Control tells the browser how long a response is fresh (max-age) and whether it may be stored (no-store) or must be revalidated (no-cache). When it is stale, the browser asks with If-None-Match (the ETag); the server answers 304 Not Modified with no body if nothing changed. Hashed file names + long max-age + immutable is the standard for static assets.',
    remember: 'Fresh → use it. Stale → ask "changed?" → 304 = reuse.',
    code: `# app.3f9a1c.js
Cache-Control: public, max-age=31536000, immutable
# index.html
Cache-Control: no-cache
ETag: "v42"`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'in cache & fresh?', note: 'max-age not over', tone: 'emerald' },
        { label: 'stale → revalidate', note: 'If-None-Match: "v42"', tone: 'amber' },
        { label: '304 Not Modified', note: 'reuse the cached body', tone: 'cyan' },
        { label: '200 + new ETag', note: 'if it changed', tone: 'indigo' },
      ],
    },
  },
  {
    id: 'dialog-popover',
    topic: 'html',
    title: 'Native <dialog> and the popover attribute',
    level: 'Core',
    answer:
      'dialog.showModal() opens a real modal: it sits in the top layer above everything, makes the rest of the page inert, traps focus, closes on Esc and has a ::backdrop. The popover attribute gives light-dismiss popups (menus, tooltips) with no JS. Both remove most hand-written modal bugs.',
    remember: 'showModal() = modal for free: top layer, focus trap, Esc.',
    code: `<dialog id="confirm">
  <form method="dialog">
    <p>Delete file?</p>
    <button value="no">Cancel</button><button value="yes">Delete</button>
  </form>
</dialog>
<button onclick="confirm.showModal()">Delete</button>

<button popovertarget="menu">Menu</button>
<div id="menu" popover>…</div>`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'showModal()', tone: 'indigo', items: ['top layer (no z-index fights)', 'rest of page inert', 'Esc closes', '::backdrop'] },
        { title: 'popover', tone: 'emerald', items: ['top layer', 'click outside closes', 'no JS needed'] },
      ],
    },
  },
  {
    id: 'tabindex',
    topic: 'html',
    title: 'tabindex: 0 vs -1 vs positive',
    level: 'Core',
    answer:
      'tabindex="0" puts a non-focusable element into the normal Tab order. tabindex="-1" makes it focusable from JS (el.focus()) but skips it when tabbing — handy for dialogs and skip-link targets. Positive values force a custom order and almost always break the natural flow, so avoid them.',
    remember: '0 = join the line, -1 = only by invitation (JS), positive = cutting the line (don\'t).',
    code: `<div role="button" tabindex="0">Custom button</div>
<h2 id="results" tabindex="-1">Results</h2>
<script>results.focus()</script>`,
    diagram: {
      kind: 'table',
      head: ['value', 'Tab reaches it?', 'el.focus() works?', 'use for'],
      rows: [
        ['0', 'yes, in DOM order', 'yes', 'custom interactive widgets'],
        ['-1', 'no', 'yes', 'moving focus programmatically'],
        ['1, 2, 3…', 'yes, before everything', 'yes', 'avoid'],
      ],
    },
  },
  {
    id: 'get-vs-post',
    topic: 'html',
    title: 'GET vs POST (and the other HTTP methods)',
    level: 'Basic',
    answer:
      'GET reads data: parameters go in the URL, it is cacheable, bookmarkable and should have no side effects. POST sends data in the body to create or trigger something; it isn\'t cached and repeating it may duplicate the action. PUT replaces, PATCH partly updates, DELETE removes. GET, PUT and DELETE are idempotent; POST is not.',
    remember: 'GET = read (URL), POST = do something (body). Idempotent = safe to retry.',
    diagram: {
      kind: 'table',
      head: ['method', 'purpose', 'body', 'idempotent', 'cacheable'],
      rows: [
        ['GET', 'read', 'no', 'yes', 'yes'],
        ['POST', 'create / action', 'yes', 'no', 'rarely'],
        ['PUT', 'replace', 'yes', 'yes', 'no'],
        ['PATCH', 'partial update', 'yes', 'not guaranteed', 'no'],
        ['DELETE', 'remove', 'optional', 'yes', 'no'],
      ],
    },
  },
]
