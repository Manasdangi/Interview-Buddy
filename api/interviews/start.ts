import { createVercelHandler } from '../../server/src/http/vercel.js'
import { startInterview } from '../../server/src/http/handlers.js'

export default createVercelHandler('POST', startInterview)
