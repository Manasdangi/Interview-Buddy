import type { Demo } from '../components/web/WebDemo'

/** Live demos for the second batch of CSS questions, keyed by question id. */
export const cssDemosExtra: Record<string, Demo> = {
  'attribute-selectors': {
    hint: 'Each tab styles links by one attribute pattern. Watch which links light up.',
    html: `<p><a href="https://spinny.com">https://spinny.com</a></p><p><a href="/cars">/cars (internal)</a></p><p><a href="/brochure.pdf">/brochure.pdf</a></p><p><a href="/btn-guide" class="btn-link">class="btn-link"</a></p>`,
    base: `p{margin:6px 0}a{color:#1c2a39;padding:2px 6px;border-radius:4px;font-weight:600}`,
    height: 150,
    variants: [
      { label: '^= starts', css: `a[href^="https"] { background: #3b6fd8; color: #fff; }` },
      { label: '$= ends', css: `a[href$=".pdf"] { background: #e2685f; color: #fff; }\na[href$=".pdf"]::after { content: " ↓"; }` },
      { label: '*= contains', css: `[class*="btn"] { background: #0b7f73; color: #fff; }` },
    ],
  },
  'float-clearfix': {
    hint: 'The dashed parent should wrap the floated teal box. Compare the tabs.',
    html: `<div class="parent frame"><div class="fl box t">float</div>Short text next to a float.</div><div class="next box y">next section</div>`,
    base: `.fl{float:left;width:90px;height:90px;margin-right:8px}.next{margin-top:8px}`,
    height: 170,
    variants: [
      { label: 'no fix (collapses)', css: `.parent { }  /* parent height = only the text */` },
      { label: 'display: flow-root', css: `.parent { display: flow-root; } /* contains the float */` },
    ],
  },
  overflow: {
    hint: 'Same 80px-tall box with too much text inside.',
    html: `<div class="b frame">Line 1<br>Line 2<br>Line 3<br>Line 4<br>Line 5<br>Line 6</div>`,
    base: `.b{height:80px;width:220px;background:#fff}body{padding-bottom:60px}`,
    height: 170,
    variants: [
      { label: 'visible', css: `.b { overflow: visible; } /* spills out */` },
      { label: 'hidden', css: `.b { overflow: hidden; } /* cut off */` },
      { label: 'auto', css: `.b { overflow: auto; } /* scrollbar only when needed */` },
    ],
  },
  'inline-block-gap': {
    hint: 'No margin is set, yet inline-block items have a gap. The image also has a strip under it.',
    html: `<div class="row"><span class="box t">A</span>
  <span class="box y">B</span>
  <span class="box r">C</span></div>
<div class="pic"><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='50'%3E%3Crect width='120' height='50' fill='%233b6fd8'/%3E%3C/svg%3E"></div>`,
    base: `.box{display:inline-block}.pic{background:#e2685f;width:max-content;margin-top:12px}`,
    height: 140,
    variants: [
      { label: 'inline-block (gaps)', css: `.row .box { display: inline-block; }\nimg { /* inline: sits on the baseline → red strip */ }` },
      { label: 'flex + block img', css: `.row { display: flex; gap: 0; }\nimg { display: block; } /* no strip */` },
    ],
  },
  'vertical-align': {
    hint: 'An icon next to text: vertical-align moves it inside the line.',
    html: `<p class="line">Delivery <span class="ico"></span> in 2 days</p>`,
    base: `.line{font-size:22px;background:repeating-linear-gradient(#fff 0 26px,#eef1f4 26px 27px)}.ico{display:inline-block;width:18px;height:18px;border-radius:4px;background:#0b7f73}`,
    height: 90,
    variants: [
      { label: 'baseline', css: `.ico { vertical-align: baseline; }` },
      { label: 'middle', css: `.ico { vertical-align: middle; }` },
      { label: 'text-top', css: `.ico { vertical-align: text-top; }` },
    ],
  },
  'flex-wrap-align': {
    hint: 'Six wrapping items in a tall box. align-content moves the lines; align-items moves items inside a line.',
    html: `<div class="row frame"><div class="box t">1</div><div class="box y">2</div><div class="box r">3</div><div class="box bl">4</div><div class="box g">5</div><div class="box t">6</div></div>`,
    base: `.row{display:flex;flex-wrap:wrap;width:230px;height:180px;gap:6px}.box{width:60px}`,
    height: 210,
    variants: [
      { label: 'default (stretch)', css: `.row { align-content: normal; }` },
      { label: 'align-content: flex-start', css: `.row { align-content: flex-start; } /* lines packed at the top */` },
      { label: 'align-content: space-between', css: `.row { align-content: space-between; }` },
      { label: 'justify-content: center', css: `.row { align-content: flex-start; justify-content: center; }` },
    ],
  },
  'gap-vs-margin': {
    hint: 'The dashed frame is the container. Look at the right edge.',
    html: `<div class="row frame"><div class="box t">A</div><div class="box y">B</div><div class="box r">C</div></div>`,
    base: `.row{display:flex;width:max-content}`,
    height: 90,
    variants: [
      { label: 'margin-right', css: `.box { margin-right: 16px; } /* extra space after C */` },
      { label: 'gap', css: `.row { gap: 16px; } /* only between items */` },
    ],
  },
  subgrid: {
    hint: 'Card 2 has a long title. With subgrid every card shares the same rows, so buttons line up.',
    html: `<div class="cards"><div class="card"><h4>Basic</h4><p>Oil change</p><button>Book</button></div><div class="card"><h4>Premium service with a long name</h4><p>Full check</p><button>Book</button></div><div class="card"><h4>Pro</h4><p>All in</p><button>Book</button></div></div>`,
    base: `.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:420px}.card{border:1.5px solid #9aa8b6;border-radius:8px;padding:8px;background:#fff}h4{margin:0;font-size:14px}p{margin:0;color:#5b6876}button{background:#0b7f73;color:#fff;border:0;border-radius:6px;padding:4px}`,
    height: 170,
    variants: [
      { label: 'own grid', css: `.card { display: grid; gap: 6px; }` },
      { label: 'subgrid', css: `.cards { grid-template-rows: auto auto auto; }\n.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; gap: 6px; }` },
    ],
  },
  'logical-properties': {
    hint: 'Same CSS, two directions. The logical margin flips by itself.',
    html: `<div class="row"><span class="ico"></span><span class="box y">Logical margin</span></div>`,
    base: `.row{display:flex;align-items:center;border:1.5px dashed #9aa8b6;padding:8px;border-radius:8px}.ico{width:22px;height:22px;border-radius:50%;background:#0b7f73;margin-inline-end:24px}`,
    height: 80,
    variants: [
      { label: 'dir="ltr"', css: `/* .ico { margin-inline-end: 24px } → right side */`, html: `<div dir="ltr" class="row"><span class="ico"></span><span class="box y">Logical margin</span></div>` },
      { label: 'dir="rtl"', css: `/* same rule → now the left side */`, html: `<div dir="rtl" class="row"><span class="ico"></span><span class="box y">Logical margin</span></div>` },
    ],
  },
  currentcolor: {
    hint: 'Only color changes between tabs; the border and icon follow.',
    html: `<button class="btn"><svg width="14" height="14" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg> Book service</button>`,
    base: `.btn{display:inline-flex;gap:8px;align-items:center;background:#fff;border:2px solid currentColor;border-radius:8px;padding:8px 14px;font-weight:700;font-size:16px}svg{fill:currentColor}`,
    height: 80,
    variants: [
      { label: 'teal', css: `.btn { color: #0b7f73; }` },
      { label: 'red', css: `.btn { color: #e2685f; }` },
      { label: 'blue', css: `.btn { color: #3b6fd8; }` },
    ],
  },
  'transform-order': {
    hint: 'The faint box is where it started. Same two transforms, different order.',
    html: `<div class="stage"><div class="ghost"></div><div class="b box t">box</div></div>`,
    base: `.stage{position:relative;height:150px}.ghost,.b{position:absolute;left:20px;top:30px;width:60px;height:60px}.ghost{border:1.5px dashed #9aa8b6;border-radius:6px}.b{display:grid;place-items:center;opacity:.9}`,
    height: 170,
    variants: [
      { label: 'translate → rotate', css: `.b { transform: translateX(100px) rotate(45deg); } /* straight right */` },
      { label: 'rotate → translate', css: `.b { transform: rotate(45deg) translateX(100px); } /* diagonal */` },
    ],
  },
  'animate-height-auto': {
    hint: 'Click the header to open and close. Compare the grid trick with plain height.',
    html: `<div class="acc"><button onclick="this.parentNode.classList.toggle('open')">Toggle details ▾</button><div class="panel"><div class="inner">Free pick-up and drop.<br>60-point inspection.<br>Genuine parts with warranty.</div></div></div>`,
    base: `.acc{border:1.5px solid #9aa8b6;border-radius:8px;background:#fff;width:260px}button{width:100%;text-align:left;border:0;background:#0b7f73;color:#fff;padding:8px 10px;border-radius:6px 6px 0 0;font-weight:700;cursor:pointer}.inner{padding:0 10px}.open .inner{padding:8px 10px}`,
    height: 150,
    variants: [
      { label: 'height: auto (jumps)', css: `.panel { height: 0; overflow: hidden; transition: height .4s; }\n.open .panel { height: auto; } /* no animation */` },
      { label: 'grid 0fr → 1fr', css: `.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s; }\n.panel > .inner { overflow: hidden; }\n.open .panel { grid-template-rows: 1fr; }` },
    ],
  },
  'scroll-snap': {
    hint: 'Scroll the strip sideways with a trackpad or drag the scrollbar.',
    html: `<div class="car"><div class="s box t">Slide 1</div><div class="s box y">Slide 2</div><div class="s box r">Slide 3</div><div class="s box bl">Slide 4</div></div>`,
    base: `.car{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}.s{flex:0 0 75%;height:90px;display:grid;place-items:center;font-size:18px}`,
    height: 130,
    variants: [
      { label: 'no snap', css: `.car { }` },
      { label: 'snap center', css: `.car { scroll-snap-type: x mandatory; }\n.s { scroll-snap-align: center; }` },
    ],
  },
}
