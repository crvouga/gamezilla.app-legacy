import { describe, expect, test } from '~/@/test-runner'
import { CssSelector } from './css-selector'

describe('css-selector', () => {
  test('classes', () => {
    expect(CssSelector().class('foo').class('bar').class('baz').toString()).toEqual('.foo.bar.baz')
  })
})
