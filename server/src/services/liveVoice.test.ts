import { afterEach, describe, expect, it, vi } from 'vitest'
import { createJsonStringFieldStreamer } from './jsonFieldStreamer.js'
import { pcmToWav } from './speechService.js'
import { generateJson } from './claudeService.js'

describe('createJsonStringFieldStreamer', () => {
  it('emits the field text incrementally, decoding escapes split across chunks', () => {
    const pieces: string[] = []
    const streamer = createJsonStringFieldStreamer('message', (text) => pieces.push(text))
    const json = JSON.stringify({ answerQuality: 'GOOD', gaps: ['say "message": no'], nextMove: 'NEXT_TOPIC', message: 'Nice. Now, what\'s a "closure"?\nTake your time — é' })
    for (let index = 0; index < json.length; index += 3) streamer.push(json.slice(index, index + 3))
    expect(pieces.join('')).toBe('Nice. Now, what\'s a "closure"?\nTake your time — é')
    expect(pieces.length).toBeGreaterThan(3)
  })
})

describe('pcmToWav', () => {
  it('adds a 44-byte RIFF/WAVE header for 24 kHz mono 16-bit audio', () => {
    const wav = pcmToWav(Buffer.alloc(100))
    expect(wav.length).toBe(144)
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE')
    expect(wav.readUInt32LE(24)).toBe(24000)
    expect(wav.readUInt32LE(40)).toBe(100)
  })
})

describe('generateJson streaming', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('streams the message field and still returns the full JSON', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test')
    const input = JSON.stringify({ answerQuality: 'PARTIAL', message: 'Good start. How would you handle errors?' })
    const events = [
      { type: 'message_start' },
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use' } },
      ...input.match(/.{1,7}/g)!.map((partial_json) => ({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json } })),
      { type: 'message_delta', delta: { stop_reason: 'tool_use' } },
    ]
    const body = events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('')
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        for (let index = 0; index < body.length; index += 40) controller.enqueue(encoder.encode(body.slice(index, index + 40)))
        controller.close()
      },
    })
    const fetchMock = vi.fn(async () => new Response(stream, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const deltas: string[] = []
    const result = await generateJson('s', 'u', { type: 'object' }, { onMessageDelta: (text) => deltas.push(text) })

    expect(JSON.parse(result)).toEqual(JSON.parse(input))
    expect(deltas.join('')).toBe('Good start. How would you handle errors?')
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1].body).stream).toBe(true)
  })
})
