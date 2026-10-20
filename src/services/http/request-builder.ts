import type { AuthConfig, BodyType, HttpMethod, HttpRequest, KeyValuePair } from '@/types/http'

export interface BuildRequestResult {
  fullUrl: string
  headers: Record<string, string>
  body?: string
  error?: string
}

export function validateUrl(rawUrl: string): { isValid: boolean; urlObj?: URL; error?: string } {
  if (!rawUrl || rawUrl.trim() === '') {
    return { isValid: false, error: 'URL cannot be empty' }
  }

  const trimmed = rawUrl.trim()

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: `Unsupported protocol "${parsed.protocol}". Only "http:" and "https:" are supported.`,
      }
    }
    return { isValid: true, urlObj: parsed }
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please provide a valid full URL including protocol (e.g. https://api.example.com)',
    }
  }
}

export function buildFullUrl(rawUrl: string, params: KeyValuePair[], auth?: AuthConfig): { fullUrl: string; error?: string } {
  const validation = validateUrl(rawUrl)
  if (!validation.isValid || !validation.urlObj) {
    return { fullUrl: '', error: validation.error }
  }

  const urlObj = new URL(validation.urlObj.toString())

  // Append enabled query parameters
  for (const p of params) {
    if (p.enabled && p.key.trim()) {
      urlObj.searchParams.append(p.key.trim(), p.value)
    }
  }

  // Handle API Key query param
  if (auth && auth.type === 'apikey' && auth.apiKeyLocation === 'query') {
    if (auth.apiKeyName?.trim() && auth.apiKeyValue) {
      urlObj.searchParams.set(auth.apiKeyName.trim(), auth.apiKeyValue)
    }
  }

  return { fullUrl: urlObj.toString() }
}

export function buildHeaders(
  headers: KeyValuePair[],
  auth?: AuthConfig,
  bodyType: BodyType = 'none',
  hasBody: boolean = bodyType !== 'none'
): Record<string, string> {
  const result: Record<string, string> = {}

  // User-defined headers
  for (const h of headers) {
    if (h.enabled && h.key.trim()) {
      result[h.key.trim()] = h.value
    }
  }

  // Auto Content-Type header ONLY if body is present and not explicitly set by user
  const hasContentType = Object.keys(result).some(
    (k) => k.toLowerCase() === 'content-type'
  )

  if (!hasContentType && hasBody) {
    if (bodyType === 'json') {
      result['Content-Type'] = 'application/json; charset=utf-8'
    } else if (bodyType === 'text') {
      result['Content-Type'] = 'text/plain; charset=utf-8'
    } else if (bodyType === 'urlencoded') {
      result['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
    }
  }

  // Authentication Headers
  if (auth) {
    if (auth.type === 'bearer' && auth.token?.trim()) {
      result['Authorization'] = `Bearer ${auth.token.trim()}`
    } else if (
      auth.type === 'apikey' &&
      auth.apiKeyLocation === 'header' &&
      auth.apiKeyName?.trim() &&
      auth.apiKeyValue
    ) {
      result[auth.apiKeyName.trim()] = auth.apiKeyValue
    }
  }

  return result
}

export function prepareBody(
  bodyType: BodyType,
  bodyContent: string,
  method: HttpMethod
): { body?: string; error?: string } {
  if (method === 'GET') {
    if (bodyType !== 'none' && bodyContent.trim() !== '') {
      return { error: 'HTTP GET requests should not include a body payload.' }
    }
    return { body: undefined }
  }

  if (bodyType === 'none' || !bodyContent || bodyContent.trim() === '') {
    return { body: undefined }
  }

  if (bodyType === 'json') {
    try {
      // Validate JSON syntax before sending
      JSON.parse(bodyContent)
      return { body: bodyContent }
    } catch (err: unknown) {
      return {
        error: `JSON body syntax error: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  return { body: bodyContent }
}

export function buildRequest(req: HttpRequest): BuildRequestResult {
  const urlRes = buildFullUrl(req.url, req.params, req.auth)
  if (urlRes.error) {
    return { fullUrl: '', headers: {}, error: urlRes.error }
  }

  const bodyRes = prepareBody(req.bodyType, req.bodyContent, req.method)
  if (bodyRes.error) {
    return { fullUrl: urlRes.fullUrl, headers: {}, error: bodyRes.error }
  }

  const hasBody = Boolean(bodyRes.body && req.method !== 'GET')
  const headers = buildHeaders(req.headers, req.auth, req.bodyType, hasBody)

  return {
    fullUrl: urlRes.fullUrl,
    headers,
    body: bodyRes.body,
  }
}
