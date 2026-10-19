import { describe, it, expect } from 'vitest'
import { encodeBase64Utf8, decodeBase64Utf8 } from '../base64'

describe('Base64 Utilities', () => {
  it('correctly encodes and decodes plain ASCII', () => {
    const text = 'Hello, DevForge!'
    const encoded = encodeBase64Utf8(text)
    expect(encoded.success).toBe(true)
    expect(encoded.result).toBe('SGVsbG8sIERldkZvcmdlIQ==')

    const decoded = decodeBase64Utf8(encoded.result)
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(text)
  })

  it('correctly handles Vietnamese accents and emoji (T-03)', () => {
    const text = 'Lập trình viên Việt Nam 🇻🇳 🚀 Công cụ DevForge'
    const encoded = encodeBase64Utf8(text)
    expect(encoded.success).toBe(true)

    const decoded = decodeBase64Utf8(encoded.result)
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(text)
  })

  it('returns descriptive error for malformed Base64 input (T-04)', () => {
    const malformed = 'NotAValidBase64@@@%%%'
    const decoded = decodeBase64Utf8(malformed)
    expect(decoded.success).toBe(false)
    expect(decoded.error).toBeDefined()
  })

  it('handles empty string properly', () => {
    expect(encodeBase64Utf8('').result).toBe('')
    expect(decodeBase64Utf8('').result).toBe('')
  })
})
