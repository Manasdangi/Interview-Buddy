import { createVercelHandler } from '../../server/src/http/vercel.js'
import { siteStats } from '../../server/src/http/handlers.js'

export default createVercelHandler('GET', siteStats)
