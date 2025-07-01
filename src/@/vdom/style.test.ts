import { describe, expect, test } from '~/@/test-runner'
import { camelStringToKebabString, kebabObjectToCamelObject } from './style'

describe('styles', () => {
  test('should convert kebab-case to camelCase', () => {
    const kebab = 'transition-delay'
    const camel = 'transitionDelay'
    expect(camelStringToKebabString(camel)).toEqual(kebab)
  })
  test('should convert camelCase to kebab-case', () => {
    const kebab = 'transition-delay'
    const camel = 'transitionDelay'
    expect(camelStringToKebabString(camel)).toEqual(kebab)
  })
  test('should convert kebab-case to camelCase when rendering with React', () => {
    expect(
      kebabObjectToCamelObject({
        'transition-delay': '100ms',
      }),
    ).toEqual({
      transitionDelay: '100ms',
    })
  })
})
