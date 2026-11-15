import { createVercelStreamHandler } from '../../../server/src/http/vercel.js'
import { streamMessage } from '../../../server/src/http/handlers.js'

// Live voice: streams the interviewer's reply so it can be spoken sentence by sentence.
export default createVercelStreamHandler(streamMessage)
