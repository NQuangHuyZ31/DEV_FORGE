export interface UuidOptions {
  uppercase?: boolean
  hyphens?: boolean
}

/**
 * Generate a cryptographically secure UUID v4
 * Uses crypto.randomUUID() when available, with fallback to crypto.getRandomValues()
 */
export function generateUuidV4(options: UuidOptions = {}): string {
  const { uppercase = false, hyphens = true } = options
  let uuid: string

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    uuid = crypto.randomUUID()
  } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)

    // Per RFC 4122 section 4.4
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10xx

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
  } else {
    throw new Error('Cryptographically secure RNG is not supported in this environment.')
  }

  if (!hyphens) {
    uuid = uuid.replace(/-/g, '')
  }

  if (uppercase) {
    uuid = uuid.toUpperCase()
  }

  return uuid
}

/**
 * Generate multiple UUIDs (bounded between 1 and 100)
 */
export function generateUuids(count: number, options: UuidOptions = {}): string[] {
  const safeCount = Math.max(1, Math.min(100, Math.floor(count)))
  const results: string[] = []
  for (let i = 0; i < safeCount; i++) {
    results.push(generateUuidV4(options))
  }
  return results
}
