import { HttpError } from '../utils/httpError.js'
import { getRequestUserId } from '../services/authService.js'
import {
  addInterviewMessage,
  completeInterviewSession,
  getAuthorizedSession,
  startInterviewSession,
  toPublicSession,
  transcribeSessionAudio,
  type SessionAccess,
} from '../services/interviewSessionService.js'
import { listSummariesForUser, saveCompletedSummary, saveQuitSummary } from '../services/interviewSummaryService.js'
import { enforceRateLimit } from './rateLimit.js'

/** Framework-neutral request shape shared by the Express server and the Vercel functions. */
export type ApiRequest = {
  params: Record<string, string | undefined>
  body: unknown
  headers: Record<string, string | undefined>
  ip?: string
}

export type ApiResult = {
  status: number
  body: unknown
}

export type ApiHandler = (req: ApiRequest) => Promise<ApiResult>

const hourMs = 60 * 60 * 1000
// Base64 inflates by ~4/3; this keeps recordings under ~3 MB and below Vercel's 4.5 MB body cap.
const maxAudioBase64Length = 4_000_000

function getBody(req: ApiRequest) {
  return req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {}
}

async function getAccess(req: ApiRequest): Promise<SessionAccess> {
  return {
    uid: await getRequestUserId(req.headers.authorization),
    sessionKey: req.headers['x-session-key'],
  }
}

export function flattenValues(values: Record<string, string | string[] | undefined>, lowerCaseKeys = false) {
  const flat: Record<string, string | undefined> = {}
  for (const [name, value] of Object.entries(values)) {
    flat[lowerCaseKeys ? name.toLowerCase() : name] = Array.isArray(value) ? value[0] : value
  }
  return flat
}

export function toErrorResult(error: unknown): ApiResult {
  if (error instanceof HttpError) {
    if (error.statusCode >= 500) console.error(error)
    return { status: error.statusCode, body: { error: error.message } }
  }

  console.error(error)
  return { status: 500, body: { error: 'Something went wrong. Please try again.' } }
}

export async function runHandler(handler: ApiHandler, req: ApiRequest) {
  try {
    return await handler(req)
  } catch (error) {
    return toErrorResult(error)
  }
}

export const startInterview: ApiHandler = async (req) => {
  const access = await getAccess(req)
  enforceRateLimit(`start:${access.uid ?? req.ip ?? 'unknown'}`, 12, hourMs)

  const body = getBody(req)
  const { session, accessKey } = await startInterviewSession(
    { interviewType: body.interviewType, difficulty: body.difficulty, questionSet: body.questionSet },
    access.uid,
  )
  return { status: 201, body: { session: toPublicSession(session), accessKey } }
}

export const postMessage: ApiHandler = async (req) => {
  const access = await getAccess(req)
  enforceRateLimit(`message:${req.params.sessionId}`, 30, hourMs)

  const { aiMessage, session } = await addInterviewMessage(req.params.sessionId, getBody(req).message, access)
  const summary = await saveCompletedSummary(session, access.uid)
  return { status: 200, body: { aiMessage, session: toPublicSession(session), summary } }
}

export const completeInterview: ApiHandler = async (req) => {
  const access = await getAccess(req)
  const session = await completeInterviewSession(req.params.sessionId, access)
  const summary = await saveCompletedSummary(session, access.uid)
  return { status: 200, body: { scorecard: session.scorecard, session: toPublicSession(session), summary } }
}

export const getSession: ApiHandler = async (req) => {
  const session = await getAuthorizedSession(req.params.sessionId, await getAccess(req))
  return { status: 200, body: { session: toPublicSession(session) } }
}

export const saveSummary: ApiHandler = async (req) => {
  const summary = await saveQuitSummary(req.params.sessionId, await getAccess(req))
  return { status: 200, body: { summary } }
}

export const listHistory: ApiHandler = async (req) => {
  const summaries = await listSummariesForUser((await getAccess(req)).uid)
  return { status: 200, body: { summaries } }
}

export const transcribe: ApiHandler = async (req) => {
  const access = await getAccess(req)
  const { sessionId, audioBase64, mimeType } = getBody(req)
  const id = typeof sessionId === 'string' ? sessionId : undefined

  if (typeof audioBase64 === 'string' && audioBase64.length > maxAudioBase64Length) {
    throw new HttpError(413, 'Voice recording is too long. Please keep answers under about 3 minutes or split them up.')
  }
  enforceRateLimit(`transcribe:${id ?? req.ip ?? 'unknown'}`, 40, hourMs)

  const transcript = await transcribeSessionAudio(id, audioBase64, mimeType, access)
  return { status: 200, body: { transcript } }
}
