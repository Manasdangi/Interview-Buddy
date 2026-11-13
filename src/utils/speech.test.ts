import { describe, expect, it } from 'vitest'
import { pickDefaultVoice, splitIntoChunks, toSpeakableText } from './speech'

function voice(name: string, lang: string) {
  return { name, lang } as SpeechSynthesisVoice
}

describe('toSpeakableText', () => {
  it('replaces code blocks and strips markdown symbols', () => {
    expect(toSpeakableText('Look at this:\n```js\nconst a = 1\n```\nWhat does **it** do?')).toBe('Look at this: (the code is on your screen) What does it do?')
    expect(toSpeakableText('Why does `useEffect` re-run?')).toBe('Why does useEffect re-run?')
  })
})

describe('splitIntoChunks', () => {
  it('splits by sentence and breaks very long sentences at spaces', () => {
    expect(splitIntoChunks('One. Two? Three!')).toEqual(['One.', 'Two?', 'Three!'])
    const long = `${'word '.repeat(80)}end.`
    const chunks = splitIntoChunks(long, 100)
    expect(chunks.length).toBeGreaterThan(3)
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true)
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(long.replace(/\s+/g, ' '))
  })
})

describe('pickDefaultVoice', () => {
  it('prefers a saved voice, then Indian/British/US English', () => {
    const voices = [voice('Fred', 'en-US'), voice('Veena', 'en-IN'), voice('Kate', 'en-GB')]
    expect(pickDefaultVoice(voices, 'Fred')?.name).toBe('Fred')
    expect(pickDefaultVoice(voices)?.name).toBe('Veena')
    expect(pickDefaultVoice([], null)).toBeNull()
  })
})

describe('pickDefaultVoice naming', () => {
  it('lets a natural-sounding voice beat a plain one in a lower-priority language', () => {
    expect(pickDefaultVoice([voice('Plain', 'en-IN'), voice('Google UK English Female', 'en-GB')])?.name).toBe('Google UK English Female')
  })
})
