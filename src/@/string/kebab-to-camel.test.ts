import { describe, expect, test } from '~/@/test-runner'
import { kebabToCamel } from './kebab-to-camel'

describe('kebabToCamel', () => {
  test('converts simple kebab-case to camelCase', () => {
    expect(kebabToCamel('foo-bar')).toEqual('fooBar')
  })

  test('converts kebab-case with multiple hyphens to camelCase', () => {
    expect(kebabToCamel('background-color')).toEqual('backgroundColor')
    expect(kebabToCamel('border-top-width')).toEqual('borderTopWidth')
  })

  test('handles single word inputs', () => {
    expect(kebabToCamel('foo')).toEqual('foo')
  })

  test('handles empty string', () => {
    expect(kebabToCamel('')).toEqual('')
  })

  test('preserves numbers', () => {
    expect(kebabToCamel('font-size-12px')).toEqual('fontSize12px')
  })
})
