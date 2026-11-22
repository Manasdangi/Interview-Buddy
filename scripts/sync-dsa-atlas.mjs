// Pulls the latest DSA Memory Atlas into src/data/dsaAtlas.json.
// Usage: npm run sync:dsa   (optionally ATLAS_URL=http://localhost:8766)
import { writeFile } from 'node:fs/promises'
import vm from 'node:vm'

const ATLAS = (process.env.ATLAS_URL || 'https://dsa-memory-atlas.vercel.app').replace(/\/$/, '')
const OUT = new URL('../src/data/dsaAtlas.json', import.meta.url)

const get = async (path) => {
  const res = await fetch(`${ATLAS}/${path}`)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.text()
}

const [problemsText, vizX, intuition, html] = await Promise.all([get('problems.json'), get('viz-x.js'), get('intuition.js'), get('index.html')])

// viz-x.js and intuition.js attach data to window.VIZ; the drawing helpers are stubbed out.
const noop = () => null
const helpers = new Proxy({}, { get: () => noop })
const specs = new Proxy({}, { get: () => new Proxy({}, { get: () => null }) })
const VIZ = { h: helpers, specs }
const sandbox = { window: { VIZ }, VIZ }
vm.runInNewContext(vizX, sandbox)
vm.runInNewContext(intuition, sandbox)
const { DESC, INTU } = sandbox.window.VIZ
if (!DESC || !INTU) throw new Error('viz-x.js / intuition.js did not define DESC / INTU')

const patterns = [...html.matchAll(/\{ key: '(\w+)', name: '([^']+)', mantra: '((?:[^'\\]|\\.)*)'/g)].map(([, key, name, mantra]) => ({
  key,
  name,
  mantra: mantra.replace(/\\'/g, "'"),
}))
if (!patterns.length) throw new Error('could not read the pattern list from index.html')

const problems = JSON.parse(problemsText).map((p) => {
  const [statement, example] = DESC[p.id] || ['', '']
  const intu = INTU[p.id] || {}
  return {
    id: p.id,
    lc: p.lc,
    slug: p.slug,
    title: p.title,
    difficulty: p.diff,
    pattern: p.pattern,
    story: p.hook,
    statement,
    example,
    solutions: p.sols.map((s, i) => ({
      label: s.label,
      time: s.time,
      space: s.space,
      steps: s.steps,
      code: s.code,
      ...(intu[i] ? { intuition: intu[i][0], remember: intu[i][1] } : {}),
    })),
  }
})

await writeFile(OUT, JSON.stringify({ patterns, problems }))
console.log(`dsaAtlas.json: ${patterns.length} patterns, ${problems.length} problems, ${problems.reduce((n, p) => n + p.solutions.length, 0)} solutions`)
