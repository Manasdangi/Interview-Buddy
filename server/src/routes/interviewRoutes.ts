import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import {
  completeInterview,
  getSession,
  listSummaries,
  listSessions,
  postMessage,
  saveSummary,
  startInterview,
  transcribeVoice,
} from '../controllers/interviewController.js'

const router = Router()

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next)
  }

router.post('/start', asyncHandler(startInterview))
router.post('/transcribe', asyncHandler(transcribeVoice))
router.get('/summaries', asyncHandler(listSummaries))
router.post('/:sessionId/message', asyncHandler(postMessage))
router.post('/:sessionId/complete', asyncHandler(completeInterview))
router.post('/:sessionId/summary', asyncHandler(saveSummary))
router.get('/:sessionId', asyncHandler(getSession))
router.get('/', asyncHandler(listSessions))

export default router
