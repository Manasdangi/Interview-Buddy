import { createVercelHandler } from '../../server/src/http/vercel.js'
import { resumeReview } from '../../server/src/http/handlers.js'

export default createVercelHandler('POST', resumeReview)
