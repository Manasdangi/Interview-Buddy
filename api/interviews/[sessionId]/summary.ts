import { createVercelHandler } from '../../../server/src/http/vercel.js'
import { saveSummary } from '../../../server/src/http/handlers.js'

export default createVercelHandler('POST', saveSummary)
