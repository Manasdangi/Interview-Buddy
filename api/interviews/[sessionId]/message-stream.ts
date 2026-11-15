import { createWebStreamHandler } from '../../../server/src/http/vercel.js'
import { streamMessage } from '../../../server/src/http/handlers.js'

// Live voice: streams the interviewer's reply so it can be spoken sentence by sentence.
export const POST = createWebStreamHandler(streamMessage, (url) => {
  const parts = url.pathname.split('/')
  return { sessionId: decodeURIComponent(parts[parts.indexOf('interviews') + 1] ?? '') }
})
