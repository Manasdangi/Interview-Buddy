import { lazy, Suspense, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// The syntax highlighter is heavy, so it only loads once a message actually contains code.
const CodeBlock = lazy(() => import('./CodeBlock'))

function PlainCodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-2xl border border-slate-800 bg-[#282c34] p-4 font-mono text-[0.8125rem] text-slate-200 first:mt-0">
      {code}
    </pre>
  )
}

const components: Components = {
  // Block code renders its own container in `code`, so drop the default <pre> wrapper.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children ?? '')
    const language = /language-([\w+-]+)/.exec(className ?? '')?.[1] ?? ''
    if (language || text.includes('\n')) {
      const code = text.replace(/\n$/, '')
      return (
        <Suspense fallback={<PlainCodeBlock code={code} />}>
          <CodeBlock language={language.toLowerCase()} code={code} />
        </Suspense>
      )
    }
    return <code className="rounded-md bg-slate-800 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-200">{children}</code>
  },
  p: ({ children }) => <p className="mt-3 leading-7 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5 first:mt-0">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5 first:mt-0">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
      {children}
    </a>
  ),
  h1: ({ children }) => <h3 className="mt-4 text-base font-semibold text-white first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 text-base font-semibold text-white first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-4 font-semibold text-white first:mt-0">{children}</h4>,
  blockquote: ({ children }) => <blockquote className="mt-3 border-l-2 border-slate-700 pl-4 text-slate-400 first:mt-0">{children}</blockquote>,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto first:mt-0">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-slate-800 bg-slate-900 px-3 py-2 font-semibold text-slate-100">{children}</th>,
  td: ({ children }) => <td className="border border-slate-800 px-3 py-2">{children}</td>,
}

export function MarkdownContent({ children }: { children: string }): ReactNode {
  return (
    <div className="break-words">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </div>
  )
}
