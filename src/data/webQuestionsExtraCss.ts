import type { WebQuestion } from './webQuestions'

/** Second batch of CSS questions (merged into webQuestions). */
export const cssExtra: WebQuestion[] = [
  /* selectors */
  {
    id: 'attribute-selectors',
    topic: 'css',
    title: 'Attribute selectors: [attr], ^=, $=, *=',
    level: 'Basic',
    answer:
      'You can select by attributes: [disabled] (has it), [type="email"] (exact), [href^="https"] (starts with), [href$=".pdf"] (ends with), [class*="btn"] (contains), and add i for case-insensitive. They have the same specificity as a class (0-1-0). Handy for styling links by file type, ARIA states ([aria-expanded="true"]) and data-* states.',
    remember: '^ starts, $ ends, * anywhere.',
    code: `a[href^="http"]    { /* external */ }
a[href$=".pdf"]::after { content: " (PDF)"; }
[aria-expanded="true"] .chevron { rotate: 180deg; }
[data-state="error"] { border-color: red; }`,
    diagram: {
      kind: 'table',
      head: ['selector', 'matches'],
      rows: [
        ['[disabled]', 'attribute exists'],
        ['[type="email"]', 'exact value'],
        ['[href^="https"]', 'starts with'],
        ['[href$=".pdf"]', 'ends with'],
        ['[class*="btn"]', 'contains anywhere'],
        ['[lang|="en"]', '"en" or "en-…"'],
      ],
    },
  },
  {
    id: 'focus-visible',
    topic: 'css',
    title: ':focus vs :focus-visible vs :focus-within',
    level: 'Core',
    answer:
      ':focus matches whenever an element has focus, including after a mouse click. :focus-visible matches only when the browser thinks a ring is useful — mainly keyboard focus — so you can show a strong outline for keyboard users without a ring on every click. :focus-within matches a parent when anything inside it has focus (highlight a whole form row or search bar).',
    remember: 'focus = always, focus-visible = keyboard, focus-within = "my child is focused".',
    code: `button:focus { outline: none; }               /* ❌ hides it from keyboard users too */
button:focus-visible { outline: 3px solid #4f46e5; outline-offset: 2px; }
.search:focus-within { box-shadow: 0 0 0 3px #c7d2fe; }`,
    diagram: {
      kind: 'table',
      head: ['', 'mouse click', 'Tab key', 'matches on'],
      rows: [
        [':focus', 'yes', 'yes', 'the element'],
        [':focus-visible', 'usually no', 'yes', 'the element'],
        [':focus-within', 'yes', 'yes', 'any ancestor'],
      ],
    },
  },

  /* box model & positioning */
  {
    id: 'float-clearfix',
    topic: 'css',
    title: 'Floats and the clearfix',
    level: 'Core',
    answer:
      'float takes an element out of normal flow and pushes it left or right so text wraps around it (its real job: images in articles). The parent no longer counts floated children in its height, so it "collapses". Fixes: display: flow-root on the parent (creates a BFC, the modern clearfix), the old ::after { content:""; clear:both } hack, or overflow: hidden. For layout, use flex or grid instead.',
    remember: 'Floats are for wrapping text; flow-root is the modern clearfix.',
    code: `.media img { float: left; margin-right: 12px; }
.media { display: flow-root; }   /* parent now contains the float */

/* old way */
.clearfix::after { content: ""; display: table; clear: both; }`,
    diagram: {
      kind: 'compare',
      left: { title: 'without clearfix', tone: 'rose', items: ['float leaves the flow', 'parent height = only text', 'next section slides up'] },
      right: { title: 'display: flow-root', tone: 'emerald', items: ['parent becomes a BFC', 'contains the float', 'no hacks, no clipping'] },
    },
  },
  {
    id: 'overflow',
    topic: 'css',
    title: 'overflow: visible vs hidden vs scroll vs auto vs clip',
    level: 'Basic',
    answer:
      'overflow decides what happens to content bigger than its box. visible (default) lets it spill out; hidden cuts it off but still lets JS scroll it; clip cuts it off with no scrolling at all and does not create a scroll container (so sticky inside still works); scroll always shows scrollbars; auto shows them only when needed. Any value other than visible/clip creates a scroll container and a new BFC.',
    remember: 'auto is what you usually want; hidden/scroll break position: sticky inside.',
    code: `.panel { max-height: 300px; overflow-y: auto; }
.card  { overflow: clip; border-radius: 12px; } /* clip the image corners */

.a { overflow: hidden; }   /* clips, no scrollbar, still scrollable by JS */
.b { overflow: scroll; }   /* always shows scrollbars */
.c { overflow: visible; }  /* default: content spills out */`,
    diagram: {
      kind: 'table',
      head: ['value', 'extra content', 'scrollbar', 'scroll container'],
      rows: [
        ['visible', 'spills out', 'no', 'no'],
        ['hidden', 'cut off', 'no (JS can scroll)', 'yes'],
        ['clip', 'cut off', 'no', 'no'],
        ['scroll', 'scrolls', 'always', 'yes'],
        ['auto', 'scrolls', 'when needed', 'yes'],
      ],
    },
  },
  {
    id: 'inline-block-gap',
    topic: 'css',
    title: 'Why is there a gap between inline-block elements (and under images)?',
    level: 'Core',
    answer:
      'Inline-block elements sit on a text line, so the whitespace (newline + indent) between them in the HTML becomes a real space character. Images are inline too and sit on the text baseline, which leaves a few pixels under them for letter descenders like g and y. Fix the first with flex/grid (or gap) on the parent, and the second with display: block or vertical-align: middle on the image.',
    remember: 'Inline things are text: spaces between tags are spaces, and images sit on the baseline.',
    code: `.tabs { display: flex; gap: 8px; }   /* instead of inline-block */
img { display: block; }              /* no gap under images */`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '</li> ↵ <li>', note: 'newline + indent in HTML', tone: 'slate' },
        { label: 'collapses to one space', tone: 'amber' },
        { label: '~4px gap between items', tone: 'rose' },
        { label: 'fix: flex + gap', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'vertical-align',
    topic: 'css',
    title: 'What does vertical-align actually do?',
    level: 'Core',
    answer:
      'vertical-align only works on inline, inline-block and table-cell elements. It aligns an inline thing relative to the line it sits on (baseline, middle, top, text-bottom…) — for example an icon next to text. It does NOT vertically centre a block inside its parent; that is a job for flex (align-items: center) or grid (place-items: center).',
    remember: 'vertical-align lines things up inside a line of text, not inside a box.',
    code: `.icon { vertical-align: middle; }        /* icon next to text */
.parent { display: flex; align-items: center; } /* centre a child */`,
    diagram: {
      kind: 'compare',
      left: { title: 'works on', tone: 'emerald', items: ['inline / inline-block', 'images, icons in text', 'table cells'] },
      right: { title: 'does not', tone: 'rose', items: ['block children', 'centring in a parent', '→ use flex / grid'] },
    },
  },
  {
    id: 'pointer-events',
    topic: 'css',
    title: 'pointer-events: none — what is it for?',
    level: 'Basic',
    answer:
      'pointer-events: none makes an element ignore the mouse and touch: clicks and hovers go through to whatever is underneath. Useful for decorative overlays, a gradient fade over a list, icons inside a button, or disabled-looking links. It does not stop keyboard focus or Enter, so for a real disabled control use the disabled attribute (or aria-disabled plus handling).',
    remember: 'pointer-events: none = the element becomes a ghost for the mouse, not for the keyboard.',
    code: `.fade-overlay { position: absolute; inset: 0; pointer-events: none; }
.btn svg { pointer-events: none; } /* event.target is always the button */`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'overlay (pointer-events: none)', note: 'click passes through', tone: 'slate' },
        { label: 'list item underneath', note: 'gets the click', tone: 'emerald' },
      ],
    },
  },

  /* flexbox & grid */
  {
    id: 'flex-wrap-align',
    topic: 'css',
    title: 'justify-content vs align-items vs align-content',
    level: 'Core',
    answer:
      'justify-content spreads items along the main axis (row: left ↔ right). align-items lines items up on the cross axis within each line (row: top ↕ bottom). align-content spreads the LINES themselves on the cross axis, so it only does something when flex-wrap: wrap creates more than one line and there is extra height. align-self overrides align-items for one item.',
    remember: 'justify = main axis, align-items = inside each line, align-content = between lines (needs wrap).',
    code: `.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; /* main axis */
  align-items: center;            /* each line */
  align-content: flex-start;      /* the lines, when wrapped */
}`,
    diagram: {
      kind: 'table',
      head: ['property', 'axis', 'moves'],
      rows: [
        ['justify-content', 'main', 'items along the row'],
        ['align-items', 'cross', 'items inside their line'],
        ['align-content', 'cross', 'whole lines (only with wrap)'],
        ['align-self', 'cross', 'one item'],
      ],
    },
  },
  {
    id: 'gap-vs-margin',
    topic: 'css',
    title: 'gap vs margin for spacing',
    level: 'Basic',
    answer:
      'gap (in flex and grid) puts space only BETWEEN items, never on the outer edges, and it never collapses. With margins you get extra space on the last item, need :last-child or negative-margin hacks, and vertical margins can collapse. Prefer gap for lists and layouts; keep margin for spacing an element from things outside its container.',
    remember: 'gap = space between, margin = space around.',
    code: `/* ❌ */ .list > * + * { margin-left: 12px; }
/* ✅ */ .list { display: flex; gap: 12px; }`,
    diagram: {
      kind: 'compare',
      left: { title: 'margin', tone: 'amber', items: ['on each item', 'edge items need fixes', 'vertical margins collapse'] },
      right: { title: 'gap', tone: 'emerald', items: ['on the container', 'only between items', 'works with wrap, never collapses'] },
    },
  },
  {
    id: 'subgrid',
    topic: 'css',
    title: 'What is subgrid?',
    level: 'Advanced',
    answer:
      'Normally a nested grid has its own tracks, so the title, text and button rows of sibling cards do not line up. With grid-template-rows: subgrid (or columns) the child grid reuses the parent\'s tracks, so every card\'s title row is as tall as the tallest title and the buttons all sit on one line.',
    remember: 'subgrid = children borrow the parent\'s ruler, so siblings line up.',
    code: `.cards { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto auto 1fr auto; }
.card  { grid-row: span 4; display: grid; grid-template-rows: subgrid; }`,
    diagram: {
      kind: 'compare',
      left: { title: 'nested grid', tone: 'rose', items: ['each card has its own rows', 'titles of 1 vs 2 lines', 'buttons at different heights'] },
      right: { title: 'subgrid', tone: 'emerald', items: ['cards share parent rows', 'title rows equal', 'buttons line up'] },
    },
  },

  /* responsive */
  {
    id: 'viewport-units',
    topic: 'css',
    title: '100vh on mobile, and dvh / svh / lvh',
    level: 'Core',
    answer:
      'On phones the browser toolbars grow and shrink while you scroll, and 100vh is the LARGEST viewport, so a 100vh hero is cut off behind the toolbar. New units fix it: svh = small viewport (toolbars shown), lvh = large (toolbars hidden), dvh = dynamic (changes as they move). Use 100svh for full-screen sections that must fit, and 100dvh when it should follow the toolbar (can cause small jumps).',
    remember: 's = small (safe), l = large, d = dynamic. 100vh ≈ 100lvh.',
    code: `.hero { min-height: 100vh; min-height: 100svh; } /* fallback first */
.app  { height: 100dvh; }`,
    diagram: {
      kind: 'table',
      head: ['unit', 'means', 'use for'],
      rows: [
        ['vh / lvh', 'toolbars hidden (biggest)', 'old default, may be cut off'],
        ['svh', 'toolbars shown (smallest)', 'hero that must fully fit'],
        ['dvh', 'changes live', 'full-height app shells'],
      ],
    },
  },
  {
    id: 'logical-properties',
    topic: 'css',
    title: 'Logical properties (margin-inline, padding-block, inset)',
    level: 'Core',
    answer:
      'Logical properties follow the writing direction instead of the screen: inline = the text direction (left/right in English, right/left in Arabic), block = the line direction (top/bottom). margin-inline-start is the left margin in LTR and the right one in RTL, so one stylesheet works for both. Also handy shorthands: padding-block: 8px; inset: 0 (top/right/bottom/left).',
    remember: 'inline = along the text, block = across the lines; start/end flip with dir="rtl".',
    code: `.icon  { margin-inline-end: 8px; }   /* right in LTR, left in RTL */
.card  { padding-block: 12px; padding-inline: 16px; }
.cover { position: absolute; inset: 0; }`,
    diagram: {
      kind: 'table',
      head: ['physical', 'logical (LTR)'],
      rows: [
        ['margin-left', 'margin-inline-start'],
        ['margin-right', 'margin-inline-end'],
        ['padding-top + bottom', 'padding-block'],
        ['width / height', 'inline-size / block-size'],
        ['top right bottom left', 'inset'],
      ],
    },
  },

  /* theming */
  {
    id: 'css-nesting',
    topic: 'css',
    title: 'Native CSS nesting',
    level: 'Core',
    answer:
      'CSS now supports nesting like Sass: write child rules inside the parent, use & for the parent (&:hover, &.active, .dark &), and nest media queries inside a rule. Differences from Sass: nested selectors behave like :is(), so specificity follows the most specific item in the list, and & cannot be glued to build new class names (&__title does not work).',
    remember: 'Same feel as Sass, but no string-joining (&__title) and specificity works like :is().',
    code: `.card {
  padding: 16px;
  & h3 { margin: 0; }
  &:hover { box-shadow: 0 4px 12px #0002; }
  .dark & { background: #111; }
  @media (width > 600px) { padding: 24px; }
}`,
    diagram: {
      kind: 'compare',
      left: { title: 'native nesting', tone: 'emerald', items: ['no build step', '& = parent', 'nested @media works'] },
      right: { title: 'Sass only', tone: 'amber', items: ['&__title string joining', 'mixins, loops, functions', 'compiled at build time'] },
    },
  },
  {
    id: 'currentcolor',
    topic: 'css',
    title: 'What is currentColor?',
    level: 'Basic',
    answer:
      'currentColor is a keyword equal to the element\'s current color value. Use it for borders, box-shadows and SVG fill/stroke so icons and outlines automatically follow the text colour — change color once (on hover, in dark mode) and everything updates. It is also the default value of border-color.',
    remember: 'Set color once; currentColor makes borders and icons follow it.',
    code: `.btn { color: #4f46e5; border: 2px solid currentColor; }
.btn:hover { color: #db2777; }   /* border and icon change too */
.btn svg { fill: currentColor; }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'color: #4f46e5', tone: 'indigo' },
        { label: 'border: currentColor', tone: 'cyan' },
        { label: 'svg fill: currentColor', tone: 'emerald' },
        { label: 'hover → one change, all follow', tone: 'amber' },
      ],
    },
  },

  /* animation & performance */
  {
    id: 'font-display',
    topic: 'css',
    title: 'Web fonts: FOIT, FOUT and font-display',
    level: 'Core',
    answer:
      'While a web font downloads the browser either hides the text (FOIT, flash of invisible text) or shows a fallback font and swaps later (FOUT). font-display picks the rule: swap shows the fallback at once and swaps when ready (good for body text, small layout shift), optional uses the font only if it arrives very fast (no shift at all), block hides text for up to ~3 s. Preload the main font, self-host it, use woff2, and match the fallback size with size-adjust to reduce the shift.',
    remember: 'swap = never invisible, optional = never shifts.',
    code: `@font-face {
  font-family: Inter;
  src: url(/fonts/inter.woff2) format('woff2');
  font-display: swap;
}
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>`,
    diagram: {
      kind: 'timeline',
      max: 10,
      rows: [
        { title: 'block', segs: [{ from: 0, to: 3, label: 'invisible', tone: 'rose' }, { from: 3, to: 10, label: 'web font', tone: 'emerald' }] },
        { title: 'swap', segs: [{ from: 0, to: 3, label: 'fallback', tone: 'amber' }, { from: 3, to: 10, label: 'web font (shift)', tone: 'emerald' }] },
        { title: 'optional', segs: [{ from: 0, to: 10, label: 'fallback (font too slow)', tone: 'amber' }] },
      ],
    },
  },
  {
    id: 'content-visibility',
    topic: 'css',
    title: 'content-visibility: auto and CSS containment',
    level: 'Advanced',
    answer:
      'contain tells the browser an element is independent (contain: layout paint) so changes inside it do not trigger work outside. content-visibility: auto goes further: the browser skips layout and paint for off-screen sections until they come near the viewport, which can cut first render time on long pages. Pair it with contain-intrinsic-size so the skipped section keeps a height and the scrollbar does not jump.',
    remember: 'content-visibility: auto = "do not render what nobody can see yet".',
    code: `.feed-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px; /* placeholder height */
}`,
    diagram: {
      kind: 'compare',
      left: { title: 'default', tone: 'rose', items: ['all 200 sections laid out', 'and painted on load', 'slow first render'] },
      right: { title: 'content-visibility: auto', tone: 'emerald', items: ['only visible sections rendered', 'others keep a placeholder size', 'rendered when scrolled near'] },
    },
  },
  {
    id: 'transform-order',
    topic: 'css',
    title: 'Does the order of transforms matter?',
    level: 'Core',
    answer:
      'Yes. Transforms are applied right to left, and each one changes the coordinate system for the next. translateX(100px) rotate(45deg) moves then spins in place; rotate(45deg) translateX(100px) spins the axes first, so the move goes diagonally. The separate translate, rotate and scale properties always apply in a fixed order (translate → rotate → scale) and can be animated independently.',
    remember: 'Read transforms right to left: the last one happens first.',
    code: `.a { transform: translateX(100px) rotate(45deg); } /* moves right, then spins */
.b { transform: rotate(45deg) translateX(100px); } /* moves diagonally */

.c { translate: 100px 0; rotate: 45deg; scale: 1.2; } /* independent properties */`,
    diagram: {
      kind: 'compare',
      left: { title: 'translateX(100px) rotate(45deg)', tone: 'indigo', items: ['rotate the box in place', 'then move it right', 'ends 100px to the right'] },
      right: { title: 'rotate(45deg) translateX(100px)', tone: 'amber', items: ['move along the box\'s own x', 'axis is turned 45°', 'ends down and to the right'] },
    },
  },
  {
    id: 'animate-height-auto',
    topic: 'css',
    title: 'How do you animate height: auto?',
    level: 'Advanced',
    answer:
      'height cannot transition to or from auto in older CSS because auto is not a number. Options: animate grid-template-rows from 0fr to 1fr (works everywhere today), animate max-height to a big value (simple but timing is off), measure scrollHeight in JS, or use the new interpolate-size: allow-keywords / calc-size(auto) in supporting browsers. Avoid animating height on large areas — it triggers layout every frame.',
    remember: 'Grid trick: 0fr → 1fr.',
    code: `.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s; }
.panel.open { grid-template-rows: 1fr; }
.panel > div { overflow: hidden; }

/* newer browsers */
:root { interpolate-size: allow-keywords; }`,
    diagram: {
      kind: 'table',
      head: ['way', 'smooth?', 'note'],
      rows: [
        ['height: 0 → auto', 'no', 'jumps, auto is not a number'],
        ['max-height: 0 → 1000px', 'kind of', 'wrong duration / delay'],
        ['grid rows 0fr → 1fr', 'yes', 'works in all modern browsers'],
        ['interpolate-size', 'yes', 'newest, not everywhere yet'],
      ],
    },
  },
  {
    id: 'scroll-snap',
    topic: 'css',
    title: 'Scroll snap for carousels',
    level: 'Core',
    answer:
      'scroll-snap-type on the scroll container (x mandatory) plus scroll-snap-align on the children (start/center) makes scrolling stop neatly on each slide, with native touch momentum and no JavaScript. scroll-padding offsets the snap point (e.g. for a fixed header), and scroll-behavior: smooth animates scrollIntoView and anchor jumps.',
    remember: 'Container says "snap", children say where to stop.',
    code: `.carousel {
  display: flex; gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carousel > .slide { flex: 0 0 80%; scroll-snap-align: center; }`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'user swipes', tone: 'indigo' },
        { label: 'native momentum scroll', tone: 'slate' },
        { label: 'browser picks nearest snap point', tone: 'amber' },
        { label: 'slide stops centred', tone: 'emerald' },
      ],
    },
  },
]
