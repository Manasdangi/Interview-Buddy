import { describe, expect, it } from 'vitest'
import { takeSentences } from './speech'

describe('takeSentences', () => {
  it('splits complete sentences and keeps the unfinished tail', () => {
    const { sentences, rest } = takeSentences('Good, that covers the basics well. Now, how would you debounce a search box? Think about')
    expect(sentences).toEqual(['Good, that covers the basics well.', 'Now, how would you debounce a search box?'])
    expect(rest).toBe(' Think about')
  })

  it('merges very short sentences into the next one', () => {
    const { sentences, rest } = takeSentences('Okay. Nice. Let us move to event delegation now. ')
    expect(sentences).toEqual(['Okay. Nice. Let us move to event delegation now.'])
    expect(rest.trim()).toBe('')
  })

  it('waits for whitespace after the full stop so "e.g" or numbers do not split early', () => {
    expect(takeSentences('The value is 3.5').sentences).toEqual([])
  })
})
