// Tiny syntax highlighter for the C++ / JS / CSS / HTML snippets on the atlas pages (returns escaped HTML).
export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CPP_KW = new Set(
  'int long double float char bool void auto const return if else for while do break continue class struct public private true false nullptr new delete using namespace template typename unsigned static this operator'.split(' '),
)
const CPP_TY = new Set('vector string pair map unordered_map unordered_set set multiset queue deque stack priority_queue list array bitset function ListNode TreeNode Node DSU greater size_t'.split(' '))
const JS_KW = new Set(
  'const let var function return if else for while do break continue class extends super new this typeof instanceof in of async await yield try catch finally throw import export from default null undefined true false switch case static get set delete void'.split(' '),
)
const JS_TY = new Set('Promise Map Set WeakMap WeakSet Object Array JSON Math Number String Symbol Error Date Proxy Reflect window document console localStorage sessionStorage'.split(' '))

export function highlight(code: string, lang: 'cpp' | 'js' | 'plain' = 'cpp'): string {
  if (lang === 'plain') return escapeHtml(code)
  const kw = lang === 'cpp' ? CPP_KW : JS_KW
  const ty = lang === 'cpp' ? CPP_TY : JS_TY
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([\s\S])/g
  let out = ''
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    if (m[1]) out += `<span class="hl-c">${escapeHtml(m[1])}</span>`
    else if (m[2]) out += `<span class="hl-s">${escapeHtml(m[2])}</span>`
    else if (m[3]) out += `<span class="hl-n">${m[3]}</span>`
    else if (m[4]) {
      const word = m[4]
      const call = /^\s*\(/.test(code.slice(re.lastIndex))
      if (kw.has(word)) out += `<span class="hl-k">${word}</span>`
      else if (ty.has(word)) out += `<span class="hl-ty">${word}</span>`
      else if (call) out += `<span class="hl-fn">${word}</span>`
      else out += word
    } else out += escapeHtml(m[5])
  }
  return out
}
