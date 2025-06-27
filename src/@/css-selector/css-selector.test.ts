import { describe, expect, test } from 'bun:test'
import { CssSelector } from './css-selector'

describe('css-selector', () => {
  test('classes', () => {
    expect(CssSelector().class('foo').class('bar').class('baz').toString()).toBe('.foo.bar.baz')
  })
})
