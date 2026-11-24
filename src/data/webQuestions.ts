import type { Diagram } from '../components/web/WebDiagram'
import type { Demo } from '../components/web/WebDemo'
import { cssDemos } from './webDemosCss'
import { cssDemosExtra } from './webDemosCssExtra'
import { htmlMore } from './webQuestionsHtml'
import { cssMore } from './webQuestionsCss'
import { jsMore } from './webQuestionsJs'
import { htmlExtra } from './webQuestionsExtraHtml'
import { cssExtra } from './webQuestionsExtraCss'
import { jsExtra } from './webQuestionsExtraJs'

export type WebTopic = 'html' | 'css' | 'js'

export type WebQuestion = {
  id: string
  topic: WebTopic
  title: string
  level: 'Basic' | 'Core' | 'Advanced'
  answer: string
  points?: string[]
  remember: string
  code?: string
  diagram: Diagram
  /** sub-topic heading, filled in from GROUPS below */
  group?: string
  /** live, editable-by-tabs preview (CSS questions), filled in from cssDemos */
  demo?: Demo
}

export const webTopics: { key: WebTopic; name: string; tagline: string }[] = [
  { key: 'html', name: 'HTML', tagline: 'Structure, meaning, loading and accessibility.' },
  { key: 'css', name: 'CSS', tagline: 'Cascade, layout and how the browser paints.' },
  { key: 'js', name: 'JavaScript', tagline: 'Scope, async, the event loop and the DOM.' },
]

const baseQuestions: WebQuestion[] = [
  /* ───────────────────────────── HTML ───────────────────────────── */
  {
    id: 'semantic-html',
    topic: 'html',
    title: 'What is semantic HTML and why does it matter?',
    level: 'Basic',
    answer:
      'Semantic tags describe what content IS (header, nav, main, article, aside, footer, button) instead of only how it looks. Screen readers, search engines and other developers read that meaning for free.',
    points: ['Screen readers can jump between landmarks (nav, main).', 'Better SEO: crawlers understand the outline.', 'Native elements bring keyboard and focus behaviour (a <button> is focusable and fires on Enter/Space).'],
    remember: 'Tag = meaning, CSS = looks. A <div> means nothing.',
    code: `<header>…</header>
<nav>…</nav>
<main>
  <article>
    <h1>Title</h1>
    <section>…</section>
  </article>
  <aside>Related</aside>
</main>
<footer>…</footer>`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'body', tone: 'slate' },
        { label: 'header · nav', note: 'site-wide top + links', tone: 'indigo' },
        { label: 'main', note: 'only one per page', tone: 'emerald' },
        { label: 'article', note: 'stands on its own (post, card)', tone: 'amber' },
        { label: 'section → h2 + content', tone: 'cyan' },
      ],
    },
  },
  {
    id: 'script-async-defer',
    topic: 'html',
    title: '<script> vs async vs defer',
    level: 'Core',
    answer:
      'A plain <script> stops HTML parsing while it downloads and runs. async downloads in parallel and runs as soon as it arrives (order not guaranteed, may interrupt parsing). defer downloads in parallel and runs after parsing finishes, in document order, before DOMContentLoaded.',
    points: ['Use defer for app scripts that need the DOM.', 'Use async for independent scripts (analytics).', 'type="module" scripts are deferred by default.'],
    remember: 'async = "run when ready", defer = "run when the page is parsed, in order".',
    code: `<script src="app.js"></script>        <!-- blocks parsing -->
<script async src="analytics.js"></script>
<script defer src="main.js"></script>`,
    diagram: {
      kind: 'timeline',
      max: 10,
      rows: [
        { title: '<script>', segs: [{ from: 0, to: 3, label: 'parse', tone: 'slate' }, { from: 3, to: 5, label: 'fetch', tone: 'amber' }, { from: 5, to: 6, label: 'run', tone: 'rose' }, { from: 6, to: 10, label: 'parse', tone: 'slate' }] },
        { title: 'async · parse', segs: [{ from: 0, to: 4, label: 'parse', tone: 'slate' }, { from: 5, to: 8, label: 'parse', tone: 'slate' }] },
        { title: 'async · script', segs: [{ from: 1, to: 4, label: 'fetch', tone: 'amber' }, { from: 4, to: 5, label: 'run', tone: 'rose' }] },
        { title: 'defer · parse', segs: [{ from: 0, to: 7, label: 'parse (never paused)', tone: 'slate' }] },
        { title: 'defer · script', segs: [{ from: 1, to: 4, label: 'fetch', tone: 'amber' }, { from: 7, to: 8, label: 'run', tone: 'emerald' }] },
      ],
    },
  },
  {
    id: 'critical-rendering-path',
    topic: 'html',
    title: 'What happens between receiving HTML and seeing pixels? (critical rendering path)',
    level: 'Core',
    answer:
      'The browser parses HTML into the DOM and CSS into the CSSOM, combines them into a render tree (visible nodes only), computes geometry (layout), fills in pixels (paint) and finally composites layers on the GPU.',
    points: ['CSS is render-blocking: nothing paints until the CSSOM is ready.', 'Plain scripts are parser-blocking.', 'display:none nodes are not in the render tree.'],
    remember: 'DOM + CSSOM → Render tree → Layout → Paint → Composite.',
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'DOM + CSSOM', note: 'parse HTML & CSS', tone: 'indigo' },
        { label: 'Render tree', note: 'visible nodes + styles', tone: 'cyan' },
        { label: 'Layout', note: 'size & position', tone: 'amber' },
        { label: 'Paint', note: 'pixels per layer', tone: 'rose' },
        { label: 'Composite', note: 'GPU stacks layers', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'storage',
    topic: 'html',
    title: 'Cookies vs localStorage vs sessionStorage',
    level: 'Core',
    answer:
      'Cookies are small (~4 KB) and are sent to the server with every request, so they suit sessions and auth (with HttpOnly, Secure, SameSite). localStorage (~5–10 MB) stays until cleared. sessionStorage is the same API but lives only for that tab.',
    remember: 'Cookie travels to the server; storage stays in the browser. session = this tab only.',
    code: `localStorage.setItem('theme', 'dark')
sessionStorage.getItem('draft')
document.cookie = 'lang=en; Max-Age=3600; Secure; SameSite=Lax'`,
    diagram: {
      kind: 'table',
      head: ['', 'size', 'lifetime', 'sent to server?', 'JS access'],
      rows: [
        ['cookie', '~4 KB', 'Expires / Max-Age', 'yes, every request', 'not if HttpOnly'],
        ['localStorage', '~5–10 MB', 'until cleared', 'no', 'yes'],
        ['sessionStorage', '~5 MB', 'until the tab closes', 'no', 'yes'],
      ],
    },
  },
  {
    id: 'accessibility',
    topic: 'html',
    title: 'How do you make a page accessible?',
    level: 'Core',
    answer:
      'Use native elements first, give every input a <label>, every meaningful image an alt, keep a logical heading order, make everything keyboard reachable with a visible focus ring, keep enough colour contrast, and add ARIA only when no native element fits.',
    points: ['First rule of ARIA: don\'t use ARIA if a native element works.', 'alt="" for decorative images.', 'Announce dynamic changes with aria-live.'],
    remember: 'Native first, label everything, keyboard everything, ARIA last.',
    code: `<label for="email">Email</label>
<input id="email" type="email" />

<img src="chart.png" alt="Sales doubled in Q3" />
<button aria-label="Close dialog">✕</button>`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'Native element', note: '<button>, <a>, <input> come with role + keyboard', tone: 'emerald' },
        { label: 'Text alternative', note: 'label, alt, aria-label', tone: 'cyan' },
        { label: 'Keyboard + focus', note: 'Tab order, visible :focus-visible', tone: 'indigo' },
        { label: 'ARIA', note: 'only to fill gaps (role, aria-expanded, aria-live)', tone: 'amber' },
      ],
    },
  },
  {
    id: 'viewport-meta',
    topic: 'html',
    title: 'Why do we need <meta name="viewport">?',
    level: 'Basic',
    answer:
      'Without it, mobile browsers pretend the screen is ~980px wide and zoom the page out. width=device-width makes the layout viewport match the device width so media queries and responsive CSS work.',
    remember: 'No viewport meta = tiny zoomed-out desktop page on phones.',
    code: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    diagram: {
      kind: 'compare',
      left: { title: 'without', tone: 'rose', items: ['layout width ≈ 980px', 'page zoomed out', 'media queries see "desktop"'] },
      right: { title: 'width=device-width', tone: 'emerald', items: ['layout width = phone width', 'readable text', 'mobile media queries apply'] },
    },
  },
  {
    id: 'resource-hints',
    topic: 'html',
    title: 'preload vs prefetch vs preconnect',
    level: 'Advanced',
    answer:
      'preload fetches something the CURRENT page will need soon at high priority. prefetch fetches something a FUTURE navigation might need at low priority. preconnect opens the DNS + TCP + TLS connection to another origin early, without downloading anything.',
    remember: 'preload = now, prefetch = next page, preconnect = warm up the road.',
    code: `<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="prefetch" href="/checkout.js" />
<link rel="preconnect" href="https://api.example.com" />`,
    diagram: {
      kind: 'table',
      head: ['hint', 'when', 'priority', 'downloads?'],
      rows: [
        ['preload', 'this page, soon', 'high', 'yes'],
        ['prefetch', 'probably the next page', 'low (idle)', 'yes'],
        ['preconnect', 'a third-party origin', '—', 'no, just the connection'],
        ['dns-prefetch', 'a third-party origin', '—', 'no, just DNS'],
      ],
    },
  },
  {
    id: 'responsive-images',
    topic: 'html',
    title: 'How do srcset, sizes and loading="lazy" help images?',
    level: 'Core',
    answer:
      'srcset lists the same image at several widths and sizes tells the browser how wide it will be shown, so the browser downloads the smallest file that still looks sharp. loading="lazy" defers off-screen images until the user scrolls near them. Always set width and height to avoid layout shift.',
    remember: 'srcset = menu of files, sizes = how big the plate is, lazy = serve later.',
    code: `<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  width="800" height="450"
  loading="lazy" alt="Team at work" />`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'sizes', note: 'phone → 100vw = 390px', tone: 'indigo' },
        { label: '× DPR 2', note: '≈ 780px needed', tone: 'cyan' },
        { label: 'srcset pick', note: 'hero-800.jpg', tone: 'emerald' },
        { label: 'lazy', note: 'fetch when near viewport', tone: 'amber' },
      ],
    },
  },
  {
    id: 'forms-validation',
    topic: 'html',
    title: 'What does HTML give you for free in forms?',
    level: 'Basic',
    answer:
      'Input types (email, number, date, tel) bring the right mobile keyboard and built-in validation; required, min, max, pattern and maxlength block bad submits without JS. A <button> inside a form defaults to type="submit", so use type="button" for non-submit buttons.',
    remember: 'Right type, right keyboard. <button> in a form = submit unless told otherwise.',
    code: `<form>
  <input type="email" required />
  <input type="number" min="1" max="10" />
  <button type="button">Preview</button>
  <button>Send</button>  <!-- submits -->
</form>`,
    diagram: {
      kind: 'compare',
      left: { title: 'type="submit" (default)', tone: 'amber', items: ['submits the form', 'triggers validation', 'reloads unless preventDefault()'] },
      right: { title: 'type="button"', tone: 'emerald', items: ['does nothing by itself', 'wire up onClick', 'safe for "Cancel", "Preview"'] },
    },
  },
  {
    id: 'data-attributes',
    topic: 'html',
    title: 'What are data-* attributes?',
    level: 'Basic',
    answer:
      'Custom attributes for storing extra info on an element without breaking validity. JS reads them through element.dataset (kebab-case becomes camelCase) and CSS can select on them.',
    remember: 'data-user-id ↔ el.dataset.userId.',
    code: `<li data-user-id="42" data-role="admin">Asha</li>

const li = document.querySelector('li')
li.dataset.userId   // "42" (always a string)

/* CSS */
li[data-role="admin"] { font-weight: 600; }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'data-user-id="42"', note: 'HTML', tone: 'indigo' },
        { label: 'dataset.userId', note: 'JS, camelCase', tone: 'emerald' },
        { label: '[data-user-id]', note: 'CSS selector', tone: 'cyan' },
      ],
    },
  },
  {
    id: 'doctype',
    topic: 'html',
    title: 'What does <!DOCTYPE html> do?',
    level: 'Basic',
    answer:
      'It tells the browser to render in standards mode. Without it the browser falls back to quirks mode, which imitates old browser bugs (for example a different box model), so layouts can break.',
    remember: 'No DOCTYPE = quirks mode = 1999 rendering rules.',
    code: `<!DOCTYPE html>
<html lang="en">…</html>`,
    diagram: {
      kind: 'compare',
      left: { title: 'with DOCTYPE', tone: 'emerald', items: ['standards mode', 'modern box model', 'predictable CSS'] },
      right: { title: 'without', tone: 'rose', items: ['quirks mode', 'legacy box-sizing behaviour', 'odd table / line-height rules'] },
    },
  },
  {
    id: 'dom-events-load',
    topic: 'html',
    title: 'DOMContentLoaded vs load',
    level: 'Core',
    answer:
      'DOMContentLoaded fires when the HTML is parsed and deferred scripts have run; images and stylesheets may still be loading. load fires when everything, including images, iframes and stylesheets, has finished.',
    remember: 'DOMContentLoaded = skeleton ready. load = whole house furnished.',
    code: `document.addEventListener('DOMContentLoaded', initUI)
window.addEventListener('load', () => console.log('images done'))`,
    diagram: {
      kind: 'timeline',
      max: 12,
      rows: [
        { title: 'HTML parse', segs: [{ from: 0, to: 5, label: 'parse', tone: 'slate' }, { from: 5, to: 6, label: 'defer', tone: 'indigo' }] },
        { title: 'images / css', segs: [{ from: 1, to: 10, label: 'downloading', tone: 'amber' }] },
        { title: 'events', segs: [{ from: 6, to: 9.5, label: 'DOMContentLoaded', tone: 'emerald' }, { from: 10, to: 12, label: 'load', tone: 'rose' }] },
      ],
    },
  },

  /* ───────────────────────────── CSS ───────────────────────────── */
  {
    id: 'box-model',
    topic: 'css',
    title: 'Explain the CSS box model and box-sizing',
    level: 'Basic',
    answer:
      'Every element is a box: content, then padding, then border, then margin. With box-sizing: content-box (the default) width sets only the content, so padding and border are added on top. With border-box, width includes padding and border, which is far easier to reason about.',
    remember: 'Margin › Border › Padding › Content. border-box = "width means the whole visible box".',
    code: `*, *::before, *::after { box-sizing: border-box; }

.card { width: 300px; padding: 20px; border: 2px solid; }
/* content-box → 344px wide, border-box → 300px */`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'margin', note: 'space outside, transparent', tone: 'amber' },
        { label: 'border', tone: 'rose' },
        { label: 'padding', note: 'space inside, takes background', tone: 'emerald' },
        { label: 'content', note: 'width × height (content-box)', tone: 'indigo' },
      ],
    },
  },
  {
    id: 'specificity',
    topic: 'css',
    title: 'How does CSS specificity work?',
    level: 'Core',
    answer:
      'Specificity is compared like a version number (a, b, c): IDs, then classes / attributes / pseudo-classes, then elements / pseudo-elements. Higher wins; on a tie the later rule wins. Inline styles beat all selectors and !important beats normal declarations.',
    points: ['* and combinators add nothing.', ':is() / :not() take their most specific argument; :where() adds 0.'],
    remember: 'IDs › classes › tags. Count them like 1-0-0 › 0-9-9.',
    code: `#nav .item a      /* 1-1-1 */
.nav .item a      /* 0-2-1 */
nav ul li a       /* 0-0-4 */`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: '!important', note: 'beats every normal declaration', tone: 'rose' },
        { label: 'inline style=""', note: 'beats any selector', tone: 'amber' },
        { label: '#id', note: '(1, 0, 0)', tone: 'fuchsia' },
        { label: '.class  [attr]  :hover', note: '(0, 1, 0)', tone: 'indigo' },
        { label: 'div  ::before', note: '(0, 0, 1)', tone: 'cyan' },
        { label: 'tie → source order', note: 'the later rule wins', tone: 'slate' },
      ],
    },
  },
  {
    id: 'position',
    topic: 'css',
    title: 'static vs relative vs absolute vs fixed vs sticky',
    level: 'Core',
    answer:
      'static is normal flow. relative stays in flow but can be nudged and becomes the anchor for absolute children. absolute leaves the flow and is placed against the nearest positioned ancestor. fixed is placed against the viewport. sticky behaves like relative until a scroll threshold, then sticks inside its parent.',
    remember: 'absolute looks UP for the nearest positioned parent; fixed looks at the screen.',
    code: `.card   { position: relative; }
.badge  { position: absolute; top: 8px; right: 8px; }
.header { position: sticky; top: 0; }`,
    diagram: {
      kind: 'table',
      head: ['position', 'in flow?', 'offset relative to', 'scrolls?'],
      rows: [
        ['static', 'yes', '— (top/left ignored)', 'yes'],
        ['relative', 'yes (space kept)', 'its own normal spot', 'yes'],
        ['absolute', 'no', 'nearest positioned ancestor', 'with that ancestor'],
        ['fixed', 'no', 'viewport', 'no'],
        ['sticky', 'yes', 'scroll container, at threshold', 'until it sticks'],
      ],
    },
  },
  {
    id: 'flexbox-axes',
    topic: 'css',
    title: 'Flexbox: main axis vs cross axis',
    level: 'Basic',
    answer:
      'flex-direction sets the main axis (row = horizontal). justify-content aligns items along the main axis; align-items aligns them along the cross axis. Switch to column and the two swap visually.',
    points: ['flex: 1 = grow 1, shrink 1, basis 0.', 'gap spaces items without margins.'],
    remember: 'justify = main axis (direction), align = the other one.',
    code: `.row {
  display: flex;
  justify-content: space-between; /* ↔ in a row */
  align-items: center;            /* ↕ in a row */
  gap: 12px;
}`,
    diagram: {
      kind: 'compare',
      left: { title: 'flex-direction: row', tone: 'indigo', items: ['main axis →  justify-content', 'cross axis ↓  align-items'] },
      right: { title: 'flex-direction: column', tone: 'emerald', items: ['main axis ↓  justify-content', 'cross axis →  align-items'] },
    },
  },
  {
    id: 'grid-vs-flex',
    topic: 'css',
    title: 'When to use Grid vs Flexbox?',
    level: 'Core',
    answer:
      'Flexbox is one-dimensional: it lays items out in a row OR a column and lets content decide sizes. Grid is two-dimensional: you define rows AND columns and place items into them. Use flex for components (nav bar, button group) and grid for page or card layouts.',
    remember: 'Flex = a line of items. Grid = a table of areas.',
    code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}`,
    diagram: {
      kind: 'compare',
      left: { title: 'Flexbox — 1D', tone: 'indigo', items: ['content-out sizing', 'nav bars, toolbars', 'wrap = new independent line'] },
      right: { title: 'Grid — 2D', tone: 'emerald', items: ['layout-in sizing', 'page shells, card grids', 'rows and columns line up'] },
    },
  },
  {
    id: 'hide-element',
    topic: 'css',
    title: 'display:none vs visibility:hidden vs opacity:0',
    level: 'Basic',
    answer:
      'display:none removes the element from layout and the accessibility tree. visibility:hidden keeps its space but hides it and it can\'t be clicked. opacity:0 keeps space AND still receives clicks and focus; it is the one you can animate smoothly.',
    remember: 'none = gone, hidden = ghost that keeps its seat, opacity 0 = invisible but still clickable.',
    diagram: {
      kind: 'table',
      head: ['', 'takes space', 'clickable', 'screen readers', 'animatable'],
      rows: [
        ['display: none', 'no', 'no', 'hidden', 'no'],
        ['visibility: hidden', 'yes', 'no', 'hidden', 'yes (discrete)'],
        ['opacity: 0', 'yes', 'yes', 'still read', 'yes, smoothly'],
      ],
    },
  },
  {
    id: 'stacking-context',
    topic: 'css',
    title: 'Why doesn\'t my z-index work? (stacking context)',
    level: 'Advanced',
    answer:
      'z-index only compares elements inside the same stacking context. A new context is created by a positioned element with a z-index, opacity < 1, transform, filter, isolation: isolate, position fixed/sticky and more. A child can never rise above its parent\'s context, no matter how big its z-index.',
    remember: 'z-index competes only with siblings in the same box. z-index 9999 inside a z-index 1 parent is still "1".',
    code: `.modal-parent { position: relative; z-index: 1; }
.modal { position: fixed; z-index: 9999; } /* still trapped under z-index 2 */
.header { position: relative; z-index: 2; }`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'root context', tone: 'slate' },
        { label: '.parent  z-index: 1', note: 'new stacking context', tone: 'amber' },
        { label: '.child  z-index: 9999', note: 'only beats its siblings in .parent', tone: 'rose' },
      ],
    },
  },
  {
    id: 'margin-collapse',
    topic: 'css',
    title: 'What is margin collapsing?',
    level: 'Core',
    answer:
      'Vertical margins between block elements in normal flow merge into one margin equal to the larger of the two (not the sum). It also happens between a parent and its first/last child when nothing (padding, border, BFC) separates them. Flex and grid items never collapse.',
    remember: 'Vertical margins shake hands: 20px + 30px = 30px.',
    code: `h2 { margin-bottom: 20px; }
p  { margin-top: 30px; }
/* gap between them = 30px, not 50px */`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'h2  margin-bottom 20', tone: 'indigo' },
        { label: 'p  margin-top 30', tone: 'cyan' },
        { label: 'gap = max(20, 30) = 30', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'centering',
    topic: 'css',
    title: 'How do you center a div?',
    level: 'Basic',
    answer:
      'Modern answer: make the parent a flex or grid container and center on both axes. For only horizontal centering of a block with a width, margin: 0 auto works. For an overlay, absolute + inset: 0 + margin: auto, or top/left 50% with translate(-50%, -50%).',
    remember: 'Grid: place-items: center. Done.',
    code: `.parent { display: grid; place-items: center; }

.parent { display: flex; justify-content: center; align-items: center; }

.box { width: 300px; margin: 0 auto; } /* horizontal only */`,
    diagram: {
      kind: 'table',
      head: ['method', 'centers', 'needs'],
      rows: [
        ['grid + place-items: center', 'both axes', 'nothing else'],
        ['flex + justify + align center', 'both axes', 'nothing else'],
        ['margin: 0 auto', 'horizontal', 'a set width, block element'],
        ['absolute + translate(-50%, -50%)', 'both axes', 'a positioned parent'],
      ],
    },
  },
  {
    id: 'units',
    topic: 'css',
    title: 'px vs em vs rem vs % vs vw/vh',
    level: 'Basic',
    answer:
      'px is fixed. em is relative to the element\'s own font-size (compounds when nested). rem is relative to the root <html> font-size, so it scales with user settings without compounding. % is relative to the parent. vw/vh are 1% of the viewport width/height.',
    remember: 'rem = root, em = "me" (my font size), % = parent, vw = window.',
    code: `html { font-size: 16px; }
.card { padding: 1.5rem; }      /* 24px */
.card h3 { font-size: 1.25em; } /* 1.25 × card's font-size */
.hero { height: 100dvh; }`,
    diagram: {
      kind: 'table',
      head: ['unit', 'relative to', 'good for'],
      rows: [
        ['px', 'nothing (fixed)', 'borders, hairlines'],
        ['rem', 'root font-size', 'type scale, spacing'],
        ['em', 'own font-size', 'padding that scales with the text'],
        ['%', 'parent', 'fluid widths'],
        ['vw / vh / dvh', 'viewport', 'full-screen sections'],
      ],
    },
  },
  {
    id: 'pseudo',
    topic: 'css',
    title: 'Pseudo-class vs pseudo-element',
    level: 'Basic',
    answer:
      'A pseudo-class (single colon) selects an element in a certain STATE: :hover, :focus-visible, :nth-child(2), :checked. A pseudo-element (double colon) styles a PART of an element or inserts content: ::before, ::after, ::placeholder, ::first-line.',
    remember: 'One colon = state, two colons = part.',
    code: `button:hover { background: #4f46e5; }
li:nth-child(odd) { background: #f8fafc; }
.required::after { content: ' *'; color: red; }`,
    diagram: {
      kind: 'compare',
      left: { title: ':pseudo-class — state', tone: 'indigo', items: [':hover  :focus-visible', ':nth-child(2)', ':checked  :disabled'] },
      right: { title: '::pseudo-element — part', tone: 'emerald', items: ['::before  ::after', '::placeholder', '::first-line  ::marker'] },
    },
  },
  {
    id: 'reflow-repaint',
    topic: 'css',
    title: 'Reflow vs repaint — which CSS properties are cheap to animate?',
    level: 'Advanced',
    answer:
      'Changing geometry (width, top, margin, font-size) triggers layout (reflow), then paint, then composite — the most expensive path. Changing only looks (color, background) skips layout but repaints. transform and opacity can be handled by the compositor alone, so animate those.',
    points: ['Reading offsetHeight right after writing styles forces a synchronous layout (layout thrashing).', 'Batch reads, then writes; or use requestAnimationFrame.'],
    remember: 'Animate transform and opacity; leave top/left/width alone.',
    code: `/* janky */
.box { transition: left 300ms; }
/* smooth */
.box { transition: transform 300ms; }
.box.open { transform: translateX(200px); }`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'Layout → Paint → Composite', tone: 'rose', items: ['width, height', 'top, left, margin', 'font-size'] },
        { title: 'Paint → Composite', tone: 'amber', items: ['color', 'background', 'box-shadow'] },
        { title: 'Composite only', tone: 'emerald', items: ['transform', 'opacity'] },
      ],
    },
  },
  {
    id: 'bfc',
    topic: 'css',
    title: 'What is a Block Formatting Context (BFC)?',
    level: 'Advanced',
    answer:
      'A BFC is an isolated layout region: floats inside it are contained, its margins don\'t collapse with its children, and it doesn\'t overlap outside floats. display: flow-root is the clean way to create one; overflow other than visible, flex/grid items and absolute/fixed elements also create one.',
    remember: 'flow-root = "start a fresh mini page here".',
    code: `.clearfix { display: flow-root; } /* contains floated children */`,
    diagram: {
      kind: 'compare',
      left: { title: 'creates a BFC', tone: 'indigo', items: ['display: flow-root', 'overflow: hidden | auto', 'flex / grid items', 'position: absolute | fixed'] },
      right: { title: 'what it fixes', tone: 'emerald', items: ['contains floats (no collapsed parent)', 'stops parent–child margin collapse', 'text stops wrapping under a float'] },
    },
  },
  {
    id: 'media-queries',
    topic: 'css',
    title: 'Mobile-first media queries',
    level: 'Basic',
    answer:
      'Write the base styles for the smallest screen, then add min-width media queries that layer on changes as the screen grows. Phones download less override CSS and the code reads as "add more when there is room".',
    remember: 'Start small, min-width up.',
    code: `.grid { display: grid; gap: 12px; }              /* phone */
@media (min-width: 640px)  { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'base', note: '1 column (phone)', tone: 'slate' },
        { label: '≥ 640px', note: '2 columns', tone: 'indigo' },
        { label: '≥ 1024px', note: '4 columns', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'css-variables',
    topic: 'css',
    title: 'CSS custom properties vs Sass variables',
    level: 'Core',
    answer:
      'Sass variables are replaced at build time and vanish from the output. CSS custom properties (--name) live in the browser: they cascade, inherit, can be changed per element or media query, and can be updated from JS at runtime — perfect for themes.',
    remember: 'Sass $var = compile-time constant. --var = live value the browser knows about.',
    code: `:root { --brand: #6366f1; }
.dark { --brand: #a5b4fc; }
.btn  { background: var(--brand, blue); }

document.documentElement.style.setProperty('--brand', 'tomato')`,
    diagram: {
      kind: 'compare',
      left: { title: '$sass-var', tone: 'amber', items: ['resolved at build', 'no cascade', 'can\'t change at runtime'] },
      right: { title: '--custom-property', tone: 'emerald', items: ['resolved in the browser', 'inherits + cascades', 'change via class, media query or JS'] },
    },
  },

  /* ─────────────────────────── JavaScript ─────────────────────────── */
  {
    id: 'var-let-const',
    topic: 'js',
    title: 'var vs let vs const',
    level: 'Basic',
    answer:
      'var is function-scoped, hoisted and initialised to undefined, and can be redeclared. let and const are block-scoped and hoisted into the temporal dead zone (using them before the line throws). const can\'t be reassigned, but the object it points to can still be mutated.',
    remember: 'var = function box, let/const = block box. const locks the arrow, not the object.',
    code: `if (true) { var a = 1; let b = 2 }
a // 1
b // ReferenceError

const user = { name: 'Asha' }
user.name = 'Ravi'   // ✅ mutation
user = {}            // ❌ TypeError`,
    diagram: {
      kind: 'table',
      head: ['', 'scope', 'hoisted as', 'reassign', 'redeclare'],
      rows: [
        ['var', 'function', 'undefined', 'yes', 'yes'],
        ['let', 'block', 'TDZ (error before line)', 'yes', 'no'],
        ['const', 'block', 'TDZ', 'no', 'no'],
      ],
    },
  },
  {
    id: 'hoisting',
    topic: 'js',
    title: 'What is hoisting? What is the TDZ?',
    level: 'Core',
    answer:
      'Before running a scope, the engine registers all its declarations. Function declarations are fully available early; var exists as undefined; let, const and class exist but are uninitialised until their line runs — that gap is the temporal dead zone, and touching them there throws.',
    remember: 'Functions: fully lifted. var: lifted empty. let/const: lifted but locked.',
    code: `sayHi()            // ✅ works
console.log(x)     // undefined
console.log(y)     // ❌ ReferenceError (TDZ)

function sayHi() {}
var x = 1
let y = 2`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'Creation phase', note: 'register declarations', tone: 'indigo' },
        { label: 'function → ready', tone: 'emerald' },
        { label: 'var → undefined', tone: 'amber' },
        { label: 'let/const → TDZ', note: 'until the line runs', tone: 'rose' },
        { label: 'Execution phase', note: 'run line by line', tone: 'cyan' },
      ],
    },
  },
  {
    id: 'closures',
    topic: 'js',
    title: 'What is a closure?',
    level: 'Core',
    answer:
      'A closure is a function together with the variables of the scope it was created in. The inner function keeps those variables alive even after the outer function has returned. Used for private state, factories, memoisation, debounce and React hooks.',
    remember: 'A function carries a backpack of the variables around where it was born.',
    code: `function counter() {
  let count = 0           // in the backpack
  return () => ++count
}
const next = counter()
next() // 1
next() // 2  — count survived`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'global', note: 'next = counter()', tone: 'slate' },
        { label: 'counter() scope', note: 'let count = 0  (kept alive)', tone: 'amber' },
        { label: 'returned () => ++count', note: 'still sees count', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'this',
    topic: 'js',
    title: 'How is `this` decided?',
    level: 'Core',
    answer:
      '`this` is set by HOW a function is called, not where it is written — except arrow functions, which take `this` from the surrounding scope. Check the rules top-down; the first match wins.',
    remember: 'Look left of the dot at call time. Arrows ignore the dot.',
    code: `const user = { name: 'Asha', hi() { return this.name } }
user.hi()                  // 'Asha'
const f = user.hi; f()     // undefined (strict) — lost the dot
f.call({ name: 'Ravi' })   // 'Ravi'
new Person()               // this = the new object`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'new Fn()', note: 'this = the brand-new object', tone: 'rose' },
        { label: 'fn.call / apply / bind(obj)', note: 'this = obj', tone: 'amber' },
        { label: 'obj.fn()', note: 'this = obj (left of the dot)', tone: 'indigo' },
        { label: 'fn()', note: 'undefined in strict mode, else globalThis', tone: 'slate' },
        { label: 'arrow function', note: 'no own this — uses the enclosing scope\'s', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'equality',
    topic: 'js',
    title: '== vs ===',
    level: 'Basic',
    answer:
      '=== compares value and type with no conversion. == converts types first using coercion rules, which leads to surprises. Use === always; the one common exception is x == null, which checks for both null and undefined.',
    remember: '=== is strict and honest. == quietly converts.',
    code: `0 == ''          // true
0 === ''         // false
null == undefined   // true
null === undefined  // false
NaN === NaN      // false → use Number.isNaN`,
    diagram: {
      kind: 'compare',
      left: { title: '== (loose)', tone: 'rose', items: ["'1' == 1  → true", "0 == ''  → true", 'null == undefined → true'] },
      right: { title: '=== (strict)', tone: 'emerald', items: ["'1' === 1 → false", "0 === '' → false", 'null === undefined → false'] },
    },
  },
  {
    id: 'event-loop',
    topic: 'js',
    title: 'Explain the event loop (microtasks vs macrotasks)',
    level: 'Advanced',
    answer:
      'JS runs one call stack. When it is empty, the event loop first drains ALL microtasks (promise callbacks, queueMicrotask, MutationObserver), then may render, then takes ONE macrotask (setTimeout, events, I/O) and repeats. So promises always run before timers.',
    remember: 'Sync first, then every microtask, then one macrotask. Promises cut the timer queue.',
    code: `console.log('A')
setTimeout(() => console.log('B'))
Promise.resolve().then(() => console.log('C'))
console.log('D')
// A D C B`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: '1 · Call stack (sync)', tone: 'indigo', items: ["log('A')", "log('D')"] },
        { title: '2 · Microtasks (all)', tone: 'emerald', items: ['.then → log(\'C\')', 'queueMicrotask', 'await continuation'] },
        { title: '3 · Macrotask (one)', tone: 'amber', items: ['setTimeout → log(\'B\')', 'click / message events'] },
      ],
    },
  },
  {
    id: 'promise-combinators',
    topic: 'js',
    title: 'Promise.all vs allSettled vs race vs any',
    level: 'Core',
    answer:
      'all waits for every promise and rejects on the first failure. allSettled waits for every promise and never rejects, giving each status. race settles with whichever finishes first (success or failure). any resolves with the first success and rejects only if all fail.',
    remember: 'all = everyone or nothing, allSettled = report card, race = first to finish, any = first to succeed.',
    code: `const [user, posts] = await Promise.all([getUser(), getPosts()])
const results = await Promise.allSettled(tasks)
const fastest = await Promise.race([fetchData(), timeout(3000)])`,
    diagram: {
      kind: 'table',
      head: ['', 'resolves when', 'rejects when'],
      rows: [
        ['all', 'every promise fulfils', 'the FIRST one rejects'],
        ['allSettled', 'every promise settles', 'never'],
        ['race', 'the first one settles (fulfils)', 'the first one settles (rejects)'],
        ['any', 'the first one fulfils', 'ALL reject (AggregateError)'],
      ],
    },
  },
  {
    id: 'event-delegation',
    topic: 'js',
    title: 'Event bubbling, capturing and delegation',
    level: 'Core',
    answer:
      'An event travels down from window to the target (capture), fires on the target, then bubbles back up through every ancestor. Delegation uses bubbling: put ONE listener on a parent and check event.target, instead of a listener on every child — it also works for children added later.',
    points: ['stopPropagation() stops the trip; preventDefault() stops the browser\'s default action — different things.', 'Use closest() to find the item that was clicked.'],
    remember: 'Down to capture, up to bubble. Listen on the parent, ask who was clicked.',
    code: `list.addEventListener('click', (e) => {
  const item = e.target.closest('li')
  if (!item) return
  select(item.dataset.id)
})`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'document', note: '↓ capture   ↑ bubble', tone: 'slate' },
        { label: 'ul#list', note: 'ONE listener here (delegation)', tone: 'emerald' },
        { label: 'li', note: 'e.target.closest("li")', tone: 'indigo' },
        { label: 'span (clicked)', note: 'event.target', tone: 'amber' },
      ],
    },
  },
  {
    id: 'debounce-throttle',
    topic: 'js',
    title: 'Debounce vs throttle',
    level: 'Core',
    answer:
      'Debounce waits until events STOP for a delay, then runs once — good for search-as-you-type. Throttle runs at most once per interval while events keep coming — good for scroll or resize handlers.',
    remember: 'Debounce = elevator door (waits for people to stop). Throttle = metronome (one tick per beat).',
    code: `function debounce(fn, ms) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}`,
    diagram: {
      kind: 'timeline',
      max: 12,
      rows: [
        { title: 'events', segs: [0, 1, 2, 3, 4, 5, 9, 10].map((x) => ({ from: x, to: x + 0.6, label: '•', tone: 'slate' as const })) },
        { title: 'debounce 2', segs: [{ from: 7, to: 7.9, label: 'run', tone: 'emerald' }, { from: 12 - 0.9, to: 12, label: 'run', tone: 'emerald' }] },
        { title: 'throttle 3', segs: [{ from: 0, to: 0.9, label: 'run', tone: 'amber' }, { from: 3, to: 3.9, label: 'run', tone: 'amber' }, { from: 9, to: 9.9, label: 'run', tone: 'amber' }] },
      ],
    },
  },
  {
    id: 'prototype',
    topic: 'js',
    title: 'Prototypal inheritance and the prototype chain',
    level: 'Core',
    answer:
      'Every object has a hidden link ([[Prototype]]) to another object. When a property isn\'t found on the object, JS walks up that chain until it finds it or reaches null. class syntax is sugar over this: methods live on Class.prototype.',
    remember: 'Not found here? Ask my prototype, then its prototype … until null.',
    code: `class Animal { speak() { return 'sound' } }
class Dog extends Animal {}
const rex = new Dog()
rex.speak()  // found on Animal.prototype
Object.getPrototypeOf(rex) === Dog.prototype // true`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'rex', note: 'own props', tone: 'indigo' },
        { label: 'Dog.prototype', tone: 'cyan' },
        { label: 'Animal.prototype', note: 'speak() found ✓', tone: 'emerald' },
        { label: 'Object.prototype', note: 'toString, hasOwnProperty', tone: 'slate' },
        { label: 'null', note: 'end → undefined', tone: 'rose' },
      ],
    },
  },
  {
    id: 'call-apply-bind',
    topic: 'js',
    title: 'call vs apply vs bind',
    level: 'Basic',
    answer:
      'All three set `this`. call invokes now with arguments listed one by one, apply invokes now with arguments as an array, bind does NOT invoke — it returns a new function with `this` (and optionally some arguments) fixed.',
    remember: 'Call = Comma, Apply = Array, Bind = Later.',
    code: `function greet(greeting, mark) { return greeting + ', ' + this.name + mark }
const user = { name: 'Asha' }
greet.call(user, 'Hi', '!')
greet.apply(user, ['Hi', '!'])
const hi = greet.bind(user, 'Hi'); hi('!')`,
    diagram: {
      kind: 'table',
      head: ['', 'runs now?', 'arguments', 'returns'],
      rows: [
        ['call', 'yes', 'a, b, c', 'the result'],
        ['apply', 'yes', '[a, b, c]', 'the result'],
        ['bind', 'no', 'a, b (pre-filled)', 'a new function'],
      ],
    },
  },
  {
    id: 'copy',
    topic: 'js',
    title: 'Shallow copy vs deep copy',
    level: 'Core',
    answer:
      'A shallow copy ({...obj}, Object.assign, arr.slice) copies only the top level; nested objects are still shared. A deep copy duplicates every level — use structuredClone(obj). JSON.parse(JSON.stringify()) also works but drops functions, undefined, Dates and Maps.',
    remember: 'Spread copies the box, not the boxes inside it.',
    code: `const a = { user: { name: 'Asha' } }
const s = { ...a }
s.user.name = 'Ravi'
a.user.name  // 'Ravi' 😬 shared

const d = structuredClone(a)  // fully independent`,
    diagram: {
      kind: 'compare',
      left: { title: 'shallow  {...a}', tone: 'amber', items: ['new outer object', 'a.user and s.user → SAME object', 'change one, both change'] },
      right: { title: 'deep  structuredClone(a)', tone: 'emerald', items: ['new outer object', 'new nested objects', 'fully independent'] },
    },
  },
  {
    id: 'array-methods',
    topic: 'js',
    title: 'map vs filter vs reduce (vs forEach)',
    level: 'Basic',
    answer:
      'map returns a new array of the same length with each item transformed. filter returns a new array with only the items that pass a test. reduce folds the array into a single value. forEach just runs a side effect and returns undefined. None of the first three mutate the original.',
    remember: 'map = transform each, filter = keep some, reduce = squash into one.',
    code: `const prices = [100, 250, 40]
prices.map(p => p * 1.18)          // add GST
prices.filter(p => p > 50)         // [100, 250]
prices.reduce((sum, p) => sum + p, 0)  // 390`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '[100, 250, 40]', tone: 'slate' },
        { label: 'filter(p > 50)', note: '[100, 250]', tone: 'indigo' },
        { label: 'map(p × 2)', note: '[200, 500]', tone: 'cyan' },
        { label: 'reduce(+)', note: '700', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'null-undefined',
    topic: 'js',
    title: 'null vs undefined (and typeof null)',
    level: 'Basic',
    answer:
      'undefined means "no value was ever given" — the default for missing variables, properties and return values. null means "intentionally empty", set by the programmer. typeof null is "object", a historical bug. Use ?? to fall back only on null/undefined, unlike || which also replaces 0 and \'\'.',
    remember: 'undefined = never filled, null = emptied on purpose.',
    code: `let a; a            // undefined
const b = null
typeof undefined    // 'undefined'
typeof null         // 'object'  (old bug)
0 || 10             // 10
0 ?? 10             // 0`,
    diagram: {
      kind: 'compare',
      left: { title: 'undefined', tone: 'amber', items: ['let x;', 'missing property', 'function with no return', 'typeof → "undefined"'] },
      right: { title: 'null', tone: 'indigo', items: ['set on purpose', 'clear a reference', 'API: "no result"', 'typeof → "object"'] },
    },
  },
  {
    id: 'falsy',
    topic: 'js',
    title: 'What are the falsy values?',
    level: 'Basic',
    answer:
      'Exactly eight values are falsy: false, 0, -0, 0n, \'\' (empty string), null, undefined and NaN. Everything else is truthy — including \'0\', \'false\', [] and {}.',
    remember: 'Eight falsies; empty array and empty object are TRUTHY.',
    code: `if ([]) console.log('runs')   // [] is truthy
if ('0') console.log('runs')  // non-empty string
Boolean(NaN)                 // false`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'falsy (all 8)', tone: 'rose', items: ['false', '0   -0   0n', "''", 'null   undefined', 'NaN'] },
        { title: 'truthy (surprises)', tone: 'emerald', items: ["'0'   'false'", '[]   {}', 'function () {}', 'Infinity   -1'] },
      ],
    },
  },
  {
    id: 'arrow-functions',
    topic: 'js',
    title: 'Arrow functions vs regular functions',
    level: 'Core',
    answer:
      'Arrow functions have no own this, arguments or prototype, so they can\'t be used with new and they take `this` from the surrounding scope — great for callbacks, bad as object methods that need `this`.',
    remember: 'Arrows borrow `this` from outside; regular functions get it from the call.',
    code: `const timer = {
  seconds: 0,
  start() {
    setInterval(() => this.seconds++, 1000) // ✅ arrow keeps timer's this
  },
}`,
    diagram: {
      kind: 'table',
      head: ['', 'regular function', 'arrow function'],
      rows: [
        ['this', 'set by the call', 'from the enclosing scope'],
        ['arguments', 'yes', 'no (use ...rest)'],
        ['new', 'yes', 'TypeError'],
        ['hoisted (declaration)', 'yes', 'no (it\'s a value)'],
      ],
    },
  },
  {
    id: 'currying',
    topic: 'js',
    title: 'What is currying?',
    level: 'Core',
    answer:
      'Currying turns a function of many arguments into a chain of functions that each take one argument: f(a, b, c) becomes f(a)(b)(c). It relies on closures and is handy for creating pre-configured helpers.',
    remember: 'Feed arguments one by one; each step remembers the previous ones.',
    code: `const add = a => b => c => a + b + c
add(1)(2)(3)  // 6

const withTax = rate => price => price * (1 + rate)
const gst = withTax(0.18)
gst(100)      // 118`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'add(1)', note: 'remembers a = 1', tone: 'indigo' },
        { label: '(2)', note: 'remembers b = 2', tone: 'cyan' },
        { label: '(3)', note: 'a + b + c', tone: 'amber' },
        { label: '6', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'innerhtml-xss',
    topic: 'js',
    title: 'innerHTML vs textContent (and XSS)',
    level: 'Core',
    answer:
      'innerHTML parses the string as HTML, so putting user input into it can run attacker-controlled markup (cross-site scripting). textContent treats the string as plain text and is faster. Use textContent for user data, and sanitise (e.g. DOMPurify) if you truly need HTML.',
    remember: 'User data goes in textContent. innerHTML only for HTML you trust.',
    code: `const name = '<img src=x onerror="steal()">'
el.innerHTML = name     // ❌ runs onerror
el.textContent = name   // ✅ shows the text`,
    diagram: {
      kind: 'compare',
      left: { title: 'innerHTML', tone: 'rose', items: ['parses as HTML', 'can run injected handlers', 'needs sanitising'] },
      right: { title: 'textContent', tone: 'emerald', items: ['plain text only', 'safe for user input', 'no parsing → faster'] },
    },
  },
  {
    id: 'memory-leaks',
    topic: 'js',
    title: 'How does garbage collection work, and what causes memory leaks?',
    level: 'Advanced',
    answer:
      'The engine uses mark-and-sweep: it starts from roots (globals, the current stack), marks everything reachable and frees the rest. A leak is memory that is still reachable but no longer needed: forgotten timers and listeners, growing caches or globals, closures holding big objects, references to removed DOM nodes.',
    remember: 'Reachable = kept. Leaks are things you forgot to let go of.',
    code: `useEffect(() => {
  const id = setInterval(poll, 1000)
  window.addEventListener('resize', onResize)
  return () => {               // clean up!
    clearInterval(id)
    window.removeEventListener('resize', onResize)
  }
}, [])`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'roots', tone: 'indigo', items: ['window / globalThis', 'current call stack', 'active timers & listeners'] },
        { title: 'reachable → kept', tone: 'emerald', items: ['objects linked from a root'] },
        { title: 'common leaks', tone: 'rose', items: ['setInterval never cleared', 'listener never removed', 'unbounded cache Map', 'detached DOM node in a variable'] },
      ],
    },
  },
  {
    id: 'modules',
    topic: 'js',
    title: 'ES modules vs CommonJS',
    level: 'Core',
    answer:
      'ES modules (import/export) are static: imports are known before the code runs, which enables tree-shaking, top-level await and live bindings; they load asynchronously and are strict by default. CommonJS (require/module.exports) is Node\'s older dynamic, synchronous system that copies values at require time.',
    remember: 'ESM = static, tree-shakeable, async. CJS = require() at runtime.',
    code: `// ESM
import { sum } from './math.js'
export const double = x => x * 2

// CommonJS
const { sum } = require('./math')
module.exports = { double }`,
    diagram: {
      kind: 'table',
      head: ['', 'ES modules', 'CommonJS'],
      rows: [
        ['syntax', 'import / export', 'require / module.exports'],
        ['resolved', 'statically, before running', 'at runtime'],
        ['loading', 'async', 'sync'],
        ['tree-shaking', 'yes', 'hard'],
        ['top-level await', 'yes', 'no'],
      ],
    },
  },
  {
    id: 'async-await',
    topic: 'js',
    title: 'How do async / await work, and how do you handle errors?',
    level: 'Core',
    answer:
      'An async function always returns a promise. await pauses only that function until the promise settles, letting other code run meanwhile; the rest of the function continues as a microtask. Wrap awaits in try/catch, and start independent requests together with Promise.all instead of awaiting them one by one.',
    remember: 'await pauses the function, not the page. Independent work → Promise.all.',
    code: `async function load() {
  try {
    const [user, posts] = await Promise.all([getUser(), getPosts()])
    return { user, posts }
  } catch (err) {
    showError(err)
  }
}`,
    diagram: {
      kind: 'timeline',
      max: 10,
      rows: [
        { title: 'await, await', segs: [{ from: 0, to: 4, label: 'getUser', tone: 'amber' }, { from: 4, to: 8, label: 'getPosts', tone: 'amber' }] },
        { title: 'Promise.all · 1', segs: [{ from: 0, to: 4, label: 'getUser', tone: 'emerald' }] },
        { title: 'Promise.all · 2', segs: [{ from: 0, to: 4, label: 'getPosts', tone: 'emerald' }] },
      ],
    },
  },
]

/** Sub-topics in display order; questions appear in the order listed. */
export const webGroups: Record<WebTopic, { name: string; ids: string[] }[]> = {
  html: [
    { name: 'Markup & semantics', ids: ['semantic-html', 'doctype', 'block-inline-elements', 'head-meta-seo', 'strong-vs-b', 'data-attributes', 'web-components', 'canvas-vs-svg', 'dialog-popover', 'id-vs-class', 'html5-features', 'heading-structure', 'html-entities', 'details-summary', 'template-element'] },
    { name: 'Loading & performance', ids: ['url-to-page', 'critical-rendering-path', 'script-async-defer', 'dom-events-load', 'resource-hints', 'responsive-images', 'picture-element', 'http-caching', 'workers', 'fetchpriority', 'ssr-csr-ssg', 'canonical-robots'] },
    { name: 'Forms & accessibility', ids: ['accessibility', 'tabindex', 'forms-validation', 'get-vs-post', 'viewport-meta', 'alt-text', 'label-input', 'input-types-autocomplete', 'aria-rules', 'skip-link-focus'] },
    { name: 'Security & storage', ids: ['storage', 'cookie-security', 'cors', 'csp', 'target-blank', 'iframe-sandbox', 'xss-vs-csrf', 'clickjacking', 'sri', 'https-hsts'] },
  ],
  css: [
    { name: 'Selectors & cascade', ids: ['specificity', 'cascade-order', 'cascade-layers', 'inheritance', 'combinators', 'nth-child-vs-of-type', 'is-where-has', 'pseudo', 'attribute-selectors', 'focus-visible'] },
    { name: 'Box model & positioning', ids: ['box-model', 'units', 'hide-element', 'position', 'sticky-not-working', 'stacking-context', 'margin-collapse', 'bfc', 'text-ellipsis', 'object-fit-aspect', 'float-clearfix', 'overflow', 'inline-block-gap', 'vertical-align', 'pointer-events'] },
    { name: 'Flexbox & Grid', ids: ['flexbox-axes', 'flex-shorthand', 'grid-vs-flex', 'grid-fr-areas', 'centering', 'flex-wrap-align', 'gap-vs-margin', 'subgrid'] },
    { name: 'Responsive design', ids: ['media-queries', 'container-queries', 'clamp', 'reduced-motion', 'viewport-units', 'logical-properties', 'scroll-snap'] },
    { name: 'Theming & architecture', ids: ['css-variables', 'dark-mode', 'css-architecture', 'css-nesting', 'currentcolor'] },
    { name: 'Animation & performance', ids: ['reflow-repaint', 'transform-vs-position', 'transition-vs-animation', 'will-change', 'cls-prevention', 'render-blocking-css', 'font-display', 'content-visibility', 'transform-order', 'animate-height-auto'] },
  ],
  js: [
    { name: 'Types & basics', ids: ['data-types', 'var-let-const', 'null-undefined', 'falsy', 'equality', 'type-coercion', 'float-precision', 'optional-chaining', 'spread-rest', 'for-in-of', 'array-methods', 'mutating-array-methods', 'json-gotchas', 'strict-mode', 'typeof-instanceof', 'short-circuit', 'array-like'] },
    { name: 'Scope & closures', ids: ['hoisting', 'scope-chain', 'execution-context', 'closures', 'iife', 'var-loop-timeout', 'hoisting-puzzle'] },
    { name: 'Functions & this', ids: ['this', 'arrow-functions', 'call-apply-bind', 'higher-order-pure', 'currying', 'compose-pipe', 'this-puzzle'] },
    { name: 'Objects & prototypes', ids: ['pass-by-value', 'prototype', 'new-keyword', 'classes', 'copy', 'freeze-seal', 'map-set-weakmap', 'symbol-iterator-generator', 'proxy-reflect', 'getter-defineproperty', 'object-keys-order'] },
    { name: 'Async & the event loop', ids: ['event-loop', 'promise-states', 'promise-combinators', 'async-await', 'output-puzzle', 'fetch-abort', 'error-handling', 'callbacks-to-promises', 'settimeout-setinterval', 'async-order-puzzle', 'for-await'] },
    { name: 'DOM & browser APIs', ids: ['event-delegation', 'custom-events', 'innerhtml-xss', 'intersection-observer', 'history-api', 'raf', 'memory-leaks', 'modules', 'realtime-transports', 'mutation-resize-observer', 'layout-thrashing', 'postmessage'] },
    { name: 'Implement it (machine coding)', ids: ['debounce-throttle', 'throttle-impl', 'memoize', 'polyfill-bind', 'polyfill-promise-all', 'polyfill-map-reduce', 'event-emitter', 'implement-once', 'implement-classnames', 'implement-flatten', 'implement-deep-clone', 'implement-get-path', 'implement-promisify', 'implement-deep-equal', 'implement-retry', 'implement-promise-pool', 'implement-lru-cache'] },
  ],
}

const all = [...baseQuestions, ...htmlMore, ...cssMore, ...jsMore, ...htmlExtra, ...cssExtra, ...jsExtra]
const byId = new Map(all.map((q) => [q.id, q]))

export const webQuestions: WebQuestion[] = (Object.keys(webGroups) as WebTopic[]).flatMap((topic) =>
  webGroups[topic].flatMap((group) => group.ids.map((id) => ({ ...(byId.get(id) as WebQuestion), group: group.name, demo: cssDemos[id] ?? cssDemosExtra[id] }))),
)
