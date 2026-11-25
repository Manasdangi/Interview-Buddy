import { createVercelHandler } from '../../server/src/http/vercel.js'
import { siteVisit } from '../../server/src/http/handlers.js'

export default createVercelHandler('POST', siteVisit)
