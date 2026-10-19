import { describe, it, expect } from 'vitest'
import { convertTimestampToDate, convertDateToTimestamp } from '../timestamp'

describe('Timestamp Utilities', () => {
  it('correctly converts seconds timestamp (T-06)', () => {
    // 1700000000 = 2023-11-14T22:13:20.000Z
    const result = convertTimestampToDate('1700000000', 's')
    expect(result.isValid).toBe(true)
    expect(result.unitDetected).toBe('s')
    expect(result.utcIso).toBe('2023-11-14T22:13:20.000Z')
    expect(result.seconds).toBe(1700000000)
    expect(result.milliseconds).toBe(1700000000000)
  })

  it('correctly converts milliseconds timestamp (T-06)', () => {
    const result = convertTimestampToDate('1700000000123', 'ms')
    expect(result.isValid).toBe(true)
    expect(result.unitDetected).toBe('ms')
    expect(result.utcIso).toBe('2023-11-14T22:13:20.123Z')
    expect(result.milliseconds).toBe(1700000000123)
  })

  it('auto-detects between seconds and milliseconds accurately', () => {
    const secRes = convertTimestampToDate('1700000000', 'auto')
    expect(secRes.unitDetected).toBe('s')

    const msRes = convertTimestampToDate('1700000000000', 'auto')
    expect(msRes.unitDetected).toBe('ms')
  })

  it('handles invalid timestamp format cleanly', () => {
    const invalid = convertTimestampToDate('abc_not_a_time')
    expect(invalid.isValid).toBe(false)
    expect(invalid.error).toBeDefined()
  })

  it('converts Date instance back to seconds and milliseconds', () => {
    const d = new Date('2025-01-01T00:00:00.000Z')
    const res = convertDateToTimestamp(d)
    expect(res.seconds).toBe(1735689600)
    expect(res.milliseconds).toBe(1735689600000)
  })
})
