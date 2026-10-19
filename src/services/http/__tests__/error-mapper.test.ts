import { describe, it, expect } from 'vitest'
import { mapHttpError } from '../error-mapper'
import type { HttpResponse } from '@/types/http'

describe('HTTP Error Mapper', () => {
  it('maps HTTP 429 to rate limit error (API-17)', () => {
    const mockResponse: HttpResponse = {
      status: 429,
      statusText: 'Too Many Requests',
      ok: false,
      headers: {},
      body: 'Rate limit exceeded',
      isJson: false,
      durationMs: 50,
      contentType: 'text/plain',
      sizeBytes: 19,
      timestamp: Date.now(),
    }
    const err = mapHttpError(null, 50, mockResponse)
    expect(err.group).toBe('http-error')
    expect(err.status).toBe(429)
    expect(err.title).toContain('429 Too Many Requests')
  })

  it('maps HTTP 400 client error (API-04)', () => {
    const mockResponse: HttpResponse = {
      status: 400,
      statusText: 'Bad Request',
      ok: false,
      headers: {},
      body: '{"error": "Missing parameter"}',
      isJson: true,
      durationMs: 80,
      contentType: 'application/json',
      sizeBytes: 30,
      timestamp: Date.now(),
    }
    const err = mapHttpError(null, 80, mockResponse)
    expect(err.group).toBe('http-error')
    expect(err.status).toBe(400)
    expect(err.title).toContain('400 Client Error')
  })

  it('maps AbortError to cancelled state (API-14)', () => {
    const abortErr = new DOMException('The user aborted a request.', 'AbortError')
    const err = mapHttpError(abortErr)
    expect(err.group).toBe('abort')
    expect(err.title).toBe('Request Cancelled')
  })

  it('maps browser "Failed to fetch" to CORS / Network error (API-08)', () => {
    const typeErr = new TypeError('Failed to fetch')
    const err = mapHttpError(typeErr)
    expect(err.group).toBe('cors')
    expect(err.title).toContain('CORS')
    expect(err.hint).toBeDefined()
  })

  it('maps timeout error properly (API-07)', () => {
    const timeoutErr = new Error('Request timed out after 30000ms')
    const err = mapHttpError(timeoutErr, 30000)
    expect(err.group).toBe('timeout')
    expect(err.title).toBe('Request Timeout')
  })
})
