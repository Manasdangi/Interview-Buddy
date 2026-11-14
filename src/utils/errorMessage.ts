export function formatErrorMessage(error: unknown, fallback = 'Something went wrong. Please retry.') {
  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : fallback

  if (
    rawMessage.includes('RESOURCE_EXHAUSTED') ||
    rawMessage.includes('Quota exceeded') ||
    rawMessage.includes('exceeded your current quota') ||
    rawMessage.includes('429')
  ) {
    return 'The AI service is rate limited right now. Please wait a moment and try again.'
  }

  if (rawMessage.includes('ANTHROPIC_API_KEY') || rawMessage.includes('GEMINI_API_KEY')) {
    return 'An AI API key is missing or invalid on the backend. Check the backend environment variables and restart the server.'
  }

  if (rawMessage.length > 220) {
    return `${rawMessage.slice(0, 220).trim()}...`
  }

  return rawMessage || fallback
}
