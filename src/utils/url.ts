export type UrlEncodeMode = 'component' | 'full'

export interface UrlResult {
  success: boolean
  result: string
  error?: string
}

/**
 * Encode string as URL
 * - 'component': encodeURIComponent (for query parameter values, path segments)
 * - 'full': encodeURI (for complete URLs, keeps :/?#[]@!$&'()*+,;=)
 */
export function encodeUrl(input: string, mode: UrlEncodeMode = 'component'): UrlResult {
  if (input === '') {
    return { success: true, result: '' }
  }

  try {
    const encoded = mode === 'component' ? encodeURIComponent(input) : encodeURI(input)
    return { success: true, result: encoded }
  } catch (err: unknown) {
    return {
      success: false,
      result: '',
      error: err instanceof Error ? err.message : 'Failed to encode URL',
    }
  }
}

/**
 * Decode percent-encoded URL string
 * - 'component': decodeURIComponent
 * - 'full': decodeURI
 */
export function decodeUrl(input: string, mode: UrlEncodeMode = 'component'): UrlResult {
  if (input === '') {
    return { success: true, result: '' }
  }

  try {
    const decoded = mode === 'component' ? decodeURIComponent(input) : decodeURI(input)
    return { success: true, result: decoded }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      result: '',
      error: errorMsg.includes('URI malformed')
        ? 'Invalid URL encoding: contains malformed percent-encoded sequences (e.g., incomplete % sequence)'
        : errorMsg,
    }
  }
}
