import type { ImprovedResumeResult } from '../../shared/improvedResume'
import type { ResumeReview } from '../../shared/resumeReview'
import { getAuthToken } from './authToken'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export type ResumeReviewRequest = { role: string; experience: string; jobDescription: string; resumeBase64: string }

export async function requestResumeReview(input: ResumeReviewRequest): Promise<ResumeReview> {
  const token = getAuthToken()
  const response = await fetch(`${baseURL}/resume/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(input),
  })
  const data = (await response.json().catch(() => ({}))) as { review?: ResumeReview; error?: string }
  if (!response.ok || !data.review) {
    throw new Error(data.error || (response.status === 413 ? 'The PDF is too large (max 3 MB).' : 'Could not review the resume. Please try again.'))
  }
  return data.review
}

export type ImproveResumeRequest = { role: string; jobDescription: string; resumeText: string; fixes: string[] }

export async function requestImprovedResume(input: ImproveResumeRequest): Promise<ImprovedResumeResult> {
  const token = getAuthToken()
  const response = await fetch(`${baseURL}/resume/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ mode: 'improve', ...input }),
  })
  const data = (await response.json().catch(() => ({}))) as { improved?: ImprovedResumeResult; error?: string }
  if (!response.ok || !data.improved) throw new Error(data.error || 'Could not build the improved resume. Please try again.')
  return data.improved
}

/** Reads a File as base64 (without the data: prefix). */
export function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
}
