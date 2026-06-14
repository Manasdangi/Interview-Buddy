import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import {
  completeInterview,
  getSession,
  listSessions,
  postMessage,
  startInterview,
  transcribeVoice,
} from '../controllers/interviewController'

const router = Router()

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next)
  }

router.post('/start', asyncHandler(startInterview))
router.post('/transcribe', asyncHandler(transcribeVoice))
router.post('/:sessionId/message', asyncHandler(postMessage))
router.post('/:sessionId/complete', asyncHandler(completeInterview))
router.get('/:sessionId', getSession)
router.get('/', listSessions)

export default router
