import * as mupdf from 'mupdf'
import { describe, expect, it } from 'vitest'
import { applyEdits, readResume } from './pdfEdit'

type Row = [x: number, y: number, text: string, font?: 'F1' | 'F2', size?: number]

/** A small resume drawn with standard fonts; y is measured from the bottom of the page. */
function makePdf(rows: Row[], rotate = 0) {
  const document = new mupdf.PDFDocument()
  const resources = document.addObject({ Font: {} })
  resources.get('Font').put('F1', document.addSimpleFont(new mupdf.Font('Helvetica'), 'Latin'))
  resources.get('Font').put('F2', document.addSimpleFont(new mupdf.Font('Helvetica-Bold'), 'Latin'))
  const drawn = rows
    .map(([x, y, text, font = 'F1', size = 10]) => `BT /${font} ${size} Tf ${x} ${y} Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`)
    .join('\n')
  // A rotated page stores its content sideways, so that it reads upright once the viewer rotates it.
  const content = rotate ? `q 0 1 -1 0 842 0 cm\n${drawn}\nQ` : drawn
  const page = document.addPage(rotate ? [0, 0, 842, 595] : [0, 0, 595, 842], rotate, resources, content)
  document.insertPage(-1, page)
  const link = document.loadPage(0).createLink([40, 40, 140, 60], 'https://github.com/example')
  expect(link.getURI()).toBe('https://github.com/example')
  return document.saveToBuffer('').asUint8Array().slice()
}

const rows: Row[] = [
  [40, 800, 'Asha Verma', 'F2', 22],
  [40, 780, 'asha@example.com | +91 90000 00000'],
  [40, 750, 'Experience', 'F2', 11],
  [40, 730, '- '],
  [52, 730, 'Was responsible for the development of dashboards that were used by the'],
  [52, 718, 'internal teams every single working day.'],
  [40, 700, '- '],
  [52, 700, 'Fixed many of the bugs in the application.'],
  [400, 730, 'Skills'],
  [400, 718, 'ReactJS, Node.js, MongoDB'],
]

const textOf = (pdf: Uint8Array) => new mupdf.PDFDocument(pdf.slice()).loadPage(0).toStructuredText().asText()

describe('readResume', () => {
  it('joins wrapped lines into paragraphs and leaves out bullets and contact details', () => {
    const { paragraphs, text } = readResume(makePdf(rows))
    expect(paragraphs.map((paragraph) => paragraph.text)).toEqual([
      'Was responsible for the development of dashboards that were used by the internal teams every single working day.',
      'Fixed many of the bugs in the application.',
      'ReactJS, Node.js, MongoDB',
    ])
    expect(text).toContain('asha@example.com')
  })

  it('finds nothing to edit on a page without text', () => {
    expect(readResume(makePdf([])).paragraphs).toEqual([])
  })
})

describe('applyEdits', () => {
  it.each([0, 90])('replaces only the chosen paragraph and keeps links (page rotation %i)', (rotate) => {
    const original = makePdf(rows, rotate)
    const target = readResume(original).paragraphs[0]
    const rewrite = 'Developed dashboards that the **internal teams** used every working day.'
    const { pdf, applied, skipped } = applyEdits(original, [{ id: target.id, text: rewrite }])

    expect(skipped).toBe(0)
    expect(applied).toMatchObject([{ id: target.id, after: rewrite.replaceAll('**', '') }])
    const text = textOf(pdf).replace(/\s+/g, ' ')
    expect(text).toContain('Developed dashboards')
    expect(text).not.toContain('responsible')
    for (const kept of ['Asha Verma', 'Fixed many of the bugs', 'ReactJS, Node.js, MongoDB', '+91 90000 00000']) expect(text).toContain(kept)
    expect(new mupdf.PDFDocument(pdf.slice()).loadPage(0).getLinks().map((link) => link.getURI())).toEqual(['https://github.com/example'])
  })

  it('removes the old words from the file, not just from view', () => {
    const original = makePdf(rows)
    const target = readResume(original).paragraphs[1]
    const { pdf } = applyEdits(original, [{ id: target.id, text: 'Resolved application bugs.' }])
    const document = new mupdf.PDFDocument(pdf.slice())
    const streams: string[] = []
    for (let id = 1; id < document.countObjects(); id += 1) {
      const object = document.newIndirect(id)
      if (object.isStream()) streams.push(object.readStream().asString())
    }
    expect(streams.join('\n')).not.toContain('Fixed many')
  })

  it('keeps the original when the new text needs more room than the paragraph has', () => {
    const original = makePdf(rows)
    const target = readResume(original).paragraphs[1]
    const { pdf, applied, skipped } = applyEdits(original, [{ id: target.id, text: 'Resolved a very large number of application bugs. '.repeat(4) }])
    expect(applied).toEqual([])
    expect(skipped).toBe(1)
    expect(textOf(pdf)).toContain('Fixed many of the bugs')
  })
})
