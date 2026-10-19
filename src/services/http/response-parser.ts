import type { HttpResponse } from '@/types/http'

const MAX_SAFE_BODY_LENGTH = 5 * 1024 * 1024 // 5 MB limit to avoid freezing the browser

export async function parseResponse(
  rawResponse: Response,
  durationMs: number
): Promise<HttpResponse> {
  const headersRecord: Record<string, string> = {}
  rawResponse.headers.forEach((value, key) => {
    headersRecord[key] = value
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
