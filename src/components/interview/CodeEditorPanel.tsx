import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react'
import { RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { starterCode } from '../../utils/starterCode'
import { Button } from '../ui/Button'
import { useTheme } from '../../hooks/useTheme'

const appPath = '/App.tsx'


const storageKey = (sessionId: string) => `interview-buddy:code:${sessionId}`

function loadSavedCode(sessionId: string) {
  try {
    return window.localStorage.getItem(storageKey(sessionId)) ?? starterCode
  } catch {
    return starterCode
  }
}

type CodeEditorPanelProps = {
  sessionId: string
  /** Receives the latest editor contents whenever they change. */
  onCodeChange: (code: string) => void
  /** Narrow column beside the chat. */
  side?: boolean
}

/** Lives inside the Sandpack provider: reports edits upward and keeps a per-session draft so a refresh does not lose work. */
function EditorBridge({ sessionId, onCodeChange }: CodeEditorPanelProps) {
  const { sandpack } = useSandpack()
  const code = sandpack.files[appPath]?.code ?? ''

  useEffect(() => {
    onCodeChange(code)
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey(sessionId), code)
      } catch {
        // The draft is a convenience; the editor still works without storage.
      }
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [code, onCodeChange, sessionId])

  return (
    <div className="flex justify-end">
      <Button type="button" variant="ghost" className="gap-2 px-3 py-1.5 text-xs" onClick={() => sandpack.resetAllFiles()}>
        <RotateCcw className="h-3.5 w-3.5" />
        Reset code
      </Button>
    </div>
  )
}

export default function CodeEditorPanel({ sessionId, onCodeChange, side = false }: CodeEditorPanelProps) {
  const { theme } = useTheme()
  return (
    <div className="space-y-2">
      <SandpackProvider
        template="react-ts"
        theme={theme}
        files={{ [appPath]: { code: loadSavedCode(sessionId), active: true } }}
        options={{ recompileMode: 'delayed', recompileDelay: 600 }}
      >
        <EditorBridge sessionId={sessionId} onCodeChange={onCodeChange} />
        <SandpackLayout style={{ borderRadius: 24, overflow: 'hidden' }}>
          {/* Beside the chat the panel is narrow, so code and preview stack. */}
          <SandpackCodeEditor
            showLineNumbers
            showTabs={false}
            style={side ? { height: 'calc(100vh - 470px)', minHeight: 320, flex: '1 1 100%' } : { height: 420, minWidth: 280, flex: '1 1 320px' }}
          />
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            style={side ? { height: 200, flex: '1 1 100%' } : { height: 420, minWidth: 280, flex: '1 1 320px' }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
