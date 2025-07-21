import { describe, expect, test } from '~/@/test-runner'
import { ImplAllowSubDomains } from './impl-allow-sub-domains'

describe('ImplAllowSubDomains', () => {
  test('allows exact domain match', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual('http://example.com')
    expect(mappedResponse.headers.get('Access-Control-Allow-Credentials')).toEqual('true')
  })

  test('allows subdomain match', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://sub.example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual('http://sub.example.com')
  })

  test('allows server domain when enabled', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: [],
      allowServerDomain: true,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://localhost:3000',
        Host: 'localhost:3000',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual('http://localhost:3000')
  })

  test('handles OPTIONS request', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Max-Age')).toEqual('3600')
  })

  test('does not set headers for disallowed origin', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://malicious.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual(null)
  })

  test('handles missing Origin header', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com')

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual(null)
  })

  test('handles invalid Origin URL', () => {
    const policy = ImplAllowSubDomains.init({
      t: 'allow-sub-domains',
      allowedDomains: ['example.com'],
      allowServerDomain: false,
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'invalid-url',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual(null)
  })
})
