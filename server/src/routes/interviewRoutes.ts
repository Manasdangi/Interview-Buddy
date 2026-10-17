import { Router } from 'express'
import type { Request, Response } from 'express'
import {
  completeInterview,
  flattenValues,
  getSession,
  listHistory,
  postMessage,
  runHandler,
  saveSummary,
  startInterview,
  transcribe,
  type ApiHandler,
} from '../http/handlers.js'

const router = Router()

const route = (handler: ApiHandler) => (req: Request, res: Response) => {
  void runHandler(handler, {
    params: req.params,
    body: req.body,
    headers: flattenValues(req.headers, true),
    ip: req.ip,
  }).then((result) => res.status(result.status).json(result.body))
}

router.post('/start', route(startInterview))
router.post('/transcribe', route(transcribe))
router.get('/history', route(listHistory))
router.post('/:sessionId/message', route(postMessage))
router.post('/:sessionId/complete', route(completeInterview))
router.post('/:sessionId/summary', route(saveSummary))
router.get('/:sessionId', route(getSession))

export default router
