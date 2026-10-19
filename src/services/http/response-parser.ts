import type { AxiosResponse } from 'axios'
import type { HttpResponse } from '@/types/http'

const MAX_SAFE_BODY_LENGTH = 5 * 1024 * 1024 // 5 MB limit to avoid freezing the browser

/**
 * Parses an AxiosResponse into the normalized DevForge HttpResponse object.
 */
export function parseAxiosResponse(
  axiosRes: AxiosResponse,
  durationMs: number
): HttpResponse {
  const headersRecord: Record<string, string> = {}

  if (axiosRes.headers) {
    if (typeof axiosRes.headers.toJSON === 'function') {
      const json = axiosRes.headers.toJSON()
      for (const [k, v] of Object.entries(json)) {
        if (v !== undefined && v !== null) {
          headersRecord[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v)
        }
      }
    } else {
      for (const [k, v] of Object.entries(axiosRes.headers)) {
        if (v !== undefined && v !== null) {
          headersRecord[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v)
        }
      }
    }
  }

  const contentType = headersRecord['content-type'] || 'unknown'
  let bodyText = ''
  let parsedJson: unknown = undefined
  let isJson = false

  if (typeof axiosRes.data === 'string') {
    bodyText = axiosRes.data
  } else if (axiosRes.data !== undefined && axiosRes.data !== null) {
    try {
      bodyText = JSON.stringify(axiosRes.data, null, 2)
      parsedJson = axiosRes.data
      isJson = true
    } catch {
      bodyText = String(axiosRes.data)
    }
  }

  // Size calculation & safety truncate
  let sizeBytes = 0
  try {
    sizeBytes = new Blob([bodyText]).size
    if (sizeBytes > MAX_SAFE_BODY_LENGTH) {
      bodyText =
        bodyText.slice(0, MAX_SAFE_BODY_LENGTH) +
        '\n\n[DevForge Warning: Response exceeded 5MB and was truncated to prevent browser memory freezing]'
    }
  } catch {
    sizeBytes = bodyText.length
  }

  // If not already identified as JSON, try parsing if text looks like JSON
  if (!isJson && (bodyText.trim().startsWith('{') || bodyText.trim().startsWith('['))) {
    try {
      parsedJson = JSON.parse(bodyText)
      isJson = true
    } catch {
      isJson = false
    }
  }

  const isOk = axiosRes.status >= 200 && axiosRes.status < 300

  return {
    status: axiosRes.status,
    statusText: axiosRes.statusText || (isOk ? 'OK' : 'Error'),
    ok: isOk,
    headers: headersRecord,
    body: bodyText,
    parsedJson,
    isJson,
    durationMs,
    contentType,
    sizeBytes,
    timestamp: Date.now(),
  }
}

/**
 * Fallback parser for standard Fetch API Response
 */
export async function parseResponse(
  rawResponse: Response,
  durationMs: number
): Promise<HttpResponse> {
  const headersRecord: Record<string, string> = {}
  rawResponse.headers.forEach((value, key) => {
    headersRecord[key.toLowerCase()] = value
  })

  const contentType = rawResponse.headers.get('content-type') || 'unknown'
  let bodyText = ''
  let sizeBytes = 0

  try {
    bodyText = await rawResponse.text()
    sizeBytes = new Blob([bodyText]).size

    if (sizeBytes > MAX_SAFE_BODY_LENGTH) {
      bodyText =
        bodyText.slice(0, MAX_SAFE_BODY_LENGTH) +
        '\n\n[DevForge Warning: Response exceeded 5MB and was truncated to prevent browser memory freezing]'
    }
  } catch (err: unknown) {
    bodyText = `[Unable to read response body: ${err instanceof Error ? err.message : String(err)}]`
  }

  let parsedJson: unknown = undefined
  let isJson = false

  if (bodyText.trim().startsWith('{') || bodyText.trim().startsWith('[')) {
    try {
      parsedJson = JSON.parse(bodyText)
      isJson = true
    } catch {
      isJson = false
    }
  }

  return {
    status: rawResponse.status,
    statusText: rawResponse.statusText || (rawResponse.ok ? 'OK' : 'Error'),
    ok: rawResponse.ok,
    headers: headersRecord,
    body: bodyText,
    parsedJson,
    isJson,
    durationMs,
    contentType,
    sizeBytes,
    timestamp: Date.now(),
  }
}
