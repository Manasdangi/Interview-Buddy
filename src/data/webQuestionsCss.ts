import type { WebQuestion } from './webQuestions'

/** More CSS questions (merged into webQuestions). */
export const cssMore: WebQuestion[] = [
  {
    id: 'cascade-order',
    topic: 'css',
    title: 'How does the cascade decide which rule wins?',
    level: 'Core',
    answer:
      'For each property the browser compares, in order: origin and importance (user-agent < author < !important author…), then cascade layers, then specificity, then source order. Only if two declarations tie on one step does it move to the next. Inline styles sit above all selector specificity.',
    remember: 'Importance → Layer → Specificity → Order.',
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'Origin & !important', note: 'browser defaults < your CSS < !important', tone: 'rose' },
        { label: '@layer order', note: 'later layers beat earlier ones; unlayered beats layered', tone: 'amber' },
        { label: 'Specificity', note: 'id › class › element', tone: 'indigo' },
        { label: 'Source order', note: 'last one wins', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'inheritance',
    topic: 'css',
    title: 'Which properties inherit? inherit vs initial vs unset',
    level: 'Basic',
    answer:
      'Text-related properties inherit by default (color, font-*, line-height, text-align, visibility, cursor). Box properties do not (margin, padding, border, width, background, display). inherit forces the parent\'s value, initial resets to the spec default, unset acts as inherit for inherited properties and initial for the rest, and revert goes back to the browser\'s style.',
    remember: 'Text flows down to children; boxes don\'t.',
    code: `button { font: inherit; color: inherit; }  /* match surrounding text */
.reset { all: unset; }`,
    diagram: {
      kind: 'compare',
      left: { title: 'inherits', tone: 'emerald', items: ['color', 'font-family / size / weight', 'line-height, text-align', 'visibility, cursor'] },
      right: { title: 'does not inherit', tone: 'amber', items: ['margin, padding, border', 'width, height', 'background', 'display, position'] },
    },
  },
  {
    id: 'combinators',
    topic: 'css',
    title: 'Descendant vs child vs sibling selectors',
    level: 'Basic',
    answer:
      'A B selects any B inside A at any depth. A > B selects only direct children. A + B selects the B right after A (adjacent sibling). A ~ B selects every B sibling that comes after A.',
    remember: 'space = anywhere inside, > = child, + = next door, ~ = all younger siblings.',
    code: `nav a        { }  /* every link in nav */
ul > li      { }  /* only top-level items */
h2 + p       { }  /* the paragraph right after h2 */
input:checked ~ label { }`,
    diagram: {
      kind: 'table',
      head: ['selector', 'matches B when…'],
      rows: [
        ['A B', 'B is anywhere inside A'],
        ['A > B', 'B is a direct child of A'],
        ['A + B', 'B immediately follows A'],
        ['A ~ B', 'B is any later sibling of A'],
      ],
    },
  },
  {
    id: 'nth-child-vs-of-type',
    topic: 'css',
    title: ':nth-child vs :nth-of-type',
    level: 'Core',
    answer:
      ':nth-child(n) counts ALL siblings and then checks the element type; :nth-of-type(n) counts only siblings of the same tag. With mixed children (h2, p, p) p:nth-child(2) is the first p, while p:nth-of-type(2) is the second p.',
    remember: 'nth-child counts everyone in the family; nth-of-type counts only the same kind.',
    code: `<article><h2/><p>A</p><p>B</p></article>
p:nth-child(2)   → A
p:nth-of-type(2) → B`,
    diagram: {
      kind: 'compare',
      left: { title: 'p:nth-child(2)', tone: 'indigo', items: ['count: h2=1, p A=2', '→ selects p A'] },
      right: { title: 'p:nth-of-type(2)', tone: 'emerald', items: ['count p only: A=1, B=2', '→ selects p B'] },
    },
  },
  {
    id: 'is-where-has',
    topic: 'css',
    title: ':is(), :where() and :has()',
    level: 'Advanced',
    answer:
      ':is() groups selectors and takes the specificity of its most specific argument. :where() does the same with zero specificity — perfect for overridable defaults. :has() is the "parent selector": it selects an element based on what it contains or what follows it.',
    remember: ':is = group, :where = group with 0 weight, :has = look inside.',
    code: `:is(h1, h2, h3) a { color: teal; }
:where(.btn) { padding: 8px; }          /* easy to override */
.card:has(img) { padding-top: 0; }
form:has(input:invalid) button { opacity: .5; }`,
    diagram: {
      kind: 'table',
      head: ['', 'does', 'specificity'],
      rows: [
        [':is(a, .b)', 'matches any in the list', 'highest argument'],
        [':where(a, .b)', 'matches any in the list', '0'],
        [':has(img)', 'element contains / is followed by a match', 'its argument'],
      ],
    },
  },
  {
    id: 'flex-shorthand',
    topic: 'css',
    title: 'What does flex: 1 mean? (grow, shrink, basis)',
    level: 'Core',
    answer:
      'flex is shorthand for flex-grow, flex-shrink and flex-basis. flex: 1 means 1 1 0%: start from zero width and share ALL the free space equally. flex: auto is 1 1 auto: start from the content size and share the leftover. flex: none is 0 0 auto: never grow or shrink. min-width: 0 lets a flex item shrink below its content (fixes text overflow).',
    remember: 'flex: 1 = equal slices of the whole cake. flex: auto = content first, then share.',
    code: `.sidebar { flex: 0 0 240px; }  /* fixed */
.main    { flex: 1; min-width: 0; }`,
    diagram: {
      kind: 'table',
      head: ['shorthand', 'grow', 'shrink', 'basis'],
      rows: [
        ['flex: 1', '1', '1', '0%'],
        ['flex: auto', '1', '1', 'auto'],
        ['flex: none', '0', '0', 'auto'],
        ['flex: 0 0 240px', '0', '0', '240px'],
      ],
    },
  },
  {
    id: 'grid-fr-areas',
    topic: 'css',
    title: 'Grid: fr unit, template areas, auto-fill vs auto-fit',
    level: 'Core',
    answer:
      'fr is a share of the free space in the grid. grid-template-areas lets you draw the layout with names. In repeat(), auto-fill keeps creating empty tracks when items run out, while auto-fit collapses empty tracks so the existing items stretch to fill the row.',
    remember: 'fill keeps empty seats, fit pulls the chairs together.',
    code: `.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas: "side main";
}
.cards { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }`,
    diagram: {
      kind: 'compare',
      left: { title: 'auto-fill', tone: 'amber', items: ['[item][item][empty][empty]', 'tracks stay at minmax size'] },
      right: { title: 'auto-fit', tone: 'emerald', items: ['[ item  ][  item  ]', 'empty tracks collapse, items grow'] },
    },
  },
  {
    id: 'sticky-not-working',
    topic: 'css',
    title: 'Why is position: sticky not sticking?',
    level: 'Core',
    answer:
      'Common causes: no top (or bottom/left) value set; an ancestor has overflow: hidden / auto / scroll, so it becomes the scroll container; the parent is no taller than the sticky element, so it has nowhere to stick; or it is a flex/grid item stretched to full height (use align-self: start).',
    remember: 'Sticky needs a threshold (top), room inside its parent, and no overflow-hidden ancestor.',
    code: `.toc { position: sticky; top: 80px; align-self: start; }`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'top / bottom set?', note: 'top: 0 is required', tone: 'indigo' },
        { label: 'ancestor overflow?', note: 'overflow hidden/auto creates a new scroller', tone: 'rose' },
        { label: 'parent taller than it?', note: 'sticky only moves within its parent', tone: 'amber' },
        { label: 'flex/grid stretch?', note: 'add align-self: start', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'text-ellipsis',
    topic: 'css',
    title: 'Truncate text with an ellipsis (one line and multi-line)',
    level: 'Basic',
    answer:
      'Single line needs three properties together: overflow: hidden, white-space: nowrap and text-overflow: ellipsis, on a block with a width. For several lines use line-clamp. Inside flex, the item may also need min-width: 0.',
    remember: 'One line = hidden + nowrap + ellipsis. Many lines = line-clamp.',
    code: `.one-line {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.three-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'overflow: hidden', tone: 'indigo' },
        { label: 'white-space: nowrap', tone: 'cyan' },
        { label: 'text-overflow: ellipsis', tone: 'emerald' },
        { label: 'Long product name…', tone: 'slate' },
      ],
    },
  },
  {
    id: 'transition-vs-animation',
    topic: 'css',
    title: 'transition vs @keyframes animation',
    level: 'Basic',
    answer:
      'A transition animates between two states when a property changes (hover, class toggle) — it needs a trigger and has only a start and end. An animation uses @keyframes with any number of steps, can start by itself, loop, alternate and pause.',
    remember: 'Transition = A → B when something changes. Animation = a scripted timeline.',
    code: `.btn { transition: transform 200ms ease; }
.btn:hover { transform: scale(1.05); }

@keyframes spin { to { transform: rotate(360deg); } }
.loader { animation: spin 1s linear infinite; }`,
    diagram: {
      kind: 'compare',
      left: { title: 'transition', tone: 'indigo', items: ['needs a trigger', '2 states: from → to', 'no looping'] },
      right: { title: 'animation', tone: 'emerald', items: ['runs on its own', 'many keyframes', 'infinite, alternate, paused'] },
    },
  },
  {
    id: 'transform-vs-position',
    topic: 'css',
    title: 'Why move things with transform instead of top/left?',
    level: 'Core',
    answer:
      'translate() moves the element visually without changing layout, so neighbours don\'t reflow and the GPU can animate it smoothly. top/left change layout on every frame. Also, transform functions apply right to left: rotate then translate is not the same as translate then rotate.',
    remember: 'transform moves the picture, top/left move the furniture.',
    code: `.toast { transform: translateY(100%); transition: transform 250ms; }
.toast.show { transform: translateY(0); }`,
    diagram: {
      kind: 'compare',
      left: { title: 'top / left', tone: 'rose', items: ['changes layout', 'layout + paint each frame', 'can jank'] },
      right: { title: 'transform', tone: 'emerald', items: ['layout untouched', 'compositor-only', '60fps friendly'] },
    },
  },
  {
    id: 'object-fit-aspect',
    topic: 'css',
    title: 'object-fit and aspect-ratio',
    level: 'Basic',
    answer:
      'object-fit decides how an image or video fills its box: cover fills and crops, contain fits entirely (letterboxing), fill stretches. aspect-ratio reserves the right height before the image loads, which prevents layout shift.',
    remember: 'cover = crop to fill, contain = fit whole. aspect-ratio = reserve the seat.',
    code: `.thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}`,
    diagram: {
      kind: 'table',
      head: ['object-fit', 'fills the box?', 'whole image visible?', 'distorts?'],
      rows: [
        ['cover', 'yes', 'no (cropped)', 'no'],
        ['contain', 'no (bars)', 'yes', 'no'],
        ['fill', 'yes', 'yes', 'yes'],
        ['none', 'maybe', 'maybe', 'no (natural size)'],
      ],
    },
  },
  {
    id: 'clamp',
    topic: 'css',
    title: 'min(), max() and clamp() for fluid sizes',
    level: 'Core',
    answer:
      'min() picks the smallest value (good for "at most"), max() the largest ("at least"), and clamp(MIN, PREFERRED, MAX) keeps a fluid value between two limits — the go-to for responsive font sizes and widths without media queries.',
    remember: 'clamp = floor, ideal, ceiling.',
    code: `h1 { font-size: clamp(1.75rem, 4vw + 1rem, 3rem); }
.container { width: min(100% - 2rem, 1100px); margin-inline: auto; }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'small phone', note: '4vw + 1rem < 1.75rem → 1.75rem', tone: 'indigo' },
        { label: 'tablet', note: 'grows with 4vw', tone: 'cyan' },
        { label: 'desktop', note: '> 3rem → capped at 3rem', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'container-queries',
    topic: 'css',
    title: 'Media queries vs container queries',
    level: 'Advanced',
    answer:
      'Media queries react to the viewport. Container queries react to the size of a parent you mark with container-type, so the same card can be compact in a sidebar and wide in the main area — truly reusable components.',
    remember: 'Media = how big is the screen? Container = how big is MY box?',
    code: `.card-wrap { container-type: inline-size; }
@container (min-width: 420px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}`,
    diagram: {
      kind: 'compare',
      left: { title: '@media', tone: 'indigo', items: ['looks at the viewport', 'page-level layout'] },
      right: { title: '@container', tone: 'emerald', items: ['looks at a parent box', 'component-level layout', 'same card, different slots'] },
    },
  },
  {
    id: 'cls-prevention',
    topic: 'css',
    title: 'How do you prevent layout shift (CLS)?',
    level: 'Core',
    answer:
      'Reserve space before content arrives: width/height or aspect-ratio on images and video, fixed-height slots for ads and embeds, skeletons with the final size. For fonts, use font-display: swap with a metric-matched fallback (size-adjust) or optional. Never insert content above what the user is reading unless they asked for it.',
    remember: 'Reserve the seat before the guest arrives.',
    code: `img { width: 100%; height: auto; aspect-ratio: 4 / 3; }
@font-face { font-family: Inter; src: url(inter.woff2); font-display: swap; }`,
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'images / video', tone: 'indigo', items: ['width + height', 'aspect-ratio'] },
        { title: 'late content', tone: 'amber', items: ['skeleton with final size', 'min-height for ads/embeds'] },
        { title: 'web fonts', tone: 'emerald', items: ['font-display: swap/optional', 'size-adjust fallback', 'preload key font'] },
      ],
    },
  },
  {
    id: 'dark-mode',
    topic: 'css',
    title: 'How do you implement dark mode?',
    level: 'Core',
    answer:
      'Store colours in CSS custom properties, define a light set on :root and a dark set under a .dark class or @media (prefers-color-scheme: dark). Add color-scheme so form controls and scrollbars match, and save the user\'s choice in localStorage, applying it before first paint to avoid a flash.',
    remember: 'Tokens as variables, swap the set, respect the OS, avoid the flash.',
    code: `:root { --bg: #fff; --text: #111; color-scheme: light; }
.dark { --bg: #0b1020; --text: #e5e7eb; color-scheme: dark; }
@media (prefers-color-scheme: dark) { :root:not(.light) { --bg: #0b1020; } }
body { background: var(--bg); color: var(--text); }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'saved choice?', note: 'localStorage', tone: 'indigo' },
        { label: 'else OS setting', note: 'prefers-color-scheme', tone: 'cyan' },
        { label: 'toggle .dark on <html>', note: 'before first paint', tone: 'amber' },
        { label: 'variables swap', note: 'whole UI updates', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'reduced-motion',
    topic: 'css',
    title: 'prefers-reduced-motion and accessible animation',
    level: 'Core',
    answer:
      'Some users get dizzy from motion and turn on "reduce motion" in their OS. Respect it with @media (prefers-reduced-motion: reduce): remove parallax, large slides and auto-playing animations, or swap them for fades.',
    remember: 'If the user said "less motion", give them less motion.',
    code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
    diagram: {
      kind: 'compare',
      left: { title: 'default', tone: 'indigo', items: ['slide-in panels', 'parallax', 'smooth scroll'] },
      right: { title: 'reduce', tone: 'emerald', items: ['instant or fade', 'no parallax', 'jump scroll'] },
    },
  },
  {
    id: 'will-change',
    topic: 'css',
    title: 'will-change and GPU layers',
    level: 'Advanced',
    answer:
      'will-change: transform (or opacity) hints the browser to promote the element to its own compositor layer before it animates, avoiding a stutter on the first frame. Each layer costs GPU memory, so add it just before an animation and remove it after; never put it on everything.',
    remember: 'will-change is a reservation, not a free upgrade.',
    code: `.drawer { will-change: transform; }   /* only on the element that animates */`,
    diagram: {
      kind: 'compare',
      left: { title: 'good use', tone: 'emerald', items: ['an element about to animate', 'transform / opacity', 'removed when done'] },
      right: { title: 'bad use', tone: 'rose', items: ['* { will-change: transform }', 'hundreds of layers', 'memory spikes, blurry text'] },
    },
  },
  {
    id: 'css-architecture',
    topic: 'css',
    title: 'BEM vs CSS Modules vs CSS-in-JS vs Tailwind',
    level: 'Core',
    answer:
      'All of them fight global-namespace clashes in different ways. BEM is a naming convention (.card__title--active). CSS Modules scope class names at build time. CSS-in-JS (styled-components, emotion) writes styles in JS and can use props but adds runtime cost. Tailwind composes small utility classes in markup and ships only the classes you use.',
    remember: 'BEM = naming, Modules = build-time scope, CSS-in-JS = styles in JS, Tailwind = utilities in markup.',
    code: `/* BEM */ .card__title--active {}
/* CSS Modules */ import s from './Card.module.css'; <h3 className={s.title} />
/* Tailwind */ <h3 className="text-lg font-semibold text-slate-900" />`,
    diagram: {
      kind: 'table',
      head: ['approach', 'scoping', 'runtime cost', 'trade-off'],
      rows: [
        ['BEM', 'by convention', 'none', 'relies on discipline'],
        ['CSS Modules', 'build-time hashed classes', 'none', 'separate files'],
        ['CSS-in-JS', 'generated classes', 'some (runtime libs)', 'dynamic props, SSR setup'],
        ['Tailwind', 'utility classes', 'none', 'long class lists'],
      ],
    },
  },
  {
    id: 'cascade-layers',
    topic: 'css',
    title: 'What are cascade layers (@layer)?',
    level: 'Advanced',
    answer:
      '@layer lets you group CSS into named layers and decide their priority up front. A rule in a later layer beats an earlier layer regardless of specificity, so a reset or third-party library can be put in a low layer and your component CSS always wins without !important or specificity wars.',
    remember: 'Layer order beats specificity. Declare the order once.',
    code: `@layer reset, vendor, components, utilities;
@layer vendor { #app .btn { color: gray; } }
@layer components { .btn { color: teal; } }  /* wins */`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: 'unlayered styles', note: 'beat every layer', tone: 'rose' },
        { label: '@layer utilities', tone: 'amber' },
        { label: '@layer components', tone: 'indigo' },
        { label: '@layer vendor', tone: 'cyan' },
        { label: '@layer reset', note: 'lowest', tone: 'slate' },
      ],
    },
  },
  {
    id: 'render-blocking-css',
    topic: 'css',
    title: 'How do you load CSS without blocking the first paint?',
    level: 'Advanced',
    answer:
      'All stylesheets in <head> block rendering. Inline the small "critical" CSS needed for above-the-fold content, load the rest without blocking (media="print" swapped to all on load, or preload), split CSS per route, remove unused CSS and keep font loading separate with preload + font-display.',
    remember: 'Critical CSS inline, the rest later, nothing unused.',
    code: `<style>/* critical above-the-fold CSS */</style>
<link rel="stylesheet" href="/rest.css" media="print" onload="this.media='all'" />`,
    diagram: {
      kind: 'timeline',
      max: 10,
      rows: [
        { title: 'all CSS blocking', segs: [{ from: 0, to: 6, label: 'download big.css', tone: 'amber' }, { from: 6, to: 7, label: 'paint', tone: 'emerald' }] },
        { title: 'critical inline', segs: [{ from: 0, to: 1, label: 'paint', tone: 'emerald' }, { from: 1, to: 6, label: 'rest.css async', tone: 'slate' }] },
      ],
    },
  },
]
