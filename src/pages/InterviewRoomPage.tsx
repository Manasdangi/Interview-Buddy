import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { useInterviewStore } from '../store/interviewStore'
import { ChatPanel } from '../components/interview/ChatPanel'
import { InterviewControls } from '../components/interview/InterviewControls'
import { InterviewTimer } from '../components/interview/InterviewTimer'
import { ProblemStatement } from '../components/interview/ProblemStatement'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { saveInterviewSummary } from '../services/interviewApi'

export default function InterviewRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentSession, loading, error, loadSession, sendAnswer, completeInterview } = useInterviewStore()
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState<string | null>(null)
  const [voiceReplies, setVoiceReplies] = useState(true)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const lastAutoScrolledMessageIdRef = useRef<string | null>(null)
  const lastSpokenMessageIdRef = useRef<string | null>(null)

  const stopSpeech = () => {
    window.speechSynthesis?.cancel()
  }

  useEffect(() => {
    if (!sessionId) return
    if (!currentSession || currentSession.id !== sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  useEffect(() => {
    if (currentSession?.status === 'COMPLETED') {
      navigate(`/results/${currentSession.id}`)
    }
  }, [currentSession?.status])

  useEffect(() => {
    if (!voiceReplies || typeof window === 'undefined' || !window.speechSynthesis) return

    const latestMessage = currentSession?.messages.at(-1)
    if (!latestMessage || latestMessage.role !== 'AI' || latestMessage.id === lastSpokenMessageIdRef.current) return

    lastSpokenMessageIdRef.current = latestMessage.id
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(latestMessage.content)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [currentSession?.messages, voiceReplies])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const latestMessage = currentSession?.messages.at(-1)
    if (!latestMessage || latestMessage.role !== 'AI' || latestMessage.id === lastAutoScrolledMessageIdRef.current) return

    lastAutoScrolledMessageIdRef.current = latestMessage.id
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
    if (!currentSession || currentSession.status !== 'ACTIVE') return undefined

    const saveQuitSummary = () => {
      void saveInterviewSummary(currentSession.id, 'QUIT', { keepalive: true })
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      saveQuitSummary()
      event.preventDefault()
      event.returnValue = ''
    }

    const handlePageHide = () => {
      saveQuitSummary()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [currentSession])

  if (!sessionId) {
    return <p className="text-slate-300">Invalid interview session.</p>
  }

  if (loading && !currentSession) {
    return <Loader />
  }

  if (!currentSession) {
    return <p className="text-slate-300">Loading session...</p>
  }

  const handleSend = async (message: string) => {
    return sendAnswer(message)
  }

  const handleComplete = async () => {
    await completeInterview()
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <ProblemStatement session={currentSession} />
        <Card className="rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
          <InterviewTimer startedAt={currentSession.startedAt} completedAt={currentSession.completedAt} />
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
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <ChatPanel messages={currentSession.messages} pendingVoiceTranscript={pendingVoiceTranscript} />
          </div>
        </Card>

        <div ref={controlsRef}>
          <InterviewControls
            onSubmit={handleSend}
            onComplete={handleComplete}
            onVoiceStart={stopSpeech}
            onVoiceTranscript={setPendingVoiceTranscript}
            loading={loading}
            disabled={currentSession.status === 'COMPLETED'}
          />
        </div>
      </div>
    </div>
  )
}
