import { describe, expect, it } from 'bun:test'
import { ensureProtocol } from './ensure-protocol'

describe('ensureProtocol', () => {
  it('should return the same URL if it already has http:// protocol', () => {
    const url = 'http://example.com'
    expect(ensureProtocol(url)).toBe(url)
  })

  it('should return the same URL if it already has https:// protocol', () => {
    const url = 'https://example.com'
    expect(ensureProtocol(url)).toBe(url)
  })

  it('should add https:// protocol if URL has no protocol', () => {
    const url = 'example.com'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  it('should handle URLs with subdomains', () => {
    const url = 'sub.example.com'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  it('should handle URLs with paths', () => {
    const url = 'example.com/path'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })

  it('should handle URLs with query parameters', () => {
    const url = 'example.com?param=value'
    expect(ensureProtocol(url)).toBe('https://' + url)
  })
})
