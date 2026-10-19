export type Base64Variant = 'standard' | 'base64url'
export type Base64LineWrap = 0 | 64 | 76

export interface Base64EncodeOptions {
  variant?: Base64Variant
  padding?: boolean
  lineWrap?: Base64LineWrap
}

export interface Base64DecodeOptions {
  variant?: 'auto' | Base64Variant
}

export interface Base64Result {
  success: boolean
  result: string
  error?: string
  detectedMimeType?: string
  isDataUrl?: boolean
}

/**
 * Clean whitespace and optional Data URL prefixes (e.g. data:image/png;base64,...)
 */
export function extractCleanBase64(input: string): { clean: string; dataUrlMime?: string; isDataUrl: boolean } {
  let text = input.trim()
  let dataUrlMime: string | undefined
  let isDataUrl = false

  const dataUrlMatch = text.match(/^data:([^;]+);base64,(.*)$/s)
  if (dataUrlMatch) {
    dataUrlMime = dataUrlMatch[1]
    text = dataUrlMatch[2]
    isDataUrl = true
  }

  // Remove any whitespace, newlines, or line breaks (common in MIME/PEM)
  const clean = text.replace(/[\r\n\s]/g, '')
  return { clean, dataUrlMime, isDataUrl }
}

/**
 * Apply line wrapping (0, 64, or 76 chars)
 */
export function applyLineWrap(str: string, wrap: number): string {
  if (wrap <= 0 || str.length <= wrap) return str
  const chunks: string[] = []
  for (let i = 0; i < str.length; i += wrap) {
    chunks.push(str.slice(i, i + wrap))
  }
  return chunks.join('\n')
}

/**
 * Safely encode a UTF-8 string to Base64 (Standard or Base64URL)
 */
export function encodeBase64Utf8(input: string, options: Base64EncodeOptions = {}): Base64Result {
  if (input === '') {
    return { success: true, result: '' }
  }

  const { variant = 'standard', padding = true, lineWrap = 0 } = options

  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)
    let binary = ''
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    let encoded = btoa(binary)

    if (variant === 'base64url') {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_')
      if (!padding) {
        encoded = encoded.replace(/=+$/, '')
      }
    } else {
      if (!padding) {
        encoded = encoded.replace(/=+$/, '')
      }
    }

    encoded = applyLineWrap(encoded, lineWrap)
    return { success: true, result: encoded }
  } catch (err: unknown) {
    return {
      success: false,
      result: '',
      error: err instanceof Error ? err.message : 'Failed to encode text to Base64',
    }
  }
}

/**
 * Safely decode a Base64 string to UTF-8 text (handles Standard, Base64URL, and Data URLs)
 */
export function decodeBase64Utf8(input: string, options: Base64DecodeOptions = {}): Base64Result {
  if (input === '') {
    return { success: true, result: '' }
  }

  const { variant = 'auto' } = options
  const { clean, dataUrlMime, isDataUrl } = extractCleanBase64(input)

  if (clean === '') {
    return { success: true, result: '', isDataUrl, detectedMimeType: dataUrlMime }
  }

  // Convert Base64URL characters to Standard Base64 if needed
  let normalized = clean
  if (variant === 'base64url' || (variant === 'auto' && (normalized.includes('-') || normalized.includes('_')))) {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/')
  }

  // Auto-restore missing padding
  const mod = normalized.length % 4
  if (mod === 2) {
    normalized += '=='
  } else if (mod === 3) {
    normalized += '='
  } else if (mod === 1) {
    return {
      success: false,
      result: '',
      error: 'Invalid Base64 format: illegal length (remainder 1)',
    }
  }

  // Validate allowed characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/
  if (!base64Regex.test(normalized)) {
    return {
      success: false,
      result: '',
      error: 'Invalid Base64 format: contains unsupported characters',
    }
  }

  try {
    const binary = atob(normalized)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const detectedMime = dataUrlMime || detectMimeTypeFromBytes(bytes)

    const decoder = new TextDecoder('utf-8', { fatal: true })
    const decoded = decoder.decode(bytes)

    return {
      success: true,
      result: decoded,
      detectedMimeType: detectedMime,
      isDataUrl,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('URI malformed') || errorMsg.includes('decode') || errorMsg.includes('utf-8')) {
      return {
        success: false,
        result: '',
        error: 'Failed to decode: Content is binary data or not valid UTF-8 text',
      }
    }
    return {
      success: false,
      result: '',
      error: `Invalid Base64 sequence: ${errorMsg}`,
    }
  }
}

/**
 * Convert Hex String to Base64
 */
export function hexToBase64(hexInput: string, options: Base64EncodeOptions = {}): Base64Result {
  const cleanHex = hexInput.replace(/[^0-9A-Fa-f]/g, '')
  if (cleanHex === '') {
    return { success: true, result: '' }
  }

  if (cleanHex.length % 2 !== 0) {
    return {
      success: false,
      result: '',
      error: 'Invalid Hex format: hex string must contain an even number of characters',
    }
  }

  try {
    const byteCount = cleanHex.length / 2
    let binary = ''
    for (let i = 0; i < byteCount; i++) {
      const byte = parseInt(cleanHex.substr(i * 2, 2), 16)
      binary += String.fromCharCode(byte)
    }

    let encoded = btoa(binary)
    const { variant = 'standard', padding = true, lineWrap = 0 } = options

    if (variant === 'base64url') {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_')
      if (!padding) {
        encoded = encoded.replace(/=+$/, '')
      }
    } else if (!padding) {
      encoded = encoded.replace(/=+$/, '')
    }

    encoded = applyLineWrap(encoded, lineWrap)
    return { success: true, result: encoded }
  } catch (err: unknown) {
    return {
      success: false,
      result: '',
      error: err instanceof Error ? err.message : 'Failed to convert Hex to Base64',
    }
  }
}

/**
 * Convert Base64 to Hex String
 */
export function base64ToHex(base64Input: string, spaceDelimited = false): Base64Result {
  const { clean } = extractCleanBase64(base64Input)
  if (clean === '') {
    return { success: true, result: '' }
  }

  let normalized = clean.replace(/-/g, '+').replace(/_/g, '/')
  const mod = normalized.length % 4
  if (mod === 2) normalized += '=='
  else if (mod === 3) normalized += '='

  try {
    const binary = atob(normalized)
    const hexArr: string[] = []
    for (let i = 0; i < binary.length; i++) {
      const hex = binary.charCodeAt(i).toString(16).padStart(2, '0')
      hexArr.push(hex)
    }
    const result = spaceDelimited ? hexArr.join(' ') : hexArr.join('')
    return { success: true, result }
  } catch (err: unknown) {
    return {
      success: false,
      result: '',
      error: err instanceof Error ? err.message : 'Failed to convert Base64 to Hex',
    }
  }
}

/**
 * Detect file MIME type from raw magic bytes
 */
export function detectMimeTypeFromBytes(bytes: Uint8Array): string | undefined {
  if (bytes.length < 4) return undefined

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  // GIF: GIF87a or GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif'
  }
  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  // PDF: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf'
  }
  // SVG text check
  try {
    const prefix = new TextDecoder('utf-8')
      .decode(bytes.slice(0, Math.min(bytes.length, 128)))
      .trim()
      .toLowerCase()
    if (prefix.includes('<svg') || prefix.includes('<?xml')) {
      return 'image/svg+xml'
    }
  } catch {
    // not text
  }

  return undefined
}
