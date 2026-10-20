import { isAxiosError, isCancel } from 'axios'
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

  // Cancellation & Abort checks (DOMException AbortError or Axios CanceledError)
  if (
    (err instanceof DOMException && err.name === 'AbortError') ||
    isCancel(err) ||
    (isAxiosError(err) && (err.code === 'ERR_CANCELED' || err.name === 'CanceledError'))
  ) {
    return {
      group: 'abort',
      title: 'Request Cancelled',
      message: 'The HTTP request was aborted by the user.',
    }
  }

  const errMsg = err instanceof Error ? err.message : String(err)
  const isTimeout =
    (isAxiosError(err) && err.code === 'ECONNABORTED') ||
    errMsg.toLowerCase().includes('timeout') ||
    errMsg.toLowerCase().includes('timed out')

  // Timeout error check
  if (isTimeout) {
    return {
      group: 'timeout',
      title: 'Request Timeout',
      message: `The request exceeded the allowed timeout limit (${Math.round(durationMs / 1000)}s).`,
      hint: 'The server may be overloaded or unreachable. You can try extending the timeout or checking your network.',
    }
  }

  // Network / CORS check
  if (
    (isAxiosError(err) && err.code === 'ERR_NETWORK') ||
    errMsg.includes('Network Error') ||
    errMsg.includes('Failed to fetch') ||
    errMsg.includes('NetworkError') ||
    errMsg.includes('Load failed') ||
    errMsg.includes('Cross-Origin')
  ) {
    return {
      group: 'cors',
      title: 'Network / CORS Error',
      message:
        'Trình duyệt đã chặn request do chính sách CORS hoặc kết nối bị từ chối. Dù bên kia là API công khai (public), trình duyệt vẫn bắt buộc server đích phải phản hồi header "Access-Control-Allow-Origin: *" và cho phép preflight OPTIONS.',
      hint: 'Bạn có thể bật tính năng "CORS Proxy" (Bypass CORS) hoặc bấm "Thử lại bằng CORS Proxy" để vượt qua rào cản CORS của trình duyệt.',
    }
  }

  return {
    group: 'unknown',
    title: 'Request Error',
    message: errMsg || 'An unknown network error occurred.',
  }
}
