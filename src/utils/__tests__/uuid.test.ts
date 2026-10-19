import { describe, it, expect } from 'vitest'
import { generateUuidV4, generateUuids } from '../uuid'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('UUID Utilities', () => {
  it('generates a valid RFC 4122 v4 UUID', () => {
    const id = generateUuidV4()
    expect(UUID_V4_REGEX.test(id)).toBe(true)
  })

  it('generates the exact requested number of UUIDs (T-05)', () => {
    const list = generateUuids(7)
    expect(list.length).toBe(7)
    for (const id of list) {
      expect(UUID_V4_REGEX.test(id)).toBe(true)
    }
  })

  it('supports uppercase formatting', () => {
    const id = generateUuidV4({ uppercase: true })
    expect(id).toBe(id.toUpperCase())
    expect(UUID_V4_REGEX.test(id)).toBe(true)
  })

  it('supports removing hyphens', () => {
    const id = generateUuidV4({ hyphens: false })
    expect(id).not.toContain('-')
    expect(id.length).toBe(32)
  })

  it('clamps bounds between 1 and 100', () => {
    expect(generateUuids(0).length).toBe(1)
    expect(generateUuids(200).length).toBe(100)
  })
})
