/**
 * Rewrites selected paragraphs of a PDF in place, so the download keeps the uploaded design. The old words are
 * removed from the page (not just covered) and the new ones are written on the same baselines, in the original font
 * when it has every glyph needed and otherwise in the closest standard font.
 */
import * as mupdf from 'mupdf'
import type { PdfEdit, PdfParagraph } from '../../shared/improvedResume'

type Color = number[]
type Char = { c: string; x: number; x1: number; y: number; size: number; font: mupdf.Font; fontName: string; bold: boolean; italic: boolean; color: Color }
type Line = { page: number; chars: Char[]; text: string; x0: number; x1: number; y: number; size: number; bulleted?: boolean }
type Block = PdfParagraph & { page: number; lines: Line[]; right: number; justified: boolean }
type Style = { font: mupdf.Font; fontName: string; italic: boolean; color: Color }
type Word = { text: string; bold: boolean }

export type AppliedEdit = { id: number; before: string; after: string; substitutedFont: boolean }
export type EditResult = { pdf: Uint8Array; applied: AppliedEdit[]; skipped: number }

/** A leading symbol followed by a space, or a bullet glyph even without one (some fonts map it to odd code points). */
const bulletStart = /^[^\p{L}\p{N}\s("'“‘$₹€£#+@&[]\s+|^[•●◦▪■‣∙➢▸►-]\s*/u
const bulletMark = '\u2022'
const contactDetail = /@[\w-]+\.|https?:|www\.|(linkedin|github)\.com|(\d[\s().-]?){10,}/i
/** Smallest size, relative to the original, that new text may shrink to in order to fit. */
const scales = [1, 0.97, 0.94]

const open = (bytes: Uint8Array) => new mupdf.PDFDocument(bytes.slice())
const textOf = (chars: Char[]) => chars.map((char) => char.c).join('')

function makeLine(page: number, chars: Char[]): Line | null {
  let start = 0
  let end = chars.length
  while (start < end && !chars[start].c.trim()) start += 1
  while (end > start && !chars[end - 1].c.trim()) end -= 1
  const kept = chars.slice(start, end)
  if (!kept.length) return null
  const sizes = kept.map((char) => char.size).sort((a, b) => a - b)
  return { page, chars: kept, text: textOf(kept), x0: kept[0].x, x1: Math.max(...kept.map((char) => char.x1)), y: kept[0].y, size: sizes[sizes.length >> 1] }
}

/** The text extractor breaks justified lines at their stretched spaces; this puts those pieces back together. */
function joinRuns(runs: Char[][]) {
  const joined: Char[][] = []
  for (const run of runs) {
    const previous = joined[joined.length - 1]
    const end = previous?.findLast((char) => char.c.trim())
    const start = run.find((char) => char.c.trim())
    if (!previous || !end || !start || Math.abs(start.y - end.y) > 0.5 || start.x < end.x1 - 1 || start.x - end.x1 > start.size * 4) {
      joined.push([...run])
      continue
    }
    if (previous[previous.length - 1].c.trim() && start.x - end.x1 > start.size * 0.15) previous.push({ ...end, c: ' ', x: end.x1, x1: start.x })
    previous.push(...run)
  }
  return joined
}

/** Cuts a run of characters where a wide gap shows two separate things share a baseline (columns, dates). */
function splitRun(run: Char[], starts: number[]) {
  const parts: Char[][] = [[]]
  let end: number | null = null
  for (const char of run) {
    if (char.c.trim()) {
      const gap = end === null ? 0 : char.x - end
      // Justified text also has wide gaps, so a moderate one only splits where other lines begin: a column edge.
      if (gap > char.size * 4 || (gap > char.size && starts.filter((x) => Math.abs(x - char.x) < 1).length >= 3)) parts.push([])
      end = char.x1
    }
    parts[parts.length - 1].push(char)
  }
  return parts
}

/** Horizontal text lines of a page, with any bullet separated from the words after it. */
function readLines(page: mupdf.PDFPage, index: number) {
  const runs: Char[][] = []
  let horizontal = true
  page.toStructuredText('preserve-whitespace').walk({
    beginLine: (_bbox, wmode, direction) => {
      horizontal = wmode === 0 && direction[0] > 0.99
      runs.push([])
    },
    onChar: (c, origin, font, size, quad, color) => {
      if (!horizontal) return
      const name = font.getName()
      runs[runs.length - 1].push({
        c: c === '\u00A0' ? ' ' : c,
        x: origin[0],
        x1: Math.max(quad[2], quad[6]),
        y: origin[1],
        size,
        font,
        fontName: name,
        bold: font.isBold() || /bold|black|semibold|heavy|(^|\+)(cmbx|sfbx)/i.test(name),
        italic: font.isItalic() || /italic|oblique|(^|\+)cmti/i.test(name),
        color: Array.from(color),
      })
    },
  })
  const starts = runs.flatMap((run) => makeLine(index, run)?.x0 ?? [])
  const lines: Line[] = joinRuns(runs).flatMap((run) =>
    splitRun(run, starts).flatMap((part) => {
      const line = makeLine(index, part)
      if (!line) return []
      // A leading bullet stays where it is; only the words after it can be rewritten.
      const bullet = line.text.match(bulletStart)?.[0]
      if (!bullet) return [line]
      const rest = makeLine(index, line.chars.slice(bullet.length))
      return [{ ...makeLine(index, line.chars.slice(0, 1))!, text: bulletMark }, ...(rest ? [rest] : [])]
    }),
  )
  // Every bullet starts its own paragraph.
  for (const marker of lines.filter((line) => line.text === bulletMark)) {
    for (const line of lines) {
      if (line !== marker && Math.abs(line.y - marker.y) < line.size * 0.5 && line.x0 > marker.x0 && line.x0 - marker.x1 < line.size * 4) line.bulleted = true
    }
  }
  return lines
}

/** The right edge text in this position may use: the widest line starting nearby, stopping before another column. */
function rightEdge(first: Line, lines: Line[]) {
  const near = lines.filter((line) => Math.abs(line.x0 - first.x0) < 30 && line.size < first.size * 1.3)
  let edge = Math.max(first.x1, ...near.map((line) => line.x1))
  for (const other of lines) {
    if (other.x0 > first.x1 && Math.abs(other.y - first.y) < first.size * 3 && other.x0 - 8 < edge) edge = Math.max(first.x1, other.x0 - 8)
  }
  return edge
}

const wordGap = (lines: Line[]) => {
  const gaps = lines.flatMap((line) => {
    let end: number | null = null
    let spaced = false
    return line.chars.flatMap((char) => {
      if (!char.c.trim()) {
        spaced = true
        return []
      }
      const gap = spaced && end !== null ? [char.x - end] : []
      end = char.x1
      spaced = false
      return gap
    })
  })
  gaps.sort((a, b) => a - b)
  return gaps.length ? gaps[gaps.length >> 1] : null
}

/** Justified text fills its width by stretching spaces, so they differ from those on the unstretched last line. */
function isJustified(lines: Line[], right: number) {
  const body = lines.slice(0, -1)
  if (!body.length || body.some((line) => right - line.x1 > 1.5)) return false
  const full = wordGap(body)
  const last = wordGap(lines.slice(-1))
  return full !== null && last !== null && Math.abs(full - last) > 0.15
}

const firstWordWidth = (line: Line) => {
  const space = line.chars.findIndex((char) => char.c === ' ')
  const word = space < 0 ? line.chars : line.chars.slice(0, space)
  return word.length ? word[word.length - 1].x1 - line.x0 : 0
}

/** True when `next` is the wrapped continuation of `previous`: same style and indent, and its first word did not fit. */
function continues(block: Line[], next: Line, lines: Line[]) {
  const previous = block[block.length - 1]
  const gap = next.y - previous.y
  if (next.bulleted || next.page !== previous.page || Math.abs(next.size - previous.size) > 0.4) return false
  // A bold heading or job title is not the first half of the plain text under it.
  const allBold = (line: Line) => line.chars.every((char) => char.bold || !char.c.trim())
  if (block.length === 1 && allBold(previous) !== allBold(next)) return false
  if (gap < next.size * 0.8 || gap > next.size * 1.9) return false
  if (block.length > 1 && Math.abs(gap - (block[1].y - block[0].y)) > next.size * 0.25) return false
  if (Math.abs(next.x0 - previous.x0) > 2) return false
  return previous.x1 + firstWordWidth(next) + next.size * 0.3 > rightEdge(block[0], lines) - 1
}

/** Paragraph text with **bold** runs marked, so a rewrite can keep the emphasis. */
function markedText(lines: Line[]) {
  const chars: Array<{ c: string; bold: boolean }> = []
  lines.forEach((line, index) => {
    if (index) {
      const last = chars[chars.length - 1]
      // Re-joins words the original hyphenated across lines.
      if (last?.c === '-' && /[a-z]-$/.test(lines[index - 1].text) && /^[a-z]/.test(line.text)) chars.pop()
      else chars.push({ c: ' ', bold: Boolean(last?.bold && line.chars[0].bold) })
    }
    line.chars.forEach((char) => chars.push({ c: char.c, bold: char.bold }))
  })
  const mixed = chars.some((char) => char.c.trim() && !char.bold)
  let text = ''
  let open = false
  chars.forEach((char, index) => {
    const bold = mixed && (char.c.trim() ? char.bold : open && Boolean(chars[index + 1]?.bold))
    if (bold !== open) {
      text += '**'
      open = bold
    }
    text += char.c
  })
  if (open) text += '**'
  return text.replace(/ {2,}/g, ' ')
}

export const plain = (text: string) => text.replace(/\*\*/g, '')

function readBlocks(document: mupdf.PDFDocument) {
  const blocks: Block[] = []
  const pages: Line[][] = []
  for (let page = 0; page < document.countPages(); page += 1) {
    const lines = readLines(document.loadPage(page), page)
    pages.push(lines)
    const groups: Line[][] = []
    for (const line of lines) {
      if (line.text === bulletMark) continue
      // The continuation may not be the very next line in the file when columns are interleaved.
      const group = groups.slice(-4).find((candidate) => continues(candidate, line, lines))
      if (group) group.push(line)
      else groups.push([line])
    }
    for (const group of groups) {
      const right = rightEdge(group[0], lines)
      const text = markedText(group)
      blocks.push({ id: blocks.length, page, lines: group, right, justified: isJustified(group, right), text, maxChars: plain(text).length })
    }
  }
  return { blocks, pages }
}

function editable(block: Block, bodySize: number) {
  const text = plain(block.text)
  return text.length >= 15 && /[a-z]{3}/.test(text) && !contactDetail.test(text) && block.lines[0].size <= bodySize * 1.2
}

const bodySizeOf = (blocks: Block[]) => {
  const sizes = blocks.flatMap((block) => block.lines.map((line) => line.size)).sort((a, b) => a - b)
  return sizes[sizes.length >> 1] ?? 10
}

/** The paragraphs that can safely be rewritten, plus the whole resume text for fact checking. */
export function readResume(bytes: Uint8Array) {
  const { blocks, pages } = readBlocks(open(bytes))
  const bodySize = bodySizeOf(blocks)
  return {
    pageCount: pages.length,
    paragraphs: blocks.filter((block) => editable(block, bodySize)).map(({ id, text, maxChars }): PdfParagraph => ({ id, text, maxChars })),
    text: pages.flat().map((line) => line.text).join('\n'),
  }
}

// ---------- writing ----------

const winAnsi: Record<string, number> = { '€': 0x80, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97 }
const winAnsiCode = (c: string) => winAnsi[c] ?? (/^[\x20-\x7E\xA0-\xFF]$/.test(c) ? c.charCodeAt(0) : null)

type Face = { ref: () => mupdf.PDFObject; encode: (text: string) => string; width: (text: string) => number; hasSpace: boolean }
/** A font already on the page: the code and width (in ems) of each character it can draw. */
type PageFont = { ref: mupdf.PDFObject; digits: number; glyphs: Map<string, { code: number; width: number }> }

const fromUtf16 = (hex: string) => String.fromCharCode(...(hex.match(/.{4}/g) ?? []).map((unit) => parseInt(unit, 16)))

/** Reads a ToUnicode map into character → code. */
function parseCharacterMap(source: string) {
  const codes = new Map<string, number>()
  const add = (code: number, value: string) => {
    if (Array.from(value).length === 1 && !codes.has(value)) codes.set(value, code)
  }
  for (const [, section] of source.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, code, value] of section.matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]*)>/gi)) add(parseInt(code, 16), fromUtf16(value))
  }
  for (const [, section] of source.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const [, low, high, value, list] of section.matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*(?:<([0-9a-f]+)>|\[([^\]]*)\])/gi)) {
      const first = parseInt(low, 16)
      const last = Math.min(parseInt(high, 16), first + 0xffff)
      if (list !== undefined) {
        Array.from(list.matchAll(/<([0-9a-f]+)>/gi)).forEach(([, item], index) => add(first + index, fromUtf16(item)))
        continue
      }
      const text = fromUtf16(value)
      for (let code = first; code <= last && text; code += 1) {
        add(code, text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) + code - first))
      }
    }
  }
  return codes
}

/** Character widths of a two-byte font, from its W array. */
function compositeWidths(font: mupdf.PDFObject) {
  const descendant = font.get('DescendantFonts').get(0)
  const fallback = descendant.get('DW').isNumber() ? descendant.get('DW').asNumber() : 1000
  const widths = new Map<number, number>()
  const list = descendant.get('W')
  for (let index = 0; list.isArray() && index + 1 < list.length; ) {
    const first = list.get(index).asNumber()
    const next = list.get(index + 1)
    if (next.isArray()) {
      for (let offset = 0; offset < next.length; offset += 1) widths.set(first + offset, next.get(offset).asNumber())
      index += 2
    } else {
      for (let code = first; code <= next.asNumber(); code += 1) widths.set(code, list.get(index + 2).asNumber())
      index += 3
    }
  }
  return (code: number) => widths.get(code) ?? fallback
}

function readPageFont(ref: mupdf.PDFObject): PageFont | null {
  const subtype = ref.get('Subtype').asName()
  const composite = subtype === 'Type0'
  if (subtype === 'Type3' || (composite && ref.get('Encoding').asName() !== 'Identity-H')) return null
  const toUnicode = ref.get('ToUnicode')
  let codes: Map<string, number>
  if (toUnicode.isStream()) codes = parseCharacterMap(toUnicode.readStream().asString())
  else if (!composite) {
    // Without a map, only plain letters, digits and basic punctuation share their codes across the usual encodings.
    codes = new Map(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()!?/'-", (c) => [c, c.charCodeAt(0)]))
  } else return null

  let widthOf: (code: number) => number
  if (composite) widthOf = compositeWidths(ref)
  else {
    const first = ref.get('FirstChar')
    const list = ref.get('Widths')
    if (!first.isNumber() || !list.isArray()) return null
    widthOf = (code) => {
      const width = list.get(code - first.asNumber())
      return width.isNumber() ? width.asNumber() : 0
    }
  }
  const glyphs = new Map<string, { code: number; width: number }>()
  codes.forEach((code, c) => {
    const width = widthOf(code) / 1000
    if (width > 0) glyphs.set(c, { code, width })
  })
  return { ref, digits: composite ? 4 : 2, glyphs }
}

/** The fonts a page uses, by name. Fonts that cannot be written to safely are left out. */
function pageFonts(page: mupdf.PDFPage) {
  const result = new Map<string, PageFont[]>()
  const fonts = page.getObject().getInheritable('Resources').get('Font')
  if (!fonts.isDictionary()) return result
  fonts.forEach((ref) => {
    try {
      const name = ref.get('BaseFont').asName()
      const font = readPageFont(ref)
      if (font) result.set(name, [...(result.get(name) ?? []), font])
    } catch {
      // A malformed font entry simply isn't reused.
    }
  })
  return result
}

function faceFactory(document: mupdf.PDFDocument, seen: Map<string, Set<string>>) {
  const standard = new Map<string, mupdf.PDFObject>()

  /** The page's own font, only if the document has already drawn every character needed (subsets drop the rest). */
  const original = (fonts: Map<string, PageFont[]>, style: Style, text: string): Face | null => {
    const drawn = seen.get(style.fontName)
    const needed = Array.from(text).filter((c) => c !== ' ')
    const font = fonts.get(style.fontName)?.find((candidate) => needed.every((c) => candidate.glyphs.has(c) && drawn?.has(c)))
    if (!font) return null
    return {
      ref: () => font.ref,
      hasSpace: font.glyphs.has(' '),
      width: (value) => Array.from(value).reduce((sum, c) => sum + (font.glyphs.get(c)?.width ?? 0.28), 0),
      encode: (value) => Array.from(value).map((c) => font.glyphs.get(c)!.code.toString(16).padStart(font.digits, '0')).join(''),
    }
  }

  const substitute = (style: Style, bold: boolean, text: string): Face | null => {
    if (Array.from(text).some((c) => winAnsiCode(c) === null)) return null
    const name = style.fontName
    // Font names are the reliable clue; the serif flag in many PDFs is wrong. Unnamed "F12" fonts come from LaTeX.
    const serif = !/sans|(^|\+)(cm|sf)ss/i.test(name) && /times|serif|roman|garamond|georgia|cambria|charter|palatino|(^|\+)(cm|sf)(r|bx|ti|sl|b)\d|^F\d+$/i.test(name)
    const family = style.font.isMono() || /mono|courier|consol/i.test(name) ? 'Courier' : serif ? 'Times' : 'Helvetica'
    const slant = family === 'Times' ? 'Italic' : 'Oblique'
    const suffix = `${bold ? 'Bold' : ''}${style.italic ? slant : ''}`
    const base = suffix ? `${family}-${suffix}` : family === 'Times' ? 'Times-Roman' : family
    const font = new mupdf.Font(base)
    return {
      ref: () => {
        if (!standard.has(base)) standard.set(base, document.addSimpleFont(font, 'Latin'))
        return standard.get(base)!
      },
      hasSpace: true,
      width: (value) => Array.from(value).reduce((sum, c) => sum + font.advanceGlyph(font.encodeCharacter(c.codePointAt(0)!)), 0),
      encode: (value) => Array.from(value).map((c) => winAnsiCode(c)!.toString(16).padStart(2, '0')).join(''),
    }
  }

  return { original, substitute }
}

function toWords(text: string) {
  const words: Word[] = []
  text.split('**').forEach((part, index) => {
    const bold = index % 2 === 1
    part.split(/(\s+)/).forEach((token, position) => {
      if (!token.trim()) return
      // Punctuation directly after a bold run belongs to the same word, without a space.
      const glued = position === 0 && index > 0 && !/^\s/.test(part) && !/\s\*?\*?$/.test(text.split('**')[index - 1])
      words.push({ text: glued ? `\u0000${token}` : token, bold })
    })
  })
  return words
}

type Placed = { text: string; face: Face; color: Color; x: number; y: number; size: number }

/** Lays the new text onto the paragraph's original baselines, or returns null when it does not fit. */
function layout(block: Block, text: string, faces: (bold: boolean) => { face: Face; color: Color } | null): Placed[] | null {
  const first = block.lines[0]
  const available = block.right - first.x0 + 0.5
  const words = toWords(text)
  const resolved = words.map((word) => faces(word.bold))
  if (resolved.some((item) => !item)) return null

  for (const scale of scales) {
    const size = first.size * scale
    const space = (index: number) => resolved[index]!.face.width(' ') * size
    const rows: Array<Array<{ index: number; text: string; width: number; gap: number }>> = [[]]
    let used = 0
    words.forEach((word, index) => {
      const glued = word.text.startsWith('\u0000')
      const value = glued ? word.text.slice(1) : word.text
      const width = resolved[index]!.face.width(value) * size
      const gap = rows[rows.length - 1].length && !glued ? space(index) : 0
      if (rows[rows.length - 1].length && !glued && used + gap + width > available) {
        rows.push([])
        used = 0
      }
      const row = rows[rows.length - 1]
      const lead = row.length ? gap : 0
      row.push({ index, text: value, width, gap: lead })
      used += lead + width
    })
    if (rows.length > block.lines.length || rows.some((row) => row.reduce((sum, item) => sum + item.gap + item.width, 0) > available)) continue

    return rows.flatMap((row, rowIndex) => {
      const total = row.reduce((sum, item) => sum + item.gap + item.width, 0)
      const gaps = row.filter((item) => item.gap).length
      const extra = block.justified && rowIndex < rows.length - 1 && gaps ? (block.right - first.x0 - total) / gaps : 0
      const stretch = extra > 0 && extra < size * 0.6 ? extra : 0
      let x = first.x0
      return row.map((item, position) => {
        x += item.gap + (item.gap ? stretch : 0)
        const followedBySpace = Boolean(row[position + 1]?.gap)
        const { face, color } = resolved[item.index]!
        const placed = { text: followedBySpace && face.hasSpace ? `${item.text} ` : item.text, face, color, x, y: block.lines[rowIndex].y, size }
        x += item.width
        return placed
      })
    })
  }
  return null
}

function styleOf(block: Block, bold: boolean): Style {
  const chars = block.lines.flatMap((line) => line.chars).filter((char) => char.c.trim())
  const matching = chars.filter((char) => char.bold === bold)
  const pool = matching.length ? matching : chars
  const counts = new Map<string, number>()
  pool.forEach((char) => counts.set(char.fontName, (counts.get(char.fontName) ?? 0) + 1))
  const name = [...counts].sort((a, b) => b[1] - a[1])[0][0]
  return pool.find((char) => char.fontName === name)!
}

function colorOperator(color: Color) {
  const values = color.map((value) => value.toFixed(4)).join(' ')
  return `${values} ${color.length === 1 ? 'g' : color.length === 4 ? 'k' : 'rg'}`
}

function appendContent(document: mupdf.PDFDocument, page: mupdf.PDFPage, placed: Placed[]) {
  const inverse = mupdf.Matrix.invert(page.getTransform())
  const object = page.getObject()
  if (!object.getInheritable('Resources').isDictionary()) object.put('Resources', document.newDictionary())
  const resources = object.getInheritable('Resources')
  let fonts = resources.get('Font')
  if (!fonts.isDictionary()) {
    resources.put('Font', document.newDictionary())
    fonts = resources.get('Font')
  }

  const names = new Map<string, string>()
  const operators = placed.map((item) => {
    const ref = item.face.ref()
    const key = ref.toString()
    let name = names.get(key)
    if (!name) {
      name = `IB${page.getObject().asIndirect()}x${names.size}`
      fonts.put(name, ref)
      names.set(key, name)
    }
    const matrix = mupdf.Matrix.concat([1, 0, 0, -1, item.x, item.y], inverse)
    return `BT /${name} ${item.size.toFixed(3)} Tf ${colorOperator(item.color)} ${matrix.map((value) => value.toFixed(4)).join(' ')} Tm <${item.face.encode(item.text)}> Tj ET`
  })

  // Isolates the original page so its graphics state cannot move or recolour the new text.
  const contents = object.get('Contents')
  const array = document.newArray()
  array.push(document.addStream('q\n', {}))
  if (contents.isArray()) for (let index = 0; index < contents.length; index += 1) array.push(contents.get(index))
  else array.push(contents)
  array.push(document.addStream(`Q\nq\n${operators.join('\n')}\nQ\n`, {}))
  object.put('Contents', array)
}

const squash = (text: string) => text.normalize('NFKC').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()

function writeEdits(bytes: Uint8Array, edits: PdfEdit[], forceSubstitute: Set<number>) {
  const document = open(bytes)
  const { blocks, pages } = readBlocks(document)
  const seen = new Map<string, Set<string>>()
  pages.flat().forEach((line) => line.chars.forEach((char) => seen.set(char.fontName, (seen.get(char.fontName) ?? new Set()).add(char.c))))
  const factory = faceFactory(document, seen)

  // Read before any redaction, which may rewrite the page's resources.
  const fonts = pages.map((_, index) => pageFonts(document.loadPage(index)))
  const planned: Array<{ block: Block; after: string; placed: Placed[]; substitutedFont: boolean }> = []
  for (const edit of edits) {
    const block = blocks[edit.id]
    if (!block || !plain(edit.text).trim()) continue
    const attempt = (substituted: boolean) =>
      layout(block, edit.text, (bold) => {
        const style = styleOf(block, bold)
        const needed = plain(edit.text)
        const isBold = bold || (!block.text.includes('**') && block.lines[0].chars[0].bold)
        const face = substituted
          ? factory.substitute(style, isBold, needed)
          : factory.original(fonts[block.page], style, toWords(edit.text).filter((word) => word.bold === bold).map((word) => word.text.replace('\u0000', '')).join(' '))
        return face ? { face, color: style.color } : null
      })
    const own = forceSubstitute.has(edit.id) ? null : attempt(false)
    const placed = own ?? attempt(true)
    if (placed) planned.push({ block, after: edit.text, placed, substitutedFont: !own })
  }

  for (let index = 0; index < pages.length; index += 1) {
    const changes = planned.filter((item) => item.block.page === index)
    if (!changes.length) continue
    const page = document.loadPage(index)
    for (const { block } of changes) {
      for (const line of block.lines) {
        // A thin band through the middle of the letters, so neighbouring lines are left alone.
        page.createAnnotation('Redact').setRect([line.x0 + 0.3, line.y - line.size * 0.42, line.x1 - 0.3, line.y - line.size * 0.18])
      }
    }
    page.applyRedactions(false, mupdf.PDFPage.REDACT_IMAGE_NONE, mupdf.PDFPage.REDACT_LINE_ART_NONE, mupdf.PDFPage.REDACT_TEXT_REMOVE)
    appendContent(document, page, changes.flatMap((item) => item.placed))
  }

  // garbage=3 drops the replaced content from the file, so the old wording cannot be extracted.
  const pdf = document.saveToBuffer('garbage=3,compress').asUint8Array().slice()
  return { pdf, planned, blocks, pages }
}

/** Reads the new file back and returns the ids of edits whose text, or whose untouched neighbours, did not survive. */
function findDamage({ pdf, planned, pages }: ReturnType<typeof writeEdits>) {
  const result = readBlocks(open(pdf))
  const failed = new Set<number>()
  pages.forEach((lines, index) => {
    const changes = planned.filter((item) => item.block.page === index)
    if (!changes.length) return
    const found = squash(result.pages[index].map((line) => line.text).join(''))
    // Compares as a bag of characters too, because the reading order of the new text can differ.
    for (const change of changes) {
      const words = plain(change.after).split(/\s+/).map(squash).filter(Boolean)
      if (words.some((word) => !found.includes(word))) failed.add(change.block.id)
    }
    const replaced = new Set(changes.flatMap((item) => item.block.lines))
    const lost = lines.filter((line) => !replaced.has(line) && !found.includes(squash(line.text)))
    for (const line of lost) {
      const nearest = [...changes].sort((a, b) => Math.abs(a.block.lines[0].y - line.y) - Math.abs(b.block.lines[0].y - line.y))[0]
      failed.add(nearest.block.id)
    }
    const count = (value: string) => squash(value).length
    const expected =
      count(lines.map((line) => line.text).join('')) -
      changes.reduce((sum, item) => sum + count(item.block.lines.map((line) => line.text).join('')), 0) +
      changes.reduce((sum, item) => sum + count(plain(item.after)), 0)
    // Leftover old words or missing characters anywhere on the page.
    if (Math.abs(found.length - expected) > changes.length * 2) changes.forEach((item) => failed.add(item.block.id))
  })
  return failed
}

export function applyEdits(bytes: Uint8Array, edits: PdfEdit[]): EditResult {
  let remaining = edits
  const forceSubstitute = new Set<number>()
  for (;;) {
    const written = writeEdits(bytes, remaining, forceSubstitute)
    const failed = findDamage(written)
    if (!failed.size) {
      return {
        pdf: written.pdf,
        applied: written.planned.map((item) => ({ id: item.block.id, before: plain(item.block.text), after: plain(item.after), substitutedFont: item.substitutedFont })),
        skipped: edits.length - written.planned.length,
      }
    }
    // First retry a damaged edit with a standard font; if that fails too, leave the paragraph as it was.
    remaining = remaining.filter((edit) => !(failed.has(edit.id) && forceSubstitute.has(edit.id)))
    failed.forEach((id) => forceSubstitute.add(id))
  }
}
