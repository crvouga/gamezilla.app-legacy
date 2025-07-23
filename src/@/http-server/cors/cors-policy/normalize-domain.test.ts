import { describe, expect, test } from 'vitest'
import { normalizeDomain } from './normalize-domain'

describe('normalizeDomain', () => {
  test('removes protocol', () => {
    expect(normalizeDomain('http://example.com')).toBe('example.com')
    expect(normalizeDomain('https://example.com')).toBe('example.com')
  })

  test('removes port', () => {
    expect(normalizeDomain('example.com:3000')).toBe('example.com')
  })

  test('converts to lowercase', () => {
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com')
  })

  test('trims whitespace', () => {
    expect(normalizeDomain(' example.com ')).toBe('example.com')
  })

  test('removes trailing slash', () => {
    expect(normalizeDomain('example.com/')).toBe('example.com')
  })

  test('removes www prefix', () => {
    expect(normalizeDomain('www.example.com')).toBe('example.com')
  })

  test('removes all whitespace', () => {
    expect(normalizeDomain('ex am ple.c om')).toBe('example.com')
  })

  test('only allows alphanumeric, dots and hyphens', () => {
    expect(normalizeDomain('ex@mple!.c#m')).toBe('exmple.cm')
  })

  test('replaces multiple dots with single dot', () => {
    expect(normalizeDomain('example...com')).toBe('example.com')
  })

  test('removes leading and trailing dots', () => {
    expect(normalizeDomain('.example.com.')).toBe('example.com')
  })

  test('keeps only domain and TLD', () => {
    expect(normalizeDomain('sub1.sub2.example.com')).toBe('example.com')
  })

  test('handles undefined input', () => {
    expect(normalizeDomain(undefined)).toBe(undefined)
  })

  test('handles multiple transformations', () => {
    expect(normalizeDomain('https://WWW.SUB.EXAMPLE.COM:3000/')).toBe('example.com')
  })

  test('handles empty string', () => {
    expect(normalizeDomain('')).toBe('')
  })

  test('handles domain with hyphen', () => {
    expect(normalizeDomain('my-example.com')).toBe('my-example.com')
  })

  test('handles domain with numbers', () => {
    expect(normalizeDomain('example123.com')).toBe('example123.com')
  })

  test('handles IP address', () => {
    expect(normalizeDomain('127.0.0.1')).toBe('0.1')
  })

  test('handles special TLDs', () => {
    expect(normalizeDomain('example.co.uk')).toBe('co.uk')
  })

  test('handles protocol with port', () => {
    expect(normalizeDomain('http://example.com:8080')).toBe('example.com')
  })

  test('handles mixed case www prefix', () => {
    expect(normalizeDomain('WwW.example.com')).toBe('example.com')
  })

  test('handles multiple special characters', () => {
    expect(normalizeDomain('ex@mp!le&.c*o#m')).toBe('exmple.com')
  })

  test('handles multi level sub domains', () => {
    expect(normalizeDomain('a.b.c.d.example.com')).toBe('example.com')
    expect(normalizeDomain('dev.staging.test.example.com')).toBe('example.com')
    expect(normalizeDomain('very.deeply.nested.sub.domain.example.com')).toBe('example.com')
  })
  test('handles multiple empty strings', () => {
    expect(normalizeDomain('   ')).toBe('')
    expect(normalizeDomain('\t')).toBe('')
    expect(normalizeDomain('\n')).toBe('')
    expect(normalizeDomain('\r\n')).toBe('')
  })

  test('handles strings with only dots', () => {
    expect(normalizeDomain('...')).toBe('')
    expect(normalizeDomain('.....')).toBe('')
    expect(normalizeDomain('  ...  ')).toBe('')
  })

  test('handles strings with only special characters', () => {
    expect(normalizeDomain('@#$%^&*')).toBe('')
    expect(normalizeDomain('!@#$%^&*()')).toBe('')
    expect(normalizeDomain('  @#$  ')).toBe('')
  })
})
