import { lazy, Suspense, useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Headphones, Volume2, VolumeX } from 'lucide-react'
import { useInterviewStore } from '../store/interviewStore'
import { ChatPanel } from '../components/interview/ChatPanel'
import { InterviewControls } from '../components/interview/InterviewControls'
import { InterviewTimer } from '../components/interview/InterviewTimer'
import { ProblemStatement } from '../components/interview/ProblemStatement'
import { VoiceInterviewBar } from '../components/interview/VoiceInterviewBar'
import { useVoiceInterview } from '../hooks/useVoiceInterview'
import { starterCode } from '../utils/starterCode'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { saveQuitSummary as saveQuitSummaryApi } from '../services/interviewApi'

// The editor pulls in the Sandpack bundler, so it only loads when the interview actually uses it.
const CodeEditorPanel = lazy(() => import('../components/interview/CodeEditorPanel'))
const maxMessageLength = 12_000

export default function InterviewRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentSession, loadingSession, sending, completing, error, loadSession, sendAnswer, completeInterview, resetInterview } = useInterviewStore()
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState<string | null>(null)
  const [voiceReplies, setVoiceReplies] = useState(true)
  const [voiceInterview, setVoiceInterview] = useState(false)
  const [showEditor, setShowEditor] = useState<boolean | null>(null)
  const [attachCode, setAttachCode] = useState(true)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [codeEdited, setCodeEdited] = useState(false)
  const editorCodeRef = useRef('')
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const lastAutoScrolledMessageIdRef = useRef<string | null>(null)
  const lastSpokenMessageIdRef = useRef<string | null>(null)
  const allowBrowserBackRef = useRef(false)
  const exitInProgressRef = useRef(false)
  const historyGuardArmedRef = useRef(false)
  const quitSummarySavedForRef = useRef<string | null>(null)
  const hasActiveInterview = currentSession?.status === 'ACTIVE'
  const latestMessage = currentSession?.messages.at(-1)
  const pendingQuestion = hasActiveInterview && latestMessage?.role === 'AI' ? { id: latestMessage.id, content: latestMessage.content } : null

  // Machine-coding rounds open the editor by default; other rounds can still turn it on.
  const editorOpen = showEditor ?? currentSession?.interviewType === 'ROUND_2'

  const handleCodeChange = useCallback((code: string) => {
    editorCodeRef.current = code
    const edited = code.trim().length > 0 && code.trim() !== starterCode.trim()
    setCodeEdited((current) => (current === edited ? current : edited))
  }, [])

  // Typed and spoken answers both carry the editor code once the candidate has edited it.
  const handleSend = useCallback(
    async (message: string) => {
      const shouldAttach = editorOpen && attachCode && codeEdited
      const fullMessage = shouldAttach ? `${message}\n\n\`\`\`tsx\n${editorCodeRef.current.trim()}\n\`\`\`` : message

      if (fullMessage.length > maxMessageLength) {
        setAttachError(`Your answer plus code is ${fullMessage.length - maxMessageLength} characters over the ${maxMessageLength} limit. Shorten the code or untick "Attach my code".`)
        return false
      }

      setAttachError(null)
      return sendAnswer(fullMessage)
    },
    [attachCode, codeEdited, editorOpen, sendAnswer],
  )

  const voice = useVoiceInterview({
    enabled: voiceInterview && hasActiveInterview,
    sessionId: sessionId ?? '',
    pendingQuestion,
    onSubmit: handleSend,
    onTranscript: setPendingVoiceTranscript,
  })

  const saveQuitSummary = async () => {
    if (!currentSession || currentSession.status !== 'ACTIVE') return
    if (quitSummarySavedForRef.current === currentSession.id) return
    quitSummarySavedForRef.current = currentSession.id
    await saveQuitSummaryApi(currentSession.id, { keepalive: true })
  }

  const stopSpeech = () => {
    window.speechSynthesis?.cancel()
  }

  const confirmExitInterview = async () => {
    if (!hasActiveInterview) return true

    const shouldLeave = window.confirm('If you leave this screen, you will lose your interview progress.')
    if (!shouldLeave) return false

    exitInProgressRef.current = true
    stopSpeech()
    await saveQuitSummary()
    resetInterview()
    return true
  }

  // Effect events always see the latest session without re-subscribing the listeners below.
  const onPageHide = useEffectEvent(() => {
    void saveQuitSummary()
  })
  const onConfirmExit = useEffectEvent(() => confirmExitInterview())

  useEffect(() => {
    if (!sessionId) return
    if (exitInProgressRef.current) return
    if (!currentSession || currentSession.id !== sessionId) {
      loadSession(sessionId)
    }
  }, [currentSession, loadSession, sessionId])

  useEffect(() => {
    if (currentSession?.status === 'COMPLETED') {
      navigate(`/results/${currentSession.id}`)
    }
  }, [currentSession?.id, currentSession?.status, navigate])

  useEffect(() => {
    // Voice interview mode reads the questions itself, so this effect only serves the plain "Voice replies" toggle.
    if (!voiceReplies || voiceInterview || typeof window === 'undefined' || !window.speechSynthesis) return

    const newest = currentSession?.messages.at(-1)
    if (!newest || newest.role !== 'AI' || newest.id === lastSpokenMessageIdRef.current) return

    lastSpokenMessageIdRef.current = newest.id
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(newest.content)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [currentSession?.messages, voiceReplies, voiceInterview])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const newest = currentSession?.messages.at(-1)
    if (!newest || newest.role !== 'AI' || newest.id === lastAutoScrolledMessageIdRef.current) return

    lastAutoScrolledMessageIdRef.current = newest.id
    const frameId = window.requestAnimationFrame(() => {
      controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentSession?.messages])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (!hasActiveInterview) return undefined

    // Only prompt here; the user may still cancel. The summary is saved on pagehide, once the page is really leaving.
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const handlePageHide = () => {
      onPageHide()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [hasActiveInterview])

  useEffect(() => {
    if (!hasActiveInterview || typeof window === 'undefined') return undefined

    if (!historyGuardArmedRef.current) {
      window.history.pushState({ interviewGuard: true }, '', window.location.href)
      historyGuardArmedRef.current = true
    }

    const handlePopState = async () => {
      if (allowBrowserBackRef.current) {
        allowBrowserBackRef.current = false
        return
      }

      if (!(await onConfirmExit())) {
        window.history.pushState({ interviewGuard: true }, '', window.location.href)
        return
      }

      allowBrowserBackRef.current = true
      window.history.back()
    }

    const handleDocumentClick = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return

      const nextUrl = new URL(link.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (nextUrl.origin !== currentUrl.origin) return

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      if (nextPath === currentPath) return

      event.preventDefault()

      if (await onConfirmExit()) {
        navigate(nextPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleDocumentClick, true)
      historyGuardArmedRef.current = false
      allowBrowserBackRef.current = false
    }
  }, [hasActiveInterview, navigate])

  if (!sessionId) {
    return <p className="text-slate-300">Invalid interview session.</p>
  }

  if (loadingSession && !currentSession) {
    return <Loader />
  }

  if (error && !currentSession) {
    return (
      <Card className="rounded-[2rem] border-rose-700/40 bg-rose-950/70 p-6 text-rose-100 shadow-soft">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-rose-300/80">Interview unavailable</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">We couldn&apos;t load this interview session.</h1>
          </div>
          <p className="text-sm text-rose-100/90">{error}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                navigate('/dashboard')
              }}
            >
              Go to dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (sessionId) {
                  void loadSession(sessionId)
                }
              }}
            >
              Retry loading
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!currentSession) {
    return <p className="text-slate-300">Preparing interview session...</p>
  }

  const handleComplete = async () => {
    await completeInterview()
  }

  // The time limit ends the interview like a real round: whatever was answered so far gets scored.
  const handleTimeUp = () => {
    if (currentSession.status === 'ACTIVE' && !completing) {
      void completeInterview()
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <ProblemStatement session={currentSession} />
        <Card className="rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
          <InterviewTimer
            startedAt={currentSession.startedAt}
            completedAt={currentSession.completedAt}
            messages={currentSession.messages}
            onTimeUp={handleTimeUp}
          />
          <div className="mt-6 space-y-3 text-slate-400">
            <p className="text-sm font-medium text-white">Interview flow</p>
            <p>Answer each prompt clearly. The interviewer will follow up based on your response.</p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {error ? <div className="rounded-3xl border border-rose-700/40 bg-rose-950/80 p-4 text-sm text-rose-200">{error}</div> : null}
        <Card className="rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live interviewer</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">AI Interview Chat</h2>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant={editorOpen ? 'primary' : 'secondary'} className="gap-2" onClick={() => setShowEditor(!editorOpen)}>
                <Code2 className="h-4 w-4" />
                Code editor
              </Button>
              <Button
                variant={voiceInterview ? 'primary' : 'secondary'}
                className="gap-2"
                disabled={!voice.supported || !hasActiveInterview}
                title={voice.supported ? 'The interviewer speaks and listens hands-free' : 'Voice recording is not supported in this browser'}
                onClick={() => {
                  stopSpeech()
                  setVoiceInterview((current) => !current)
                }}
              >
                <Headphones className="h-4 w-4" />
                {voiceInterview ? 'Voice interview on' : 'Voice interview'}
              </Button>
              {voiceInterview ? null : (
                <>
                  <Button
                    variant={voiceReplies ? 'primary' : 'secondary'}
                    className="gap-2"
                    onClick={() => {
                      if (voiceReplies) {
                        stopSpeech()
                      }
                      setVoiceReplies((current) => !current)
                    }}
                  >
                    {voiceReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Voice replies
                  </Button>
                  <Button variant="secondary" className="gap-2" onClick={stopSpeech}>
                    <VolumeX className="h-4 w-4" />
                    Stop speech
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  if (await confirmExitInterview()) {
                    navigate('/dashboard')
                  }
                }}
              >
                Back to dashboard
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <ChatPanel messages={currentSession.messages} pendingVoiceTranscript={pendingVoiceTranscript} />
          </div>
        </Card>

        {editorOpen ? (
          <Card className="space-y-4 rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Machine coding</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Code editor with live preview</h2>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={attachCode}
                  onChange={(event) => setAttachCode(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                Attach my code to my answer{attachCode && !codeEdited ? ' (once you edit it)' : ''}
              </label>
            </div>
            <Suspense fallback={<Loader />}>
              <CodeEditorPanel sessionId={currentSession.id} onCodeChange={handleCodeChange} />
            </Suspense>
            {attachError ? <p className="text-sm text-rose-300">{attachError}</p> : null}
          </Card>
        ) : null}

        {voiceInterview && hasActiveInterview ? (
          <VoiceInterviewBar
            phase={voice.phase}
            level={voice.level}
            error={voice.error}
            voices={voice.voices}
            voiceName={voice.voiceName}
            canRetrySend={voice.canRetrySend}
            onVoiceChange={voice.setVoiceName}
            onSkipSpeaking={voice.skipSpeaking}
            onFinishAnswer={voice.finishAnswer}
            onAnswerNow={voice.answerNow}
            onRetrySend={voice.retrySend}
            onStop={() => setVoiceInterview(false)}
          />
        ) : null}

        <div ref={controlsRef}>
          <InterviewControls
            onSubmit={handleSend}
            onComplete={handleComplete}
            onVoiceStart={stopSpeech}
            onVoiceTranscript={setPendingVoiceTranscript}
            sessionId={currentSession.id}
            loading={sending || completing}
            disabled={currentSession.status === 'COMPLETED'}
            voiceLocked={voiceInterview}
          />
        </div>
      </div>
    </div>
  )
}
