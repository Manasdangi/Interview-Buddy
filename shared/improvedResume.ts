// Shared between the resume page and the API: the rewritten resume that both downloadable layouts are built from.

export type ImprovedResume = {
  name: string
  headline: string
  contact: string[]
  summary: string
  experience: Array<{ title: string; company: string; location: string; dates: string; bullets: string[] }>
  projects: Array<{ name: string; tech: string; bullets: string[] }>
  skills: Array<{ category: string; items: string[] }>
  education: Array<{ degree: string; school: string; dates: string; detail: string }>
  extras: Array<{ heading: string; items: string[] }>
}

export type ImprovedResumeResult = {
  resume: ImprovedResume
  /** Things only the candidate can add or confirm, e.g. real numbers or full links. */
  todo: string[]
}

export const maxResumeTextLength = 20_000
