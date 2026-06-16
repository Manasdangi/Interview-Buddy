export function formatErrorMessage(error: unknown, fallback = 'Something went wrong. Please retry.') {
  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : fallback

  if (
    rawMessage.includes('RESOURCE_EXHAUSTED') ||
    rawMessage.includes('Quota exceeded') ||
    rawMessage.includes('exceeded your current quota') ||
    rawMessage.includes('429')
  ) {
    return 'Gemini quota is exhausted for this API key. Please wait for the quota reset or switch/upgrade the AI provider, then try again.'
  }

  if (rawMessage.includes('GEMINI_API_KEY')) {
    return 'Gemini API key is missing. Add it to the backend environment variables and restart the server.'
  }

  if (rawMessage.length > 220) {
    return `${rawMessage.slice(0, 220).trim()}...`
  }

  return rawMessage || fallback
}
