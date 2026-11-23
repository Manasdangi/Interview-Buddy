import type { Demo } from '../components/web/WebDemo'

/** Live demos for CSS questions, keyed by question id. Each variant is rendered by the real browser. */
export const cssDemos: Record<string, Demo> = {
  /* ── selectors & cascade ── */
  specificity: {
    hint: 'Switch the tabs: the text takes the colour of the most specific rule.',
    html: `<div class="a"><div class="b"><p id="msg" class="note">Which colour wins?</p></div></div>`,
    base: `p{font-size:24px;font-weight:800;margin:20px 0}`,
    height: 110,
    variants: [
      { label: 'tag only', css: `p { color: #3b6fd8; }          /* 0-0-1 → blue */` },
      { label: '+ class', css: `p     { color: #3b6fd8; }      /* 0-0-1 */\n.note { color: #0b7f73; }      /* 0-1-0 → teal wins */` },
      { label: '+ id', css: `p     { color: #3b6fd8; }      /* 0-0-1 */\n.note { color: #0b7f73; }      /* 0-1-0 */\n#msg  { color: #e2685f; }      /* 1-0-0 → red wins */` },
      { label: '3 classes vs 1 id', css: `.a .b .note { color: #0b7f73; } /* 0-3-0 */\n#msg        { color: #e2685f; } /* 1-0-0 → one id still wins */` },
    ],
  },
  'cascade-order': {
    hint: 'Same element, same property — which declaration survives?',
    html: `<p class="x">Hello cascade</p>`,
    base: `p{font-size:24px;font-weight:800;margin:20px 0}`,
    height: 110,
    variants: [
      { label: 'tie → last wins', css: `.x { color: #e2685f; }\n.x { color: #0b7f73; } /* later → teal */` },
      { label: 'more specific', css: `p.x { color: #e2685f; } /* 0-1-1 → red, even though it's first */\n.x  { color: #0b7f73; }` },
      { label: '!important', css: `.x { color: #e2685f !important; } /* beats everything normal */\n#nope, p.x.x { color: #0b7f73; }` },
    ],
  },
  'cascade-layers': {
    hint: 'A low layer loses even with a much more specific selector.',
    html: `<div id="app"><button class="btn box">Button</button></div>`,
    base: `.btn{border:0;font-size:18px;color:#fff}`,
    height: 90,
    variants: [
      { label: 'layer order wins', css: `@layer vendor, components;\n@layer vendor     { #app .btn { background: #e2685f; } } /* very specific */\n@layer components { .btn      { background: #0b7f73; } } /* later layer → wins */` },
      { label: 'unlayered beats all', css: `@layer vendor, components;\n@layer vendor     { #app .btn { background: #e2685f; } }\n@layer components { .btn      { background: #0b7f73; } }\n.btn { background: #3b6fd8; } /* not in a layer → wins */` },
    ],
  },
  inheritance: {
    hint: 'The span inherits colour and font; the border does not inherit, and buttons ignore it by default.',
    html: `<div class="card">Parent text · <span>a span</span> · <button>a button</button></div>`,
    base: `.card{color:#e2685f;font-family:Georgia,serif;font-size:18px;border:2px solid #e2685f;padding:14px;border-radius:8px}span{padding:2px}`,
    height: 100,
    variants: [
      { label: 'default', css: `/* color + font inherit to <span>; border does not.\n   <button> has its own browser font and colour. */` },
      { label: 'button inherits', css: `button { font: inherit; color: inherit; }` },
    ],
  },
  combinators: {
    hint: 'Yellow = matched by the selector on the tab.',
    html: `<div class="wrap frame"><h4>h4</h4><p>p 1</p><p>p 2</p><div class="frame"><p>nested p</p></div></div>`,
    base: `h4,p{margin:4px 0;padding:4px 8px;border-radius:4px;border:1px solid #dde1d5}`,
    height: 200,
    variants: [
      { label: '.wrap p', css: `.wrap p { background: #f0c04a; } /* any depth */` },
      { label: '.wrap > p', css: `.wrap > p { background: #f0c04a; } /* direct children only */` },
      { label: 'h4 + p', css: `h4 + p { background: #f0c04a; } /* the very next sibling */` },
      { label: 'h4 ~ p', css: `h4 ~ p { background: #f0c04a; } /* every later sibling p */` },
    ],
  },
  'nth-child-vs-of-type': {
    hint: 'Same "2", different counting.',
    html: `<article class="frame"><h4>h4 (child 1)</h4><p>p A (child 2)</p><p>p B (child 3)</p><p>p C (child 4)</p></article>`,
    base: `h4,p{margin:4px 0;padding:4px 8px;border-radius:4px;border:1px solid #dde1d5}`,
    height: 170,
    variants: [
      { label: 'p:nth-child(2)', css: `p:nth-child(2) { background: #f0c04a; } /* 2nd child overall, if it's a p → A */` },
      { label: 'p:nth-of-type(2)', css: `p:nth-of-type(2) { background: #f0c04a; } /* 2nd p → B */` },
    ],
  },
  'is-where-has': {
    hint: ':has() styles a parent by what is inside it. Try typing a valid email in the last tab.',
    html: `<div class="card frame">Plain card</div><div class="card frame">Card with <span class="badge">NEW</span></div>`,
    base: `.card{margin:6px 0}.badge{background:#e2685f;color:#fff;border-radius:4px;padding:1px 6px;font-size:11px}`,
    height: 130,
    variants: [
      { label: ':has(.badge)', css: `.card:has(.badge) { border: 2px solid #e2685f; background: #fdecea; }` },
      { label: ':where = 0 weight', css: `:where(.card) { background: #fdecea; } /* specificity 0 */\ndiv { background: #e6f4f1; }           /* plain tag still wins */` },
      {
        label: 'form:has(:invalid)',
        html: `<form class="frame"><input type="email" required placeholder="type an email"> <button>Send</button></form>`,
        css: `form:has(input:invalid) button { opacity: .35; pointer-events: none; }\ninput { padding: 6px; }`,
      },
    ],
  },
  pseudo: {
    hint: 'Hover the button. The * and the bullet colour come from pseudo-elements.',
    html: `<button class="b">Hover me</button><p><label class="req">Email</label></p><ul><li>one</li><li>two</li><li>three</li></ul>`,
    base: `.b{border:1.5px solid #1c2a39;border-radius:6px;padding:6px 12px;background:#fff}ul{margin:0;padding-left:20px}`,
    height: 170,
    variants: [
      {
        label: 'state + part',
        css: `.b:hover { background: #0b7f73; color: #fff; }   /* :state */\nli:nth-child(odd) { background: #eef0ea; }       /* :state (position) */\n.req::after { content: ' *'; color: #e2685f; }    /* ::part */\nli::marker { color: #e2685f; }                    /* ::part */`,
      },
    ],
  },

  /* ── box model & positioning ── */
  'box-model': {
    hint: 'Both boxes say width: 200px. Compare them with the 200px ruler.',
    html: `<div class="ruler">← 200px ruler →</div><div class="b">width: 200px<br>padding 20 · border 8</div><div class="out" id="o"></div><script>const f=()=>{o.textContent='rendered width = '+document.querySelector('.b').offsetWidth+'px'};addEventListener('load',f);addEventListener('resize',f);requestAnimationFrame(()=>requestAnimationFrame(f))</script>`,
    base: `.ruler{width:200px;background:repeating-linear-gradient(90deg,#1c2a39 0 1px,transparent 1px 20px);border-bottom:2px solid #1c2a39;font:11px monospace;text-align:center;margin-bottom:8px}.b{width:200px;padding:20px;border:8px solid #0b7f73;background:#f0c04a;margin-top:4px}`,
    height: 170,
    variants: [
      { label: 'content-box (default)', css: `.b { box-sizing: content-box; } /* 200 + 2×20 + 2×8 = 256px */` },
      { label: 'border-box', css: `.b { box-sizing: border-box; } /* padding + border fit inside 200px */` },
    ],
  },
  units: {
    hint: 'Three nested boxes, each set to 1.2 of something.',
    html: `<div class="u">1.2<div class="u">1.2 inside<div class="u">1.2 inside again</div></div></div>`,
    base: `body{font-size:14px}.u{border-left:3px solid #0b7f73;padding:4px 0 4px 8px;margin-top:4px}`,
    height: 150,
    variants: [
      { label: 'em (compounds)', css: `.u { font-size: 1.2em; } /* 1.2 × parent → 16.8 → 20.2 → 24.2px */` },
      { label: 'rem (stable)', css: `.u { font-size: 1.2rem; } /* 1.2 × root (16px) = 19.2px every time */` },
    ],
  },
  'hide-element': {
    hint: 'Watch C move (or not), then try clicking where B was.',
    html: `<div class="row"><div class="box t">A</div><button class="box y x" onclick="this.style.cssText+=';outline:3px solid #e2685f';document.getElementById('o').textContent='B was clicked!'">B (click)</button><div class="box t">C</div></div><div class="out" id="o">…</div>`,
    base: `.row{display:flex;gap:8px}.row>*{width:90px;border:0}`,
    height: 100,
    variants: [
      { label: 'display: none', css: `.x { display: none; }      /* gone: C slides left, nothing to click */` },
      { label: 'visibility: hidden', css: `.x { visibility: hidden; } /* seat kept, not clickable */` },
      { label: 'opacity: 0', css: `.x { opacity: 0; }         /* seat kept, STILL clickable */` },
    ],
  },
  position: {
    hint: 'The red box changes position; the dashed area is its relative parent.',
    html: `<div class="parent frame">parent (position: relative)<div class="box r child">child</div><p>Some text in normal flow after the child. Some text in normal flow after the child.</p></div>`,
    base: `.parent{position:relative;height:150px}.child{width:80px}p{margin:6px 0 0;color:#5b6876}`,
    height: 180,
    variants: [
      { label: 'static', css: `.child { position: static; } /* normal flow, top/left ignored */` },
      { label: 'relative', css: `.child { position: relative; top: 10px; left: 40px; } /* nudged, space kept */` },
      { label: 'absolute', css: `.child { position: absolute; top: 0; right: 0; } /* out of flow, pinned to parent */` },
      { label: 'fixed', css: `.child { position: fixed; bottom: 0; right: 0; } /* pinned to the viewport (this frame) */` },
    ],
  },
  'sticky-not-working': {
    hint: 'Scroll inside the frame. Each broken tab removes one thing sticky needs.',
    html: `<div class="wrap"><div class="side box t">I am sticky</div><div class="long">Scroll me ↓<br><br>…<br><br>…<br><br>…<br><br>…<br><br>…<br><br>…<br><br>…<br><br>end</div></div>`,
    base: `.wrap{display:flex;gap:10px;align-items:flex-start}.side{width:120px}.long{flex:1;height:520px;background:repeating-linear-gradient(#fcfcf9 0 22px,#eef0ea 22px 44px);padding:8px}`,
    height: 190,
    variants: [
      { label: 'works', css: `.side { position: sticky; top: 0; }` },
      { label: 'no top', css: `.side { position: sticky; } /* no threshold → never sticks */` },
      { label: 'overflow ancestor', css: `.side { position: sticky; top: 0; }\n.wrap { overflow: hidden; } /* .wrap becomes the scroller → nothing to stick to */` },
      { label: 'flex stretch', css: `.side { position: sticky; top: 0; }\n.wrap { align-items: stretch; } /* side is as tall as .wrap → no room to move */` },
    ],
  },
  'stacking-context': {
    hint: 'The child has z-index 9999. Does it get above the yellow sibling?',
    html: `<div class="p1">parent<div class="child box r">child z: 9999</div></div><div class="p2 box y">sibling z: 2</div>`,
    base: `.p1,.p2{position:absolute;width:170px;height:90px;border-radius:8px}.p1{left:12px;top:12px;background:#e6f4f1;border:2px dashed #0b7f73;padding:6px}.p2{left:120px;top:56px;z-index:2}.child{position:relative;z-index:9999;margin:22px 0 0 60px;width:150px}`,
    height: 170,
    variants: [
      { label: 'parent: no context', css: `.p1 { position: absolute; }  /* no z-index → no stacking context\n   child 9999 competes globally → on top */` },
      { label: 'parent z-index: 1', css: `.p1 { position: absolute; z-index: 1; } /* new context: the whole parent is "1"\n   child is trapped under the z-index 2 sibling */` },
      { label: 'parent opacity: .99', css: `.p1 { opacity: .99; } /* opacity < 1 ALSO creates a context → trapped (z auto = 0) */` },
    ],
  },
  'margin-collapse': {
    hint: 'The live gap between the two boxes is measured below.',
    html: `<div class="c"><div class="box t a">margin-bottom: 20px</div><div class="box y b">margin-top: 30px</div></div><div class="out" id="o"></div><script>const f=()=>{const a=document.querySelector('.a').getBoundingClientRect(),b=document.querySelector('.b').getBoundingClientRect();o.textContent='measured gap = '+Math.round(b.top-a.bottom)+'px'};addEventListener('load',f);addEventListener('resize',f);requestAnimationFrame(()=>requestAnimationFrame(f))</script>`,
    base: `.a{margin-bottom:20px}.b{margin-top:30px}`,
    height: 140,
    variants: [
      { label: 'block flow', css: `/* vertical margins collapse: max(20, 30) = 30px */` },
      { label: 'flex column', css: `.c { display: flex; flex-direction: column; } /* flex items never collapse: 50px */` },
    ],
  },
  bfc: {
    hint: 'The parent has a red border. Does it wrap around its floated child?',
    html: `<div class="parent"><div class="fl box y">float: left</div>text beside the float</div><p>Next paragraph</p>`,
    base: `.parent{border:2px solid #e2685f;padding:4px}.fl{float:left;height:70px;margin-right:8px}p{margin:6px 0}`,
    height: 140,
    variants: [
      { label: 'normal', css: `/* the float sticks out; the parent only wraps its text */` },
      { label: 'display: flow-root', css: `.parent { display: flow-root; } /* new BFC → contains the float */` },
    ],
  },
  'text-ellipsis': {
    hint: 'Same long title in a 240px box.',
    html: `<div class="w">A very long product name that keeps going and going far past the edge of its box</div>`,
    base: `.w{width:240px;border:1.5px solid #1c2a39;border-radius:6px;padding:6px 8px;font-size:14px}`,
    height: 110,
    variants: [
      { label: 'nothing', css: `/* wraps onto many lines */` },
      { label: 'one line', css: `.w {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}` },
      { label: '2 lines (line-clamp)', css: `.w {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}` },
    ],
  },
  'object-fit-aspect': {
    hint: 'A wide 300×150 image squeezed into a 150×150 square.',
    html: `<div class="row"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%2346c2b2'/%3E%3Ccircle cx='150' cy='75' r='55' fill='%23f0c04a'/%3E%3Ctext x='150' y='82' font-family='sans-serif' font-size='20' text-anchor='middle'%3E300×150%3C/text%3E%3C/svg%3E" alt="demo"><span class="lab">150 × 150 box</span></div>`,
    base: `.row{display:flex;align-items:center;gap:12px}img{width:150px;height:150px;border:2px solid #1c2a39;border-radius:6px;background:#eef0ea}`,
    height: 180,
    variants: [
      { label: 'fill', css: `img { object-fit: fill; }    /* stretched: circle becomes an oval */` },
      { label: 'contain', css: `img { object-fit: contain; } /* whole image, empty bars */` },
      { label: 'cover', css: `img { object-fit: cover; }   /* fills the box, edges cropped */` },
    ],
  },

  /* ── flexbox & grid ── */
  'flexbox-axes': {
    hint: 'justify-content follows the main axis; align-items the other one.',
    html: `<div class="row frame"><div class="box t">1</div><div class="box y">2</div><div class="box r">3</div></div>`,
    base: `.row{display:flex;height:130px;gap:6px}`,
    height: 160,
    variants: [
      { label: 'row', css: `.row {\n  flex-direction: row;\n  justify-content: space-between; /* ↔ */\n  align-items: center;            /* ↕ */\n}` },
      { label: 'column', css: `.row {\n  flex-direction: column;\n  justify-content: space-between; /* now ↕ */\n  align-items: center;            /* now ↔ */\n}` },
      { label: 'align: stretch', css: `.row { flex-direction: row; align-items: stretch; } /* items fill the cross axis */` },
    ],
  },
  'flex-shorthand': {
    hint: 'Three items with different text lengths.',
    html: `<div class="row frame"><div class="box t i">A</div><div class="box y i">Longer text B</div><div class="box r i">C</div></div>`,
    base: `.row{display:flex;gap:6px}`,
    height: 90,
    variants: [
      { label: 'flex: none', css: `.i { flex: none; }  /* 0 0 auto: content size, never grow */` },
      { label: 'flex: auto', css: `.i { flex: auto; }  /* 1 1 auto: content size + share the rest */` },
      { label: 'flex: 1', css: `.i { flex: 1; }     /* 1 1 0%: equal slices, ignore content */` },
    ],
  },
  'grid-vs-flex': {
    hint: 'Same five items. Look at how the second row lines up.',
    html: `<div class="c frame"><div class="box t">one</div><div class="box y">two two two</div><div class="box r">three</div><div class="box bl">four four</div><div class="box g">five</div></div>`,
    base: `.c{gap:6px}`,
    height: 120,
    variants: [
      { label: 'flex-wrap (1D)', css: `.c { display: flex; flex-wrap: wrap; }\n.c > * { flex: 1 1 120px; } /* each row sizes itself */` },
      { label: 'grid (2D)', css: `.c { display: grid; grid-template-columns: repeat(3, 1fr); } /* columns line up */` },
    ],
  },
  'grid-fr-areas': {
    hint: 'Named areas draw the layout; auto-fit vs auto-fill decide what happens to spare room.',
    html: `<div class="page"><header class="box t">header</header><aside class="box y">side</aside><main class="box bl">main</main><footer class="box r">footer</footer></div>`,
    height: 170,
    variants: [
      {
        label: 'template areas',
        css: `.page {\n  display: grid; gap: 6px; height: 140px;\n  grid-template-columns: 100px 1fr;\n  grid-template-areas: "head head" "side main" "foot foot";\n}\nheader { grid-area: head } aside { grid-area: side }\nmain { grid-area: main } footer { grid-area: foot }`,
      },
      {
        label: 'auto-fill',
        html: `<div class="g frame"><div class="box t">1</div><div class="box y">2</div></div>`,
        css: `.g { display: grid; gap: 6px; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }\n/* empty tracks are kept → items stay small */`,
      },
      {
        label: 'auto-fit',
        html: `<div class="g frame"><div class="box t">1</div><div class="box y">2</div></div>`,
        css: `.g { display: grid; gap: 6px; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); }\n/* empty tracks collapse → items stretch */`,
      },
    ],
  },
  centering: {
    hint: 'Four ways to put the box in the middle of the dashed area.',
    html: `<div class="p frame"><div class="box t c">centered?</div></div>`,
    base: `.p{height:130px;position:relative}.c{width:110px;text-align:center}`,
    height: 160,
    variants: [
      { label: 'grid', css: `.p { display: grid; place-items: center; }` },
      { label: 'flex', css: `.p { display: flex; justify-content: center; align-items: center; }` },
      { label: 'margin: auto', css: `.c { margin: 0 auto; } /* horizontal only */` },
      { label: 'absolute + translate', css: `.c { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }` },
    ],
  },

  /* ── responsive ── */
  'media-queries': {
    hint: 'The frame is resized per tab; the media queries inside react to it.',
    html: `<div class="grid"><div class="box t">1</div><div class="box y">2</div><div class="box r">3</div><div class="box bl">4</div></div>`,
    base: `.grid{display:grid;gap:6px}@media (min-width:420px){.grid{grid-template-columns:1fr 1fr}}@media (min-width:620px){.grid{grid-template-columns:repeat(4,1fr)}}`,
    height: 170,
    variants: [
      { label: 'phone 320', width: 320, css: `.grid { display: grid; }                     /* base: 1 column */\n@media (min-width: 420px) { .grid { grid-template-columns: 1fr 1fr; } }\n@media (min-width: 620px) { .grid { grid-template-columns: repeat(4, 1fr); } }` },
      { label: 'tablet 480', width: 480, css: `/* ≥ 420px → 2 columns */\n@media (min-width: 420px) { .grid { grid-template-columns: 1fr 1fr; } }` },
      { label: 'desktop 680', width: 680, css: `/* ≥ 620px → 4 columns */\n@media (min-width: 620px) { .grid { grid-template-columns: repeat(4, 1fr); } }` },
    ],
  },
  'container-queries': {
    hint: 'The SAME card in a narrow slot and a wide slot — it adapts to its box, not the screen.',
    html: `<div class="slot narrow"><div class="card"><div class="pic"></div><div><b>Card</b><br>I adapt to my container.</div></div></div><div class="slot"><div class="card"><div class="pic"></div><div><b>Card</b><br>I adapt to my container.</div></div></div>`,
    base: `.slot{border:1.5px dashed #9aa8b6;border-radius:8px;padding:6px;margin-bottom:8px}.narrow{width:200px}.card{display:grid;gap:8px;background:#eef0ea;border-radius:6px;padding:8px}.pic{height:46px;border-radius:6px;background:#46c2b2}`,
    height: 230,
    variants: [
      { label: '@container', css: `.slot { container-type: inline-size; }\n@container (min-width: 320px) {\n  .card { grid-template-columns: 80px 1fr; } /* wide slot → side by side */\n}` },
    ],
  },
  clamp: {
    hint: 'font-size: clamp(16px, 6vw, 34px) — the live size is printed under the heading.',
    html: `<h2 id="h">Fluid heading</h2><div class="out" id="o"></div><script>const f=()=>{o.textContent='font-size = '+getComputedStyle(h).fontSize+'  (6vw = '+(innerWidth*.06).toFixed(1)+'px)'};addEventListener('load',f);addEventListener('resize',f);requestAnimationFrame(()=>requestAnimationFrame(f))</script>`,
    base: `h2{margin:8px 0}`,
    height: 110,
    variants: [
      { label: 'narrow 240', width: 240, css: `h2 { font-size: clamp(16px, 6vw, 34px); } /* 6vw < 16 → floor 16px */` },
      { label: 'medium 420', width: 420, css: `h2 { font-size: clamp(16px, 6vw, 34px); } /* in between → 6vw */` },
      { label: 'wide 700', width: 700, css: `h2 { font-size: clamp(16px, 6vw, 34px); } /* 6vw > 34 → ceiling 34px */` },
    ],
  },
  'reduced-motion': {
    hint: 'The real switch is the OS "reduce motion" setting; the second tab shows what those users get.',
    html: `<div class="box t m">sliding panel</div>`,
    base: `@keyframes slide{from{transform:translateX(0)}to{transform:translateX(220px)}}.m{width:140px}`,
    height: 80,
    variants: [
      { label: 'default', css: `.m { animation: slide 1.2s ease-in-out infinite alternate; }` },
      { label: 'prefers-reduced-motion', css: `/* inside @media (prefers-reduced-motion: reduce) */\n.m { animation: none; } /* or a gentle fade */` },
    ],
  },

  /* ── theming ── */
  'css-variables': {
    hint: 'One --brand variable drives every button. The last tab changes it from JS.',
    html: `<div class="row"><button class="btn">Save</button><div class="danger"><button class="btn">Delete</button></div></div>`,
    base: `.row{display:flex;gap:8px}.btn{background:var(--brand);color:#fff;border:0;border-radius:6px;padding:8px 14px;font-weight:600}`,
    height: 110,
    variants: [
      { label: ':root', css: `:root { --brand: #0b7f73; }\n.btn { background: var(--brand); }` },
      { label: 'scoped override', css: `:root   { --brand: #0b7f73; }\n.danger { --brand: #e2685f; } /* cascades into its children */` },
      {
        label: 'change from JS',
        html: `<div class="row"><button class="btn">Save</button><button onclick="document.documentElement.style.setProperty('--brand','#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'))">Random brand colour</button></div>`,
        css: `:root { --brand: #0b7f73; }\n/* JS: document.documentElement.style.setProperty('--brand', '#…') */`,
      },
    ],
  },
  'dark-mode': {
    hint: 'Same markup; only the variable set on <html> changes.',
    html: `<div class="card"><b>Settings</b><p>Theme comes from variables.</p><button>Save</button></div>`,
    base: `:root{--bg:#ffffff;--text:#1c2a39;--muted:#5b6876;--brand:#0b7f73}.dark{--bg:#161f29;--text:#e6ecf2;--muted:#9aa8b6;--brand:#46c2b2}body{background:var(--bg)}.card{color:var(--text);border:1px solid var(--muted);border-radius:8px;padding:10px}p{color:var(--muted);margin:4px 0 8px}button{background:var(--brand);border:0;border-radius:6px;padding:6px 12px;color:var(--bg);font-weight:600}`,
    height: 130,
    variants: [
      { label: 'light', css: `:root { --bg: #fff; --text: #1c2a39; --brand: #0b7f73; }` },
      { label: 'dark (.dark on <html>)', htmlClass: 'dark', css: `.dark { --bg: #161f29; --text: #e6ecf2; --brand: #46c2b2; }\n/* add color-scheme: dark so inputs & scrollbars match */` },
    ],
  },

  /* ── animation & performance ── */
  'transition-vs-animation': {
    hint: 'Hover the first box; the second runs on its own.',
    html: `<div class="box t tr">transition: hover me</div><div class="box y an">animation: runs by itself</div>`,
    base: `.tr,.an{width:200px;margin-bottom:10px}@keyframes slide{to{transform:translateX(140px)}}`,
    height: 110,
    variants: [
      { label: 'both', css: `.tr { transition: transform .4s ease; }\n.tr:hover { transform: translateX(140px); } /* needs a trigger, A → B */\n\n.an { animation: slide 1.4s ease-in-out infinite alternate; } /* keyframes, loops */` },
    ],
  },
  'transform-vs-position': {
    hint: 'Watch the yellow neighbour: does it get pushed every frame?',
    html: `<div class="row"><div class="box t mover">moving</div><div class="box y">neighbour</div></div>`,
    base: `.row{display:flex;gap:6px}@keyframes m{to{margin-left:120px}}@keyframes t{to{transform:translateX(120px)}}`,
    height: 70,
    variants: [
      { label: 'animate margin-left', css: `.mover { animation: m 1.2s ease-in-out infinite alternate; }\n/* layout changes → neighbour reflows every frame */` },
      { label: 'animate transform', css: `.mover { animation: t 1.2s ease-in-out infinite alternate; }\n/* layout untouched → neighbour stays, GPU moves the layer */` },
    ],
  },
  'cls-prevention': {
    hint: 'An image "loads" after 1 second. Watch the text below it.',
    html: `<p>Headline text</p><div class="img" id="i"></div><p class="read">Paragraph you were reading…</p><button onclick="location.reload()">Replay</button><script>setTimeout(()=>{i.classList.add('loaded')},1000)</script>`,
    base: `p{margin:4px 0}.img{width:200px;border-radius:6px}.img.loaded{background:#46c2b2}.read{background:#fff7d6}`,
    height: 220,
    variants: [
      { label: 'no space reserved', css: `.img { height: 0; }\n.img.loaded { height: 110px; } /* content jumps down = layout shift */` },
      { label: 'aspect-ratio reserved', css: `.img { aspect-ratio: 16 / 9; background: #eef0ea; } /* space held before it loads */` },
    ],
  },
  'reflow-repaint': {
    hint: 'Both move the same distance; only one makes the page re-layout every frame.',
    html: `<div class="row"><div class="box t mover">box</div><div class="box y">neighbour</div></div>`,
    base: `.row{display:flex;gap:6px}@keyframes w{to{width:220px}}@keyframes s{to{transform:scaleX(2.2)}}.mover{width:100px;transform-origin:left}`,
    height: 70,
    variants: [
      { label: 'animate width', css: `.mover { animation: w 1.2s ease-in-out infinite alternate; }\n/* layout → paint → composite, neighbour reflows */` },
      { label: 'animate transform', css: `.mover { animation: s 1.2s ease-in-out infinite alternate; }\n/* composite only, neighbour untouched (text scales too) */` },
    ],
  },
}
