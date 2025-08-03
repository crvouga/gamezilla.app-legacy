import { describe, expect, test } from '~/@/test-runner'
import { camelToKebab } from './camel-to-kebab'

describe('camelToKebab', () => {
  test('converts simple camelCase to kebab-case', () => {
    expect(camelToKebab('fooBar')).toEqual('foo-bar')
  })

  test('converts camelCase with multiple capitals to kebab-case', () => {
    expect(camelToKebab('backgroundColor')).toEqual('background-color')
    expect(camelToKebab('borderTopWidth')).toEqual('border-top-width')
  })

  test('handles single word inputs', () => {
    expect(camelToKebab('foo')).toEqual('foo')
  })

  test('handles empty string', () => {
    expect(camelToKebab('')).toEqual('')
  })

  test('preserves numbers', () => {
    expect(camelToKebab('fontSize12px')).toEqual('font-size12px')
  })
})
