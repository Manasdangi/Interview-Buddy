import { createWebAudioStreamHandler } from '../../server/src/http/vercel.js'
import { prepareSpeechStream } from '../../server/src/http/handlers.js'

// Natural interviewer voice, streamed as raw PCM so playback starts on the first chunk.
export const POST = createWebAudioStreamHandler(prepareSpeechStream)
