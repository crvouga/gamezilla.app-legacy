import { describe, expect, test } from '~/@/test-runner'
import { Url } from './url'

describe('Url.ensureHttps', () => {
  test('should return the same URL if it already has http:// protocol', () => {
    const url = 'http://example.com'
    expect(Url.ensureHttps(url)).toEqual(url)
  })

  test('should return the same URL if it already has https:// protocol', () => {
    const url = 'https://example.com'
    expect(Url.ensureHttps(url)).toEqual(url)
  })

  test('should add https:// protocol if URL has no protocol', () => {
    const url = 'example.com'
    expect(Url.ensureHttps(url)).toEqual('https://' + url)
  })

  test('should handle URLs with subdomains', () => {
    const url = 'sub.example.com'
    expect(Url.ensureHttps(url)).toEqual('https://' + url)
  })

  test('should handle URLs with paths', () => {
    const url = 'example.com/path'
    expect(Url.ensureHttps(url)).toEqual('https://' + url)
  })

  test('should handle URLs with query parameters', () => {
    const url = 'example.com?param=value'
    expect(Url.ensureHttps(url)).toEqual('https://' + url)
  })
})
