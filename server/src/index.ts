import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import interviewRoutes from './routes/interviewRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())
app.use(express.json({ limit: '12mb' }))
app.use('/api/interviews', interviewRoutes)

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  void _next
  console.error(error)
  res.status(500).json({ error: error.message || 'Something went wrong.' })
})

app.listen(port, () => {
  console.log(`Interview Buddy API listening on http://localhost:${port}`)
})
