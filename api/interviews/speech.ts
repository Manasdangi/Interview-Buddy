import { createVercelHandler } from '../../server/src/http/vercel.js'
import { speech } from '../../server/src/http/handlers.js'

export default createVercelHandler('POST', speech)
