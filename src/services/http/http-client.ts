import axios, { type AxiosRequestConfig, type AxiosResponse, isAxiosError } from 'axios'
import type { HttpRequest, HttpResponse, HttpErrorInfo } from '@/types/http'
import { buildRequest } from './request-builder'
import { parseAxiosResponse } from './response-parser'
import { mapHttpError } from './error-mapper'

export interface ExecuteResult {
  success: boolean
  response?: HttpResponse
  error?: HttpErrorInfo
}

export class HttpClient {
  private activeAbortController: AbortController | null = null

  /**
   * Cancel ongoing request if any
   */
  public cancel(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort()
      this.activeAbortController = null
    }
  }

  /**
   * Check if request is currently pending
   */
  public isPending(): boolean {
    return this.activeAbortController !== null
  }

  /**
   * Execute an HTTP request via Axios
   */
  public async execute(req: HttpRequest): Promise<ExecuteResult> {
    // 1. Build and validate request before dispatch
    const built = buildRequest(req)
    if (built.error) {
      return {
        success: false,
        error: {
          group: 'invalid-url',
          title: 'Invalid Request Configuration',
          message: built.error,
        },
      }
    }

    // Abort previous in-flight request if present
    this.cancel()

    const controller = new AbortController()
    this.activeAbortController = controller
    const timeoutMs = req.timeoutMs || 30000

    const startTime = performance.now()

    try {
      const axiosConfig: AxiosRequestConfig = {
        url: built.fullUrl,
        method: req.method,
        headers: built.headers,
        data: built.body,
        signal: controller.signal,
        timeout: timeoutMs,
        // Accept all HTTP status codes so client-side 4xx and 5xx responses are fully viewable
        validateStatus: () => true,
        // Preserve raw text body to prevent precision loss or unwanted mutations
        responseType: 'text',
        transformResponse: [(data) => data],
      }

      const axiosResponse: AxiosResponse = await axios.request(axiosConfig)
      const durationMs = Math.round(performance.now() - startTime)

      this.activeAbortController = null

      const response = parseAxiosResponse(axiosResponse, durationMs)

      if (!response.ok) {
        return {
          success: false,
          response,
          error: mapHttpError(null, durationMs, response),
        }
      }

      return {
        success: true,
        response,
      }
    } catch (err: unknown) {
      this.activeAbortController = null
      const durationMs = Math.round(performance.now() - startTime)

      if (isAxiosError(err) && err.response) {
        const response = parseAxiosResponse(err.response, durationMs)
        return {
          success: false,
          response,
          error: mapHttpError(err, durationMs, response),
        }
      }

      return {
        success: false,
        error: mapHttpError(err, durationMs),
      }
    }
  }
}

export const defaultHttpClient = new HttpClient()
