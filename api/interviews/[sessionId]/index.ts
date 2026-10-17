import { createVercelHandler } from '../../../server/src/http/vercel.js'
import { getSession } from '../../../server/src/http/handlers.js'

export default createVercelHandler('GET', getSession)
