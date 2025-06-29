import { describe, expect, test } from 'vitest'
import { camelStringToKebabString, styles } from './style'

describe('styles', () => {
  test('should convert kebab-case to camelCase', () => {
    const kebab = 'transition-delay'
    const camel = 'transitionDelay'
    expect(camelStringToKebabString(camel)).toBe(kebab)
  })
  test('should convert camelCase to kebab-case', () => {
    const kebab = 'transition-delay'
    const camel = 'transitionDelay'
    expect(camelStringToKebabString(camel)).toBe(kebab)
  })
  test('should convert kebab-case to camelCase when rendering with React', () => {
    expect(
      styles(
        {
          'transition-delay': '100ms',
        },
        'react',
      ),
    ).toEqual({
      transitionDelay: '100ms',
    })
  })

  test('should not convert kebab-case to camelCase when rendering with Inferno', () => {
    expect(
      styles(
        {
          'transition-delay': '100ms',
        },
        'inferno',
      ),
    ).toEqual({
      'transition-delay': '100ms',
    })
  })
})
