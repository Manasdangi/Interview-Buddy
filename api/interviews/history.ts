import { createVercelHandler } from '../../server/src/http/vercel.js'
import { listHistory } from '../../server/src/http/handlers.js'

export default createVercelHandler('GET', listHistory)
