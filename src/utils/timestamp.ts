export type TimestampUnit = 's' | 'ms' | 'auto'

export interface TimestampConvertResult {
  isValid: boolean
  date?: Date
  seconds?: number
  milliseconds?: number
  utcIso?: string
  utcString?: string
  localString?: string
  unitDetected?: 's' | 'ms'
  relative?: string
  error?: string
}

export function getCurrentTimezoneInfo(): {
  timezone: string
  offsetMinutes: number
  offsetString: string
} {
  const now = new Date()
  const offsetMinutes = -now.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absMinutes / 60)
  const mins = absMinutes % 60
  const offsetString = `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`

  let timezone = 'Local Time'
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
  } catch {
    // fallback
  }

  return {
    timezone,
    offsetMinutes,
    offsetString,
  }
}

export function getRelativeTimeString(date: Date): string {
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSeconds = Math.round(diffMs / 1000)

  try {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(diffSeconds, 'second')
    }
    const diffMinutes = Math.round(diffSeconds / 60)
    if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute')
    }
    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour')
    }
    const diffDays = Math.round(diffHours / 24)
    if (Math.abs(diffDays) < 30) {
      return rtf.format(diffDays, 'day')
    }
    const diffMonths = Math.round(diffDays / 30)
    if (Math.abs(diffMonths) < 12) {
      return rtf.format(diffMonths, 'month')
    }
    const diffYears = Math.round(diffDays / 365)
    return rtf.format(diffYears, 'year')
  } catch {
    return date.toISOString()
  }
}

/**
 * Convert timestamp string or number to structured date outputs
 */
export function convertTimestampToDate(
  input: string | number,
  unit: TimestampUnit = 'auto'
): TimestampConvertResult {
  if (input === '' || input === null || input === undefined) {
    return { isValid: false, error: 'Timestamp is required' }
  }

  const clean = typeof input === 'string' ? input.trim() : String(input)
  if (!/^-?\d+(\.\d+)?$/.test(clean)) {
    return { isValid: false, error: 'Invalid numeric timestamp format' }
  }

  const rawNum = parseFloat(clean)
  if (isNaN(rawNum)) {
    return { isValid: false, error: 'Failed to parse timestamp number' }
  }

  let finalMs: number
  let detectedUnit: 's' | 'ms'

  if (unit === 'auto') {
    // Rule of thumb: If timestamp is greater than 30000000000 (after year 2920 in seconds),
    // it's almost certainly milliseconds. Typically current seconds ~ 1.7e9, ms ~ 1.7e12.
    if (Math.abs(rawNum) > 99999999999) {
      detectedUnit = 'ms'
      finalMs = rawNum
    } else {
      detectedUnit = 's'
      finalMs = rawNum * 1000
    }
  } else if (unit === 's') {
    detectedUnit = 's'
    finalMs = rawNum * 1000
  } else {
    detectedUnit = 'ms'
    finalMs = rawNum
  }

  // Bounds check (reasonable range between year 1970 and year 3000)
  if (finalMs < -62135596800000 || finalMs > 32503680000000) {
    return {
      isValid: false,
      error: 'Timestamp is out of supported range (years 0001 - 3000)',
    }
  }

  const date = new Date(finalMs)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date resulting from timestamp' }
  }

  const seconds = Math.floor(finalMs / 1000)
  const milliseconds = Math.floor(finalMs)

  return {
    isValid: true,
    date,
    seconds,
    milliseconds,
    utcIso: date.toISOString(),
    utcString: date.toUTCString(),
    localString: date.toLocaleString(),
    unitDetected: detectedUnit,
    relative: getRelativeTimeString(date),
  }
}

/**
 * Convert Date instance to timestamps
 */
export function convertDateToTimestamp(date: Date): { seconds: number; milliseconds: number } {
  const ms = date.getTime()
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  }
}
