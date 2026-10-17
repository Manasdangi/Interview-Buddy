/** Converts interviewer markdown into text that reads naturally with speech synthesis. */
export function toSpeechText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' (see the code snippet on screen) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function speakText(markdown: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(toSpeechText(markdown))
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}
