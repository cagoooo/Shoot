import { describe, expect, it } from 'vitest'
import { normalizeBasePath } from './basePath'

describe('normalizeBasePath', () => {
  it.each([
    ['', '/'],
    ['Shoot', '/Shoot/'],
    ['/Shoot/', '/Shoot/'],
    ['//Shoot//', '/Shoot/'],
  ])('將「%s」轉成「%s」', (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected)
  })
})
