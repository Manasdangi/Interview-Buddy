import { createVercelHandler } from '../../../server/src/http/vercel.js'
import { completeInterview } from '../../../server/src/http/handlers.js'

export default createVercelHandler('POST', completeInterview)
