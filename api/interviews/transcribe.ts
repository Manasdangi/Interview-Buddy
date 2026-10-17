import { createVercelHandler } from '../../server/src/http/vercel.js'
import { transcribe } from '../../server/src/http/handlers.js'

export default createVercelHandler('POST', transcribe)
