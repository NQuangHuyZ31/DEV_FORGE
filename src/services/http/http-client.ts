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
   * Execute an HTTP request via Axios with optional CORS Proxy
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

    // 2. Handle Proxy Mode (Bypass CORS)
    if (req.useProxy) {
      // Step A: Attempt local dev server proxy (/api/proxy)
      try {
        const proxyRes = await axios.post(
          '/api/proxy',
          {
            url: built.fullUrl,
            method: req.method,
            headers: built.headers,
            data: built.body,
            timeoutMs,
          },
          {
            signal: controller.signal,
            timeout: timeoutMs + 2000,
            validateStatus: () => true,
          }
        )

        if (proxyRes.data && !proxyRes.data.proxyError) {
          const durationMs = proxyRes.data.durationMs || Math.round(performance.now() - startTime)
          this.activeAbortController = null

          const response = parseAxiosResponse(
            {
              status: proxyRes.data.status,
              statusText: proxyRes.data.statusText || 'OK',
              headers: proxyRes.data.headers,
              data: proxyRes.data.data,
              config: {} as any,
            },
            durationMs
          )

          response.isProxied = true

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
        }
      } catch (proxyErr: unknown) {
        if (controller.signal.aborted) {
          this.activeAbortController = null
          return {
            success: false,
            error: mapHttpError(proxyErr, Math.round(performance.now() - startTime)),
          }
        }
        // If local dev proxy is not responding or in production build, fallback to public CORS proxy
      }

      // Step B: Public CORS proxy fallback
      try {
        const publicProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(built.fullUrl)}`
        const publicRes = await axios.request({
          url: publicProxyUrl,
          method: req.method,
          headers: built.headers,
          data: built.body,
          signal: controller.signal,
          timeout: timeoutMs,
          validateStatus: () => true,
          responseType: 'text',
          transformResponse: [(d) => d],
        })

        const durationMs = Math.round(performance.now() - startTime)
        this.activeAbortController = null

        const response = parseAxiosResponse(publicRes, durationMs)
        response.isProxied = true

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
      } catch (fallbackErr: unknown) {
        this.activeAbortController = null
        const durationMs = Math.round(performance.now() - startTime)
        return {
          success: false,
          error: mapHttpError(fallbackErr, durationMs),
        }
      }
    }

    // 3. Direct Browser Dispatch via Axios
    try {
      const axiosConfig: AxiosRequestConfig = {
        url: built.fullUrl,
        method: req.method,
        headers: built.headers,
        data: built.body,
        signal: controller.signal,
        timeout: timeoutMs,
        validateStatus: () => true,
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
