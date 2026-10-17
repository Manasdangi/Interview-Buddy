import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import interviewRoutes from './routes/interviewRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '5mb' }))
app.use('/api/interviews', interviewRoutes)

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

// Handles errors raised before a route runs, e.g. malformed JSON or an oversized body.
app.use((error: Error & { status?: number; expose?: boolean }, _req: Request, res: Response, _next: NextFunction) => {
  void _next
  const statusCode = typeof error.status === 'number' ? error.status : 500
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({ error: error.expose ? error.message : 'Something went wrong. Please try again.' })
})

app.listen(port, () => {
  console.log(`Interview Buddy API listening on http://localhost:${port}`)
})
