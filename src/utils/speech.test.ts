import { describe, expect, it } from 'vitest'
import { pickDefaultVoice, speakInlineCode, splitIntoChunks, toSpeakableText } from './speech'

function voice(name: string, lang: string) {
  return { name, lang } as SpeechSynthesisVoice
}

describe('toSpeakableText', () => {
  it('points to code blocks on screen instead of reading them, and strips markdown', () => {
    expect(toSpeakableText('Look at this snippet:\n```js\nconst a = 1\n```\nWhat does **it** do?')).toBe(
      'Look at this snippet. Take a moment to read it on your screen. What does it do?',
    )
    expect(toSpeakableText('Predict the output.\n```js\nfor (var i = 0; i < 3; i++) setTimeout(() => console.log(i))\n```')).toBe(
      'Predict the output. Take a look at the code on your screen.',
    )
  })

  it('speaks inline code the way an interviewer would', () => {
    expect(toSpeakableText('Why does `useEffect` re-run?')).toBe('Why does use Effect re-run?')
    expect(
      toSpeakableText(
        '**Question 1:** each interval is `[start, end]`, for example `[[9, 12], [1, 3]]`. Write a function `mergeIntervals(intervals)` that returns `[[1, 4], [9, 13]]`.',
      ),
    ).toBe('Question 1: each interval is start and end, for example, as shown on your screen. Write a function merge Intervals that returns the example on your screen.')
    expect(toSpeakableText('When would you use `===` over `Promise.allSettled`?')).toBe('When would you use triple equals over Promise all Settled?')
  })
})

describe('speakInlineCode', () => {
  it('reads names and field lists, and returns null for literal-heavy code', () => {
    expect(speakInlineCode('{ value, next }')).toBe('value and next')
    expect(speakInlineCode('reverseList(head)')).toBe('reverse List')
    expect(speakInlineCode('0.1 + 0.2')).toBeNull()
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
