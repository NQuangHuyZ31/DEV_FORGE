export interface Base64Result {
  success: boolean
  result: string
  error?: string
}

/**
 * Safely encode a UTF-8 string (including Vietnamese, emoji, CJK) to Base64
 */
export function encodeBase64Utf8(input: string): Base64Result {
  if (input === '') {
    return { success: true, result: '' }
  }

  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)
    let binary = ''
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const encoded = btoa(binary)
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
 * Safely decode a Base64 string to UTF-8 text (including Vietnamese, emoji, CJK)
 */
export function decodeBase64Utf8(input: string): Base64Result {
  if (input === '') {
    return { success: true, result: '' }
  }

  const cleanInput = input.trim()

  // Validate base64 structure: only allowed characters and valid padding
  const base64Regex = /^[A-Za-z0-9+/=]+$/
  if (!base64Regex.test(cleanInput)) {
    return {
      success: false,
      result: '',
      error: 'Invalid Base64 format: contains unsupported characters',
    }
  }

  // Base64 string length without whitespace should be divisible by 4 if padded
  if (cleanInput.length % 4 !== 0) {
    return {
      success: false,
      result: '',
      error: 'Invalid Base64 format: invalid length or missing padding (=)',
    }
  }

  try {
    const binary = atob(cleanInput)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8', { fatal: true })
    const decoded = decoder.decode(bytes)
    return { success: true, result: decoded }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('URI malformed') || errorMsg.includes('decode') || errorMsg.includes('utf-8')) {
      return {
        success: false,
        result: '',
        error: 'Failed to decode: Data is not valid UTF-8 text',
      }
    }
    return {
      success: false,
      result: '',
      error: `Invalid Base64 sequence: ${errorMsg}`,
    }
  }
}
