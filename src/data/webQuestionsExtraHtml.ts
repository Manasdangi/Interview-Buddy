import type { WebQuestion } from './webQuestions'

/** Second batch of HTML questions (merged into webQuestions). */
export const htmlExtra: WebQuestion[] = [
  /* markup & semantics */
  {
    id: 'id-vs-class',
    topic: 'html',
    title: 'id vs class',
    level: 'Basic',
    answer:
      'An id must be unique on the page and names ONE element: it is used for fragment links (#section), label for="", ARIA references and getElementById. A class can be shared by many elements and is what you style with. Ids also carry much higher CSS specificity, which makes them hard to override.',
    points: ['Style with classes, reference with ids.', 'Duplicate ids break label/aria links and getElementById returns only the first.'],
    remember: 'id = Aadhaar number (one person), class = job title (many people).',
    code: `<h2 id="pricing">Pricing</h2>          <!-- /page#pricing scrolls here -->
<a href="#pricing">Jump to pricing</a>
<button class="btn btn-primary">Buy</button>
<button class="btn">Cancel</button>`,
    diagram: {
      kind: 'compare',
      left: { title: 'id', tone: 'rose', items: ['unique on the page', '#hash links, label for, aria-*', 'specificity 1-0-0', 'getElementById'] },
      right: { title: 'class', tone: 'emerald', items: ['reusable on many elements', 'many per element', 'specificity 0-1-0', 'querySelectorAll / classList'] },
    },
  },
  {
    id: 'html5-features',
    topic: 'html',
    title: 'What did HTML5 add?',
    level: 'Basic',
    answer:
      'HTML5 added semantic elements (header, nav, main, article, section, aside, footer), native <audio>/<video>, <canvas> and inline SVG, new input types (email, date, number, range) with built-in validation, data-* attributes, and browser APIs that came with it: localStorage, Geolocation, History API, Web Workers, drag and drop, and a simple <!DOCTYPE html>.',
    remember: 'HTML5 = meaning (semantic tags) + media (audio, video, canvas) + forms (types, validation) + APIs (storage, history, workers).',
    diagram: {
      kind: 'lanes',
      lanes: [
        { title: 'semantics', tone: 'indigo', items: ['header nav main', 'article section aside', 'footer figure time'] },
        { title: 'media', tone: 'amber', items: ['<audio> <video>', '<canvas>', 'inline <svg>'] },
        { title: 'forms', tone: 'emerald', items: ['email url tel', 'date number range', 'required pattern'] },
        { title: 'APIs', tone: 'cyan', items: ['localStorage', 'History, Geolocation', 'Workers, drag & drop'] },
      ],
    },
  },
  {
    id: 'heading-structure',
    topic: 'html',
    title: 'How should headings (h1–h6) be used?',
    level: 'Basic',
    answer:
      'Headings form the outline of the page. Use one h1 for the page topic, then go down one level at a time (h2 → h3) without skipping, and choose the level by meaning, not by size — size is CSS. Screen-reader users jump between headings to scan a page, and search engines use them to understand it.',
    remember: 'Headings are the table of contents, not a font-size picker.',
    code: `<h1>Car service</h1>
  <h2>Pricing</h2>
    <h3>Basic plan</h3>
    <h3>Premium plan</h3>
  <h2>FAQ</h2>

/* want a small-looking h2? */
.faq h2 { font-size: 1rem; }`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'h1 · page topic', note: 'one per page', tone: 'indigo' },
        { label: 'h2 · section', tone: 'emerald' },
        { label: 'h3 · sub-section', note: 'never jump h2 → h4', tone: 'amber' },
      ],
    },
  },
  {
    id: 'html-entities',
    topic: 'html',
    title: 'What are HTML entities and when do you need them?',
    level: 'Basic',
    answer:
      'Some characters have meaning in HTML: < starts a tag, & starts an entity, " ends an attribute. To show them as text you escape them: &lt; &gt; &amp; &quot;. &nbsp; is a non-breaking space (keeps "10 km" on one line). With UTF-8 you can type most other symbols directly. Escaping user input is also the basic defence against XSS.',
    remember: 'If the browser might read it as code, escape it: &lt; &gt; &amp; &quot;.',
    diagram: {
      kind: 'table',
      head: ['you want', 'write', 'why'],
      rows: [
        ['<', '&lt;', 'would start a tag'],
        ['>', '&gt;', 'would end a tag'],
        ['&', '&amp;', 'would start an entity'],
        ['"', '&quot;', 'would end an attribute'],
        ['space that never wraps', '&nbsp;', '"10&nbsp;km" stays together'],
      ],
    },
  },
  {
    id: 'details-summary',
    topic: 'html',
    title: 'How do you build an accordion without JavaScript?',
    level: 'Basic',
    answer:
      '<details> with a <summary> is a native disclosure widget: clicking (or Enter/Space on) the summary toggles the content, and it is keyboard and screen-reader accessible out of the box. The open attribute sets the initial state, the toggle event tells you when it changes, and giving several <details> the same name attribute makes only one open at a time.',
    remember: '<details> = free accordion: keyboard, a11y and state included.',
    code: `<details name="faq" open>
  <summary>Is the service free?</summary>
  <p>The first check-up is free.</p>
</details>
<details name="faq">
  <summary>How long does it take?</summary>
  <p>About 2 hours.</p>
</details>`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'click / Enter on <summary>', tone: 'indigo' },
        { label: 'browser toggles [open]', tone: 'emerald' },
        { label: '"toggle" event fires', tone: 'amber' },
        { label: 'same name → others close', note: 'exclusive accordion', tone: 'cyan' },
      ],
    },
  },
  {
    id: 'template-element',
    topic: 'html',
    title: 'What is the <template> element?',
    level: 'Core',
    answer:
      'Content inside <template> is parsed but NOT rendered: images do not load, scripts do not run and it is not in the page. You clone template.content with JavaScript and insert copies, which is faster and safer than building strings for innerHTML. Web Components use it for their shadow DOM markup together with <slot>.',
    remember: 'A <template> is a cookie cutter: inert until you clone it.',
    code: `<template id="row">
  <li class="item"><span class="name"></span></li>
</template>

const tpl = document.getElementById('row')
for (const user of users) {
  const node = tpl.content.cloneNode(true)
  node.querySelector('.name').textContent = user.name
  list.append(node)
}`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '<template> parsed', note: 'inert: no render, no fetch', tone: 'slate' },
        { label: 'content.cloneNode(true)', tone: 'indigo' },
        { label: 'fill with textContent', note: 'no XSS', tone: 'emerald' },
        { label: 'append to the DOM', tone: 'amber' },
      ],
    },
  },

  /* loading & performance */
  {
    id: 'fetchpriority',
    topic: 'html',
    title: 'fetchpriority, loading="lazy" and decoding — which image gets what?',
    level: 'Advanced',
    answer:
      'The LCP image (usually the hero) should load as early as possible: no lazy loading, and fetchpriority="high" so the browser does not queue it behind other images. Images below the fold get loading="lazy" so they load only near the viewport. decoding="async" lets the browser decode an image off the main thread. Width and height attributes reserve space so nothing shifts.',
    points: ['Never lazy-load the LCP image: it delays the most important paint.', 'fetchpriority also works on <link rel="preload"> and fetch().'],
    remember: 'Hero: high + eager. Everything below the fold: lazy.',
    code: `<!-- hero, above the fold -->
<img src="hero.webp" width="1200" height="600" fetchpriority="high" alt="…">

<!-- gallery, below the fold -->
<img src="car-2.webp" width="400" height="300" loading="lazy" decoding="async" alt="…">`,
    diagram: {
      kind: 'table',
      head: ['image', 'loading', 'fetchpriority', 'why'],
      rows: [
        ['hero / LCP', 'eager (default)', 'high', 'it is the Largest Contentful Paint'],
        ['above-the-fold icons', 'eager', 'auto', 'small, needed now'],
        ['below the fold', 'lazy', 'auto / low', 'load only when near'],
        ['carousel slide 2+', 'lazy', 'low', 'hidden at first'],
      ],
    },
  },
  {
    id: 'ssr-csr-ssg',
    topic: 'html',
    title: 'CSR vs SSR vs SSG (and hydration)',
    level: 'Core',
    answer:
      'CSR: the server sends an almost empty HTML and JavaScript builds the page in the browser — slow first paint and weaker SEO, but cheap servers. SSR: the server renders HTML for every request, so content shows fast, then JavaScript hydrates it (attaches event handlers) to make it interactive. SSG: HTML is built once at build time and served from a CDN — fastest, but only for content that does not change per request. ISR re-builds static pages in the background.',
    remember: 'CSR = browser cooks. SSR = kitchen cooks per order. SSG = cooked in advance and kept warm.',
    diagram: {
      kind: 'table',
      head: ['', 'HTML made', 'first paint', 'SEO', 'good for'],
      rows: [
        ['CSR', 'in the browser', 'slow', 'weak', 'dashboards behind login'],
        ['SSR', 'per request on server', 'fast', 'strong', 'personalised, changing pages'],
        ['SSG', 'at build time', 'fastest (CDN)', 'strong', 'blogs, docs, marketing'],
        ['ISR', 'build + background refresh', 'fastest', 'strong', 'listings that change hourly'],
      ],
    },
  },
  {
    id: 'canonical-robots',
    topic: 'html',
    title: 'Canonical URLs, robots meta and sitemaps (SEO basics)',
    level: 'Core',
    answer:
      '<link rel="canonical"> tells search engines which URL is the original when the same content is reachable at several URLs (filters, UTM params), so ranking is not split. <meta name="robots" content="noindex"> keeps a page out of results; robots.txt only stops crawling, not indexing. A sitemap.xml lists the URLs you want crawled. Structured data (JSON-LD) can unlock rich results.',
    remember: 'canonical = "this is the original", noindex = "do not show me", robots.txt = "do not walk here".',
    code: `<link rel="canonical" href="https://spinny.com/cars/delhi" />
<meta name="robots" content="noindex, follow" />

<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Product", "name": "Car service" }
</script>`,
    diagram: {
      kind: 'table',
      head: ['tool', 'what it controls'],
      rows: [
        ['rel="canonical"', 'which duplicate URL gets the ranking'],
        ['meta robots noindex', 'page is not shown in results'],
        ['robots.txt Disallow', 'bots do not crawl the path (may still be indexed)'],
        ['sitemap.xml', 'list of URLs you want discovered'],
        ['JSON-LD', 'rich results: price, rating, FAQ'],
      ],
    },
  },

  /* forms & accessibility */
  {
    id: 'alt-text',
    topic: 'html',
    title: 'How do you write good alt text?',
    level: 'Basic',
    answer:
      'alt replaces the image when it cannot be seen (screen readers, slow networks, broken links). Describe what the image means in this context, not "image of". Decorative images get alt="" so screen readers skip them; leaving alt out makes many screen readers read the file name. An image inside a link describes where the link goes.',
    remember: 'Ask "what would I say on a phone call?" — and say nothing (alt="") for decoration.',
    code: `<img src="swift.jpg" alt="Red 2021 Maruti Swift, front view">
<img src="divider.svg" alt="">            <!-- decorative -->
<a href="/"><img src="logo.svg" alt="Spinny home"></a>`,
    diagram: {
      kind: 'compare',
      left: { title: 'bad', tone: 'rose', items: ['alt missing → reads "IMG_2041.jpg"', 'alt="image"', 'alt="logo" on a home link'] },
      right: { title: 'good', tone: 'emerald', items: ['alt="Red 2021 Swift, front view"', 'alt="" on decoration', 'alt="Spinny home" on the link'] },
    },
  },
  {
    id: 'label-input',
    topic: 'html',
    title: 'Why does every input need a <label>?',
    level: 'Basic',
    answer:
      'A label gives the input an accessible name that screen readers announce, and clicking the label focuses the input (a bigger tap target, great for checkboxes). Link them with for="id" or by wrapping the input. A placeholder is NOT a label: it disappears when you type and often has poor contrast. If a visible label is impossible, use aria-label.',
    remember: 'Placeholder is a hint; label is the name.',
    code: `<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" />

<label><input type="checkbox" name="terms" /> I accept the terms</label>`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: '<label for="email">', tone: 'indigo' },
        { label: 'input gets a name', note: 'screen reader: "Email, edit text"', tone: 'emerald' },
        { label: 'click label → input focused', note: 'bigger target', tone: 'amber' },
      ],
    },
  },
  {
    id: 'input-types-autocomplete',
    topic: 'html',
    title: 'Input types, inputmode and autocomplete',
    level: 'Core',
    answer:
      'type changes behaviour and validation: email, tel, url, number, date. On phones it also picks the keyboard. inputmode picks only the keyboard (inputmode="numeric" for an OTP or PIN that is not really a number). autocomplete tells the browser and password managers what the field is (email, one-time-code, cc-number, new-password) so they can fill it in.',
    points: ['Use type="tel" or inputmode="numeric" for OTPs, not type="number" (that adds spinners and drops leading zeros).', 'autocomplete="one-time-code" lets phones offer the SMS code.'],
    remember: 'type = what it is, inputmode = which keyboard, autocomplete = what to fill.',
    code: `<input type="email" autocomplete="email" />
<input type="tel" autocomplete="tel" />
<input inputmode="numeric" autocomplete="one-time-code" maxlength="6" />
<input type="password" autocomplete="new-password" />`,
    diagram: {
      kind: 'table',
      head: ['field', 'type', 'inputmode', 'autocomplete'],
      rows: [
        ['email', 'email', '—', 'email'],
        ['phone', 'tel', '—', 'tel'],
        ['OTP', 'text', 'numeric', 'one-time-code'],
        ['amount', 'text', 'decimal', '—'],
        ['new password', 'password', '—', 'new-password'],
      ],
    },
  },
  {
    id: 'aria-rules',
    topic: 'html',
    title: 'When should you use ARIA?',
    level: 'Core',
    answer:
      'The first rule of ARIA: do not use it if a native element does the job (<button>, not <div role="button">). ARIA only changes what assistive technology is told; it adds no keyboard support or behaviour. Use it to fill gaps: aria-label for icon-only buttons, aria-expanded on toggles, aria-live for messages that appear, aria-describedby for hints and errors, aria-hidden to hide decoration.',
    remember: 'No ARIA is better than bad ARIA. ARIA changes what is said, not what happens.',
    code: `<button aria-label="Close dialog">✕</button>
<button aria-expanded="false" aria-controls="menu">Menu</button>
<input aria-describedby="pwd-hint" type="password" />
<p id="pwd-hint">At least 8 characters</p>
<div aria-live="polite">Saved!</div>`,
    diagram: {
      kind: 'ladder',
      rungs: [
        { label: '1. native element', note: '<button>, <a href>, <input>, <dialog>', tone: 'emerald' },
        { label: '2. native + ARIA state', note: 'aria-expanded, aria-current', tone: 'cyan' },
        { label: '3. ARIA name / description', note: 'aria-label, aria-describedby', tone: 'amber' },
        { label: '4. role on a div', note: 'last resort: you must add keyboard + focus', tone: 'rose' },
      ],
    },
  },
  {
    id: 'skip-link-focus',
    topic: 'html',
    title: 'Focus management: skip links, focus traps and focus return',
    level: 'Advanced',
    answer:
      'Keyboard users move with Tab, so focus must go somewhere sensible. A skip link ("Skip to content") is the first focusable thing and jumps past the menu. A modal must move focus into itself, keep Tab inside (focus trap) and give focus back to the button that opened it when it closes; native <dialog> with showModal() does most of this. After a route change in a SPA, move focus to the new h1. Never remove the focus outline without a replacement.',
    remember: 'Focus in, focus kept, focus back.',
    code: `<a class="skip" href="#main">Skip to content</a>
…
<main id="main" tabindex="-1">…</main>

// modal
const opener = document.activeElement
dialog.showModal()        // focus moves in, Tab stays in
dialog.addEventListener('close', () => opener.focus())`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'button opens modal', tone: 'indigo' },
        { label: 'focus moves into modal', tone: 'emerald' },
        { label: 'Tab cycles inside', note: 'focus trap', tone: 'amber' },
        { label: 'Esc / close', tone: 'slate' },
        { label: 'focus returns to button', tone: 'cyan' },
      ],
    },
  },

  /* security */
  {
    id: 'xss-vs-csrf',
    topic: 'html',
    title: 'XSS vs CSRF',
    level: 'Core',
    answer:
      'XSS (cross-site scripting): an attacker gets THEIR script to run on YOUR site, usually through unescaped user input, and can then read the page, steal tokens and act as the user. Defend by escaping output (textContent, framework escaping), avoiding innerHTML/dangerouslySetInnerHTML, sanitising rich text and adding a CSP. CSRF (cross-site request forgery): another site makes the user\'s browser send a request to your site with their cookies. Defend with SameSite cookies, CSRF tokens and checking the Origin header.',
    remember: 'XSS = bad code runs on your site. CSRF = your site trusts a request the user never meant to send.',
    diagram: {
      kind: 'compare',
      left: { title: 'XSS', tone: 'rose', items: ['attacker script runs in your page', 'cause: unescaped input', 'fix: escape, sanitise, CSP', 'HttpOnly limits cookie theft'] },
      right: { title: 'CSRF', tone: 'amber', items: ['evil site triggers a request', 'cause: cookies sent automatically', 'fix: SameSite, CSRF token', 'check Origin / Referer'] },
    },
  },
  {
    id: 'clickjacking',
    topic: 'html',
    title: 'What is clickjacking and how do you stop it?',
    level: 'Core',
    answer:
      'An attacker loads your site in an invisible iframe on top of their page and tricks the user into clicking your real buttons ("Delete account", "Pay"). Stop it by refusing to be framed: send the header Content-Security-Policy: frame-ancestors \'none\' (or \'self\'), or the older X-Frame-Options: DENY. This must be a response header; it cannot be set from inside the page.',
    remember: 'Do not let anyone put your site in a frame: frame-ancestors \'none\'.',
    code: `# response headers
Content-Security-Policy: frame-ancestors 'self'
X-Frame-Options: SAMEORIGIN   # older browsers`,
    diagram: {
      kind: 'nest',
      layers: [
        { label: 'evil.com page', note: '"Click to win a prize!"', tone: 'rose' },
        { label: 'invisible <iframe src="bank.com">', note: 'opacity: 0, on top', tone: 'amber' },
        { label: 'real "Transfer" button', note: 'the user actually clicks this', tone: 'slate' },
      ],
    },
  },
  {
    id: 'sri',
    topic: 'html',
    title: 'What is Subresource Integrity (SRI)?',
    level: 'Advanced',
    answer:
      'When you load a script or stylesheet from a CDN, you trust that CDN not to change it. SRI adds a hash of the exact file in the integrity attribute; the browser downloads the file, hashes it and refuses to run it if the hash does not match, so a hacked or changed CDN file cannot run on your site. Cross-origin files also need crossorigin="anonymous".',
    remember: 'integrity = a seal on the packet: broken seal, not used.',
    code: `<script
  src="https://cdn.example.com/lib@3.2.1/lib.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"></script>`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'download file from CDN', tone: 'indigo' },
        { label: 'hash it (sha384)', tone: 'amber' },
        { label: 'hash === integrity?', tone: 'cyan' },
        { label: 'yes → run · no → block', tone: 'emerald' },
      ],
    },
  },
  {
    id: 'https-hsts',
    topic: 'html',
    title: 'HTTPS, mixed content and HSTS',
    level: 'Core',
    answer:
      'HTTPS encrypts traffic with TLS so nobody on the network can read or change it, and it is required for service workers, geolocation and HTTP/2 in browsers. Mixed content is an http:// resource on an https:// page; browsers block or upgrade it. HSTS (Strict-Transport-Security header) tells the browser to always use HTTPS for your domain, even if the user types http://, which stops downgrade attacks.',
    remember: 'HTTPS locks the pipe; HSTS makes the browser never use the unlocked pipe again.',
    code: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
    diagram: {
      kind: 'flow',
      steps: [
        { label: 'user types http://site.com', tone: 'slate' },
        { label: 'browser knows HSTS for site', tone: 'amber' },
        { label: 'goes straight to https://', note: 'no insecure request at all', tone: 'emerald' },
      ],
    },
  },
]
