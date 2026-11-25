import { Router } from 'express'
import type { Request, Response } from 'express'
import { flattenValues, runHandler, siteStats, siteVisit } from '../http/handlers.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  void runHandler(siteStats, { params: req.params, body: req.body, headers: flattenValues(req.headers, true), ip: req.ip }).then((result) =>
    res.status(result.status).json(result.body),
  )
})

router.post('/', (req: Request, res: Response) => {
  void runHandler(siteVisit, { params: req.params, body: req.body, headers: flattenValues(req.headers, true), ip: req.ip }).then((result) =>
    res.status(result.status).json(result.body),
  )
})

export default router
