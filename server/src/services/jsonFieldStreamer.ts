/**
 * Pulls one top-level string field (e.g. "message") out of JSON that arrives in pieces, emitting the decoded
 * text as soon as it is available. Used to speak Claude's reply while the rest of the tool input still streams.
 */
export function createJsonStringFieldStreamer(field: string, onText: (text: string) => void) {
  const opener = new RegExp(`"${field}"\\s*:\\s*"`)
  let buffer = ''
  let state: 'search' | 'inside' | 'done' = 'search'
  let position = 0

  const process = () => {
    if (state === 'search') {
      const match = opener.exec(buffer)
      if (!match) return
      state = 'inside'
      position = match.index + match[0].length
    }
    if (state !== 'inside') return

    let out = ''
    while (position < buffer.length) {
      const char = buffer[position]
      if (char === '"') {
        state = 'done'
        position += 1
        break
      }
      if (char !== '\\') {
        out += char
        position += 1
        continue
      }
      // Escape sequence: wait until it has fully arrived.
      const next = buffer[position + 1]
      if (next === undefined) break
      if (next === 'u') {
        const hex = buffer.slice(position + 2, position + 6)
        if (hex.length < 4) break
        out += String.fromCharCode(Number.parseInt(hex, 16))
        position += 6
        continue
      }
      const escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '"': '"', '\\': '\\', '/': '/' }
      out += escapes[next] ?? next
      position += 2
    }
    if (out) onText(out)
  }

  return {
    push(chunk: string) {
      if (state === 'done') return
      buffer += chunk
      process()
    },
    get started() {
      return state !== 'search'
    },
  }
}
