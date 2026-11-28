// Shared between the resume page and the API: the paragraphs of an uploaded resume that are rewritten in place.

export type PdfParagraph = {
  id: number
  /** Paragraph text; **double asterisks** mark bold runs. */
  text: string
  /** The rewrite may not be longer than this, so it fits the space on the page. */
  maxChars: number
}

export type PdfEdit = { id: number; text: string }

export type ImprovedResumeResult = {
  edits: PdfEdit[]
  /** Things only the candidate can add or fix, e.g. real numbers or layout changes. */
  todo: string[]
}

export const maxResumeTextLength = 20_000
export const maxResumeParagraphs = 150
