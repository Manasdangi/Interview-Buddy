import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore'
import { ChatPanel } from '../components/interview/ChatPanel'
import { InterviewControls } from '../components/interview/InterviewControls'
import { InterviewTopBar } from '../components/interview/InterviewTopBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Loader } from '../components/ui/Loader'
import { saveQuitSummary as saveQuitSummaryApi } from '../services/interviewApi'
import { clearAnswerDraft } from '../services/browserSessionStorage'
import { speakText } from '../utils/speechText'

export default function InterviewRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentSession, loadingSession, sending, completing, error, loadSession, sendAnswer, completeInterview, resetInterview } = useInterviewStore()
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState<string | null>(null)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  const [confirmEndOpen, setConfirmEndOpen] = useState(false)
  const [voiceReplies, setVoiceReplies] = useState(true)
  const lastSpokenMessageIdRef = useRef<string | null>(null)
  const allowBrowserBackRef = useRef(false)
  const exitInProgressRef = useRef(false)
  const historyGuardArmedRef = useRef(false)
  const quitSummarySavedForRef = useRef<string | null>(null)
  const hasActiveInterview = currentSession?.status === 'ACTIVE'

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
      clearAnswerDraft(currentSession.id)
      navigate(`/results/${currentSession.id}`)
    }
  }, [currentSession?.id, currentSession?.status, navigate])

  useEffect(() => {
    if (!voiceReplies || typeof window === 'undefined' || !window.speechSynthesis) return

    const latestMessage = currentSession?.messages.at(-1)
    if (!latestMessage || latestMessage.role !== 'AI' || latestMessage.id === lastSpokenMessageIdRef.current) return

    lastSpokenMessageIdRef.current = latestMessage.id
    speakText(latestMessage.content)
  }, [currentSession?.messages, voiceReplies])

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

  const handleSend = async (message: string) => {
    setPendingAnswer(message)
    try {
      return await sendAnswer(message)
    } finally {
      setPendingAnswer(null)
    }
  }

  const handleConfirmEnd = () => {
    setConfirmEndOpen(false)
    stopSpeech()
    void completeInterview()
  }

  const answeredCount = currentSession.messages.filter((message) => message.role === 'USER').length
  const isFinalAnswer = currentSession.currentQuestionCount >= currentSession.maxQuestions
  const thinkingLabel = completing || (sending && isFinalAnswer) ? 'Scoring your interview' : sending ? 'Interviewer is thinking' : null

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <InterviewTopBar
        session={currentSession}
        voiceReplies={voiceReplies}
        endDisabled={currentSession.status === 'COMPLETED' || sending || completing}
        onToggleVoiceReplies={() => {
          if (voiceReplies) {
            stopSpeech()
          }
          setVoiceReplies((current) => !current)
        }}
        onStopSpeech={stopSpeech}
        onBack={async () => {
          if (await confirmExitInterview()) {
            navigate('/dashboard')
          }
        }}
        onEnd={() => setConfirmEndOpen(true)}
      />

      {error ? (
        <div role="alert" className="rounded-3xl border border-rose-700/40 bg-rose-950/80 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <Card className="rounded-[2rem] p-3 sm:p-4">
        <ChatPanel messages={currentSession.messages} pendingAnswer={pendingAnswer ?? pendingVoiceTranscript} thinkingLabel={thinkingLabel} />
      </Card>

      <InterviewControls
        key={currentSession.id}
        onSubmit={handleSend}
        onVoiceStart={stopSpeech}
        onVoiceTranscript={setPendingVoiceTranscript}
        sessionId={currentSession.id}
        loading={sending || completing}
        disabled={currentSession.status === 'COMPLETED'}
      />

      <ConfirmDialog
        open={confirmEndOpen}
        title="End the interview now?"
        description={
          <p>
            You've answered {answeredCount} of {currentSession.maxQuestions} questions. Your scorecard will be based only on these answers, and
            you can't continue this interview afterwards.
          </p>
        }
        cancelLabel="Keep going"
        confirmLabel="End and get scorecard"
        tone="danger"
        onCancel={() => setConfirmEndOpen(false)}
        onConfirm={handleConfirmEnd}
      />
    </div>
  )
}
