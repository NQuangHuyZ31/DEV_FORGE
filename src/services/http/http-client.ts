import type { HttpRequest, HttpResponse, HttpErrorInfo } from '@/types/http'
import { buildRequest } from './request-builder'
import { parseResponse } from './response-parser'
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
   * Execute an HTTP request
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

    let timeoutId: number | null = null
    const startTime = performance.now()

    try {
      // Set up client-side timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort()
          reject(new Error(`Request timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      })

      const fetchPromise = fetch(built.fullUrl, {
        method: req.method,
        headers: built.headers,
        body: built.body,
        signal: controller.signal,
      })

      const rawResponse = await Promise.race([fetchPromise, timeoutPromise])
      const durationMs = Math.round(performance.now() - startTime)

      if (timeoutId) clearTimeout(timeoutId)
      this.activeAbortController = null

      const response = await parseResponse(rawResponse, durationMs)

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
      if (timeoutId) clearTimeout(timeoutId)
      this.activeAbortController = null
      const durationMs = Math.round(performance.now() - startTime)

      return {
        success: false,
        error: mapHttpError(err, durationMs),
      }
    }
  }
}

export const defaultHttpClient = new HttpClient()
