import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateJson, generateText } from './claudeService.js'

const schema = { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test')
  vi.stubEnv('ANTHROPIC_MODEL', '')
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('generateJson', () => {
  it('asks for a schema-shaped tool call (without forcing it) and returns the tool input as JSON text', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ stop_reason: 'tool_use', content: [{ type: 'tool_use', input: { message: 'Why?' } }] }))

    const result = await generateJson('system prompt', 'user prompt', schema)

    expect(JSON.parse(result)).toEqual({ message: 'Why?' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers).toMatchObject({ 'x-api-key': 'sk-test', 'anthropic-version': '2023-06-01' })
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      model: 'claude-sonnet-5-5',
      messages: [{ role: 'user', content: 'user prompt' }],
      tool_choice: { type: 'auto' },
    })
    expect(body.system).toContain('system prompt')
    expect(body.system).toContain('calling the "respond" tool')
    expect(body.tools[0].input_schema).toEqual(schema)
  })

  it('uses a bigger token budget for the long report and honours ANTHROPIC_MODEL', async () => {
    vi.stubEnv('ANTHROPIC_MODEL', 'claude-haiku-5-5')
    fetchMock.mockResolvedValueOnce(jsonResponse({ content: [{ type: 'tool_use', input: { message: 'x' } }] }))

    await generateJson('s', 'u', schema, { long: true })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.model).toBe('claude-haiku-5-5')
    expect(body.max_tokens).toBeGreaterThan(4_000)
  })

  it('retries once on 529 overloaded, then succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Overloaded' } }, 529))
      .mockResolvedValueOnce(jsonResponse({ content: [{ type: 'tool_use', input: { message: 'ok' } }] }))

    await expect(generateJson('s', 'u', schema)).resolves.toContain('ok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('maps overload, rate limit and bad key errors to friendly messages', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: 'Overloaded' } }, 529))
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 503 })

    fetchMock.mockReset().mockResolvedValue(jsonResponse({ error: { message: 'slow down' } }, 429))
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 429 })

    fetchMock.mockReset().mockResolvedValue(jsonResponse({ error: { message: 'invalid x-api-key' } }, 401))
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 500, message: expect.stringContaining('ANTHROPIC_API_KEY') })
  })

  it('rejects truncated and empty responses', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ stop_reason: 'max_tokens', content: [{ type: 'tool_use', input: { message: 'cut' } }] }))
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 502 })

    fetchMock.mockResolvedValueOnce(jsonResponse({ content: [] }))
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 502 })
  })

  it('falls back to the text when the model answers without calling the tool', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ content: [{ type: 'text', text: '```json\n{"message":"Hi"}\n```' }] }))
    await expect(generateJson('s', 'u', schema)).resolves.toContain('"message":"Hi"')
  })

  it('fails clearly when the API key is missing', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    await expect(generateJson('s', 'u', schema)).rejects.toMatchObject({ statusCode: 500, message: expect.stringContaining('ANTHROPIC_API_KEY') })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('generateText', () => {
  it('joins the text blocks and sends no tools', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ content: [{ type: 'text', text: 'Hello ' }, { type: 'text', text: 'there' }] }))

    await expect(generateText('s', 'u')).resolves.toBe('Hello there')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.tools).toBeUndefined()
    expect(body.tool_choice).toBeUndefined()
  })
})
