import { describe, it, expect } from 'vitest'
import {
  validateUrl,
  buildFullUrl,
  buildHeaders,
  prepareBody,
  buildRequest,
} from '../request-builder'
import type { HttpRequest } from '@/types/http'

describe('HTTP Request Builder', () => {
  it('validates HTTP and HTTPS URLs strictly', () => {
    expect(validateUrl('https://api.example.com').isValid).toBe(true)
    expect(validateUrl('http://localhost:3000').isValid).toBe(true)
    expect(validateUrl('ftp://example.com').isValid).toBe(false)
    expect(validateUrl('invalid-url').isValid).toBe(false)
    expect(validateUrl('').isValid).toBe(false)
  })

  it('correctly appends query parameters to URL', () => {
    const res = buildFullUrl('https://api.example.com/items', [
      { id: '1', key: 'limit', value: '10', enabled: true },
      { id: '2', key: 'disabled', value: 'true', enabled: false },
      { id: '3', key: 'sort', value: 'desc', enabled: true },
    ])
    expect(res.fullUrl).toBe('https://api.example.com/items?limit=10&sort=desc')
    expect(res.error).toBeUndefined()
  })

  it('adds API Key to query parameters if configured as query', () => {
    const res = buildFullUrl(
      'https://api.example.com/data',
      [],
      {
        type: 'apikey',
        apiKeyName: 'api_key',
        apiKeyValue: 'secret123',
        apiKeyLocation: 'query',
      }
    )
    expect(res.fullUrl).toBe('https://api.example.com/data?api_key=secret123')
  })

  it('builds headers with Bearer Token and auto Content-Type', () => {
    const headers = buildHeaders(
      [{ id: '1', key: 'Custom-Header', value: 'DevForge', enabled: true }],
      { type: 'bearer', token: 'jwt_token_xyz' },
      'json'
    )
    expect(headers['Custom-Header']).toBe('DevForge')
    expect(headers['Authorization']).toBe('Bearer jwt_token_xyz')
    expect(headers['Content-Type']).toContain('application/json')
  })

  it('rejects malformed JSON body before sending (API-03)', () => {
    const res = prepareBody('json', '{ broken json', 'POST')
    expect(res.error).toBeDefined()
    expect(res.error).toContain('JSON body syntax error')
  })

  it('warns when GET request includes body payload', () => {
    const res = prepareBody('json', '{"test": 1}', 'GET')
    expect(res.error).toBeDefined()
    expect(res.error).toContain('HTTP GET requests should not include a body')
  })

  it('builds a full valid request object seamlessly', () => {
    const req: HttpRequest = {
      url: 'https://api.example.com/posts',
      method: 'POST',
      params: [{ id: '1', key: 'tag', value: 'news', enabled: true }],
      headers: [{ id: '1', key: 'X-App', value: 'DevForge', enabled: true }],
      bodyType: 'json',
      bodyContent: '{"title":"Hello"}',
      auth: { type: 'bearer', token: 'token123' },
    }
    const built = buildRequest(req)
    expect(built.error).toBeUndefined()
    expect(built.fullUrl).toBe('https://api.example.com/posts?tag=news')
    expect(built.headers['Authorization']).toBe('Bearer token123')
    expect(built.headers['X-App']).toBe('DevForge')
    expect(built.body).toBe('{"title":"Hello"}')
  })
})
