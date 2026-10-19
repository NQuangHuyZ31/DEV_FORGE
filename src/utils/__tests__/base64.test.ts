import { describe, it, expect } from 'vitest'
import {
  encodeBase64Utf8,
  decodeBase64Utf8,
  hexToBase64,
  base64ToHex,
  detectMimeTypeFromBytes,
  extractCleanBase64,
  applyLineWrap,
} from '../base64'

describe('Base64 Utilities Extended', () => {
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

  it('supports Base64URL variant (RFC 4648 §5) without padding', () => {
    // Subject string that produces '+' and '/' in standard Base64:
    // "subjects?_a" => "c3ViamVjdHM/X2E=" -> Base64URL should use '-' or '_'
    const text = 'subjects?_a'
    const standard = encodeBase64Utf8(text, { variant: 'standard' }).result
    expect(standard).toContain('/')

    const urlSafe = encodeBase64Utf8(text, { variant: 'base64url', padding: false })
    expect(urlSafe.result).not.toContain('+')
    expect(urlSafe.result).not.toContain('/')
    expect(urlSafe.result).not.toContain('=')
    expect(urlSafe.result).toContain('_')

    // Decode urlSafe back
    const decoded = decodeBase64Utf8(urlSafe.result)
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(text)
  })

  it('supports line wrapping (64 chars / 76 chars)', () => {
    const longText = 'a'.repeat(200)
    const encoded64 = encodeBase64Utf8(longText, { lineWrap: 64 })
    const lines = encoded64.result.split('\n')
    expect(lines[0].length).toBe(64)
    expect(lines.length).toBeGreaterThan(1)

    // Test applyLineWrap directly
    expect(applyLineWrap('1234567890', 5)).toBe('12345\n67890')

    // Decoding still works seamlessly even with line breaks
    const decoded = decodeBase64Utf8(encoded64.result)
    expect(decoded.success).toBe(true)
    expect(decoded.result).toBe(longText)
  })

  it('converts Hex string to Base64 and vice versa', () => {
    // "Hello" in hex is "48656c6c6f"
    const hex = '48656c6c6f'
    const b64 = hexToBase64(hex)
    expect(b64.success).toBe(true)
    expect(b64.result).toBe('SGVsbG8=')

    const backToHex = base64ToHex('SGVsbG8=')
    expect(backToHex.success).toBe(true)
    expect(backToHex.result).toBe('48656c6c6f')

    const spaceHex = base64ToHex('SGVsbG8=', true)
    expect(spaceHex.result).toBe('48 65 6c 6c 6f')
  })

  it('extracts Base64 payload from Data URL automatically', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const extracted = extractCleanBase64(dataUrl)
    expect(extracted.isDataUrl).toBe(true)
    expect(extracted.dataUrlMime).toBe('image/png')
    expect(extracted.clean.startsWith('iVBORw0KGgo')).toBe(true)
  })

  it('detects PNG magic bytes', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    expect(detectMimeTypeFromBytes(pngHeader)).toBe('image/png')
  })

  it('detects PDF magic bytes', () => {
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    expect(detectMimeTypeFromBytes(pdfHeader)).toBe('application/pdf')
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
