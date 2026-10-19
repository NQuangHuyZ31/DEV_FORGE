import type { HttpErrorInfo, HttpResponse } from '@/types/http'

export function mapHttpError(
  err: unknown,
  durationMs: number = 0,
  rawResponse?: HttpResponse
): HttpErrorInfo {
  if (rawResponse) {
    const status = rawResponse.status
    if (status === 429) {
      return {
        group: 'http-error',
        status: 429,
        title: '429 Too Many Requests',
        message: 'The remote server has rate-limited your requests.',
        hint: 'Please wait before sending another request or verify your API key usage limits.',
        rawResponse,
      }
    }
    if (status >= 400 && status < 500) {
      return {
        group: 'http-error',
        status,
        title: `${status} Client Error`,
        message: rawResponse.statusText || 'The server rejected the client request.',
        hint: 'Check your request parameters, headers, or authentication tokens.',
        rawResponse,
      }
    }
    if (status >= 500) {
      return {
        group: 'http-error',
        status,
        title: `${status} Server Error`,
        message: rawResponse.statusText || 'The remote server encountered an internal error.',
        hint: 'The target server failed to process the request. Try again later.',
        rawResponse,
      }
    }
  }

  if (err instanceof DOMException && err.name === 'AbortError') {
    return {
      group: 'abort',
      title: 'Request Cancelled',
      message: 'The HTTP request was aborted by the user.',
    }
  }

  const errMsg = err instanceof Error ? err.message : String(err)

  // Timeout error check
  if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('timed out')) {
    return {
      group: 'timeout',
      title: 'Request Timeout',
      message: `The request exceeded the allowed timeout limit (${Math.round(durationMs / 1000)}s).`,
      hint: 'The server may be overloaded or unreachable. You can try extending the timeout or checking your network.',
    }
  }

  // Network / CORS check
  // In modern browsers, Fetch throws a generic TypeError: Failed to fetch on CORS block or offline
  if (
    errMsg.includes('Failed to fetch') ||
    errMsg.includes('NetworkError') ||
    errMsg.includes('Load failed') ||
    errMsg.includes('Cross-Origin')
  ) {
    return {
      group: 'cors',
      title: 'Network / CORS Error',
      message:
        'The browser could not complete the request. This usually happens when the target API does not allow Cross-Origin Resource Sharing (CORS) from browser clients, or the server is offline.',
      hint: 'Web browsers enforce strict CORS security. To test in browser, the server must return the "Access-Control-Allow-Origin: *" header, or you can test against CORS-enabled public APIs (such as JSONPlaceholder).',
    }
  }

  return {
    group: 'unknown',
    title: 'Request Error',
    message: errMsg || 'An unknown network error occurred.',
  }
}
