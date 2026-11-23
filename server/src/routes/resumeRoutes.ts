import { Router } from 'express'
import type { Request, Response } from 'express'
import { flattenValues, resumeReview, runHandler } from '../http/handlers.js'

const router = Router()

router.post('/review', (req: Request, res: Response) => {
  void runHandler(resumeReview, { params: req.params, body: req.body, headers: flattenValues(req.headers, true), ip: req.ip }).then((result) =>
    res.status(result.status).json(result.body),
  )
})

export default router
