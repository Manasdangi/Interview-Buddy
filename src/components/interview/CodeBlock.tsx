import { useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'
import { Check, Copy } from 'lucide-react'

// Registering only the languages an interview needs keeps the bundle small (PrismLight).
const languages = { bash, css, java, javascript, json, jsx, markup, python, sql, tsx, typescript }
for (const [name, grammar] of Object.entries(languages)) {
  SyntaxHighlighter.registerLanguage(name, grammar)
}

const languageAliases: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  html: 'markup',
  xml: 'markup',
  sh: 'bash',
  shell: 'bash',
  py: 'python',
}

export default function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const grammar = languageAliases[language] ?? language

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (insecure context or permissions); the code is still selectable.
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-[#282c34] first:mt-0">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs text-slate-400">
        <span className="font-mono">{language || 'code'}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={languages[grammar as keyof typeof languages] ? grammar : undefined}
        style={oneDark}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.8125rem' }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

