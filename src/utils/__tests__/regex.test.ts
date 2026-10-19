import { describe, it, expect } from 'vitest'
import { executeRegex, REGEX_PRESETS } from '../regex'

describe('Regex Utilities', () => {
  it('executes valid pattern and finds all matches with global flag', () => {
    const text = 'The year was 2024, now is 2026, next is 2028.'
    const result = executeRegex('\\d{4}', 'g', text)
    expect(result.isValid).toBe(true)
    expect(result.matchCount).toBe(3)
    expect(result.matches[0].match).toBe('2024')
    expect(result.matches[1].match).toBe('2026')
    expect(result.matches[2].match).toBe('2028')
  })

  it('captures indexed and named groups', () => {
    const text = 'John Doe, Jane Smith'
    const result = executeRegex('(?<first>\\w+)\\s+(?<last>\\w+)', 'g', text)
    expect(result.isValid).toBe(true)
    expect(result.matchCount).toBe(2)
    expect(result.matches[0].groups).toEqual(['John', 'Doe'])
    expect(result.matches[0].namedGroups).toEqual({ first: 'John', last: 'Doe' })
  })

  it('handles substitution and replacements', () => {
    const text = 'Hello Alice and Bob'
    const result = executeRegex('\\b(Alice|Bob)\\b', 'g', text, 'DevForge')
    expect(result.isValid).toBe(true)
    expect(result.replacedOutput).toBe('Hello DevForge and DevForge')
  })

  it('reports error on invalid regex syntax without crashing', () => {
    const invalidPattern = '[a-z'
    const result = executeRegex(invalidPattern, 'g', 'sample text')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('matches Vietnamese phone numbers correctly with preset pattern', () => {
    const preset = REGEX_PRESETS.find((p) => p.id === 'vietnam-phone')!
    expect(preset).toBeDefined()

    const validPhones = 'Call 0981234567 or +84901234567'
    const res = executeRegex(preset.pattern, preset.flags, validPhones)
    expect(res.matchCount).toBe(2)
  })

  it('matches valid email addresses with preset pattern', () => {
    const emailPreset = REGEX_PRESETS.find((p) => p.id === 'email')!
    expect(emailPreset).toBeDefined()

    const validRes = executeRegex(emailPreset.pattern, '', 'developer@devforge.dev')
    expect(validRes.matchCount).toBe(1)

    const invalidRes = executeRegex(emailPreset.pattern, '', 'not-an-email')
    expect(invalidRes.matchCount).toBe(0)
  })
})
