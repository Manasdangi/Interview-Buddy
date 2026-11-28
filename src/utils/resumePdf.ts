import { jsPDF } from 'jspdf'
import type { ImprovedResume } from '../../shared/improvedResume'

export type ResumeVariant = 'classic' | 'modern'

type Section = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'extras'

// Both layouts are single-column, real text, with standard headings, so applicant tracking systems read them in order.
const themes = {
  classic: {
    font: 'times',
    accent: [20, 20, 20],
    centered: true,
    order: ['summary', 'experience', 'projects', 'skills', 'education', 'extras'] as Section[],
  },
  modern: {
    font: 'helvetica',
    accent: [67, 56, 202],
    centered: false,
    order: ['summary', 'skills', 'experience', 'projects', 'education', 'extras'] as Section[],
  },
} as const

/** The built-in PDF fonts only cover Latin-1, so swap common typography for plain equivalents. */
export function toPdfText(value: string) {
  return value
    .replace(/[‘’′]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/→/g, '->')
    .replace(/₹\s?/g, 'Rs ')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

export function buildResumePdf(resume: ImprovedResume, variant: ResumeVariant) {
  const theme = themes[variant]
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 46
  const width = doc.internal.pageSize.getWidth() - margin * 2
  const bottom = doc.internal.pageSize.getHeight() - margin
  let y = margin

  const ensureSpace = (height: number) => {
    if (y + height <= bottom) return
    doc.addPage()
    y = margin
  }

  type TextOptions = { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: readonly number[]; indent?: number; center?: boolean; bullet?: boolean }
  const write = (value: string, { size = 10, style = 'normal', color = [30, 30, 30], indent = 0, center = false, bullet = false }: TextOptions = {}) => {
    const content = toPdfText(value).trim()
    if (!content) return
    doc.setFont(theme.font, style).setFontSize(size).setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(content, width - indent) as string[]
    lines.forEach((line, index) => {
      ensureSpace(size * 1.35)
      y += size * 1.35
      if (bullet && index === 0) doc.text('•', margin + indent - 9, y)
      doc.text(line, center ? margin + width / 2 : margin + indent, y, center ? { align: 'center' } : undefined)
    })
  }

  const heading = (title: string) => {
    // Keeps a heading on the same page as the first lines under it.
    ensureSpace(58)
    y += 9
    write(title.toUpperCase(), { size: 11, style: 'bold', color: theme.accent })
    y += 4
    doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]).setLineWidth(variant === 'classic' ? 0.6 : 1.2)
    doc.line(margin, y, margin + width, y)
    y += 2
  }

  /** A bold entry title with its dates right-aligned on the first line. */
  const entry = (title: string, dates: string) => {
    ensureSpace(40)
    y += 3
    const right = toPdfText(dates)
    doc.setFont(theme.font, 'normal').setFontSize(9.5)
    const dateWidth = right ? doc.getTextWidth(right) + 12 : 0
    doc.setFont(theme.font, 'bold').setFontSize(10.5).setTextColor(20, 20, 20)
    const lines = doc.splitTextToSize(toPdfText(title), width - dateWidth) as string[]
    lines.forEach((line, index) => {
      ensureSpace(14)
      y += 14
      doc.setFont(theme.font, 'bold').setFontSize(10.5).setTextColor(20, 20, 20)
      doc.text(line, margin, y)
      if (index === 0 && right) {
        doc.setFont(theme.font, 'normal').setFontSize(9.5).setTextColor(80, 80, 80)
        doc.text(right, margin + width, y, { align: 'right' })
      }
    })
  }

  const bullets = (items: string[]) => items.forEach((item) => write(item, { indent: 14, bullet: true }))
  const join = (parts: string[]) => parts.filter(Boolean).join(' | ')

  const sections: Record<Section, () => void> = {
    summary: () => {
      if (!resume.summary) return
      heading('Summary')
      write(resume.summary)
    },
    skills: () => {
      if (!resume.skills.length) return
      heading('Skills')
      resume.skills.forEach((group) => write(`${group.category ? `${group.category}: ` : ''}${group.items.join(', ')}`))
    },
    experience: () => {
      if (!resume.experience.length) return
      heading('Experience')
      resume.experience.forEach((job) => {
        entry(join([job.title, job.company, job.location]), job.dates)
        bullets(job.bullets)
      })
    },
    projects: () => {
      if (!resume.projects.length) return
      heading('Projects')
      resume.projects.forEach((project) => {
        entry(project.name, '')
        write(project.tech, { style: 'italic', size: 9.5, color: [80, 80, 80] })
        bullets(project.bullets)
      })
    },
    education: () => {
      if (!resume.education.length) return
      heading('Education')
      resume.education.forEach((item) => {
        entry(join([item.degree, item.school]), item.dates)
        write(item.detail)
      })
    },
    extras: () =>
      resume.extras.forEach((section) => {
        heading(section.heading)
        bullets(section.items)
      }),
  }

  const center = theme.centered
  write(resume.name, { size: 21, style: 'bold', color: theme.accent, center })
  y += 3
  write(resume.headline, { size: 11.5, center, color: [60, 60, 60] })
  write(join(resume.contact), { size: 9.5, center, color: [60, 60, 60] })
  theme.order.forEach((section) => sections[section]())

  return doc
}

export function downloadResumePdf(resume: ImprovedResume, variant: ResumeVariant) {
  const slug = resume.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'improved'
  buildResumePdf(resume, variant).save(`${slug}-resume-${variant}.pdf`)
}
