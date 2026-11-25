import { siteStats, siteVisit } from '../server/src/http/handlers.js'
import { createVercelHandler } from '../server/src/http/vercel.js'

// One function for both calls: the Hobby plan allows at most 12 serverless functions per deployment.
const read = createVercelHandler('GET', siteStats)
const write = createVercelHandler('POST', siteVisit)

export default function handler(req: Parameters<typeof read>[0], res: Parameters<typeof read>[1]) {
  return req.method === 'POST' ? write(req, res) : read(req, res)
}
