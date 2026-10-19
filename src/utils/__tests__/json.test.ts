import { describe, it, expect } from 'vitest'
import { formatJson, validateJson } from '../json'

describe('JSON Utilities', () => {
  it('validates correct JSON successfully', () => {
    const valid = '{"foo": "bar", "count": 42}'
    const result = validateJson(valid)
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('detects invalid JSON syntax and returns error info', () => {
    const invalid = '{"foo": "bar",}'
    const result = validateJson(invalid)
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('formats JSON with 2 spaces', () => {
    const input = '{"a":1,"b":2}'
    const result = formatJson(input, 2)
    expect(result.success).toBe(true)
    expect(result.result).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  it('minifies JSON properly', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}'
    const result = formatJson(input, 'minified')
    expect(result.success).toBe(true)
    expect(result.result).toBe('{"a":1,"b":2}')
  })

  it('keeps raw input intact on syntax error (Acceptance Criteria 5.1 & T-02)', () => {
    const broken = '{ broken json '
    const result = formatJson(broken, 2)
    expect(result.success).toBe(false)
    expect(result.result).toBe(broken)
    expect(result.error).toBeDefined()
  })
})
