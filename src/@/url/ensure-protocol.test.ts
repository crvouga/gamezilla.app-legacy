import { describe, expect, test } from 'vitest'
import { ensureProtocol } from './ensure-protocol'

describe('ensureProtocol', () => {
  test('should return the same URL if it already has http:// protocol', () => {
    const url = 'http://example.com'
    expect(ensureProtocol(url)).toBe(url)
  })

  test('should return the same URL if it already has https:// protocol', () => {
    const url = 'https://example.com'
    expect(ensureProtocol(url)).toBe(url)
  })

  test('should add https:// protocol if URL has no protocol', () => {
    const url = 'example.com'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  test('should handle URLs with subdomains', () => {
    const url = 'sub.example.com'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  test('should handle URLs with paths', () => {
    const url = 'example.com/path'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  test('should handle URLs with query parameters', () => {
    const url = 'example.com?param=value'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })
})
