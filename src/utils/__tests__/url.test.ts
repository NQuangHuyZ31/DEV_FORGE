import { describe, it, expect } from 'vitest'
import { encodeUrl, decodeUrl } from '../url'

describe('URL Utilities', () => {
  it('encodes component preserving Unicode (T-07)', () => {
    const text = 'hà nội & sài gòn 🇻🇳'
    const encoded = encodeUrl(text, 'component')
    expect(encoded.success).toBe(true)
    expect(encoded.result).toContain('%26')

    const decoded = decodeUrl(encoded.result, 'component')
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(text)
  })

  it('encodes full URL preserving URL delimiters (:/?=)', () => {
    const rawUrl = 'https://devforge.dev/search?q=công cụ'
    const encoded = encodeUrl(rawUrl, 'full')
    expect(encoded.success).toBe(true)
    expect(encoded.result.startsWith('https://devforge.dev/search?q=')).toBe(true)

    const decoded = decodeUrl(encoded.result, 'full')
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(rawUrl)
  })

  it('returns clean error for malformed percent-encoding', () => {
    const malformed = 'https://devforge.dev?test=%E0%A4%A'
    const result = decodeUrl(malformed, 'component')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
