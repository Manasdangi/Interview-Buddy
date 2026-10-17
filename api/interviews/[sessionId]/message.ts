import { createVercelHandler } from '../../../server/src/http/vercel.js'
import { postMessage } from '../../../server/src/http/handlers.js'

export default createVercelHandler('POST', postMessage)
