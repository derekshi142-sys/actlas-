import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

export function initializeOpenAI(apiKey: string) {
  openaiInstance = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Allow browser usage
  })
  return openaiInstance
}

export function getOpenAI(): OpenAI | null {
  return openaiInstance
}

export function hasOpenAI(): boolean {
  return openaiInstance !== null
}

// Store API key in localStorage
export function saveApiKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey)
    initializeOpenAI(apiKey)
  }
}

// Get API key from localStorage
export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key')
  }
  return null
}

// Remove API key
export function removeApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openai_api_key')
    openaiInstance = null
  }
}

// Initialize on load if key exists
export function initializeFromStorage() {
  const apiKey = getApiKey()
  if (apiKey) {
    initializeOpenAI(apiKey)
  }
}




