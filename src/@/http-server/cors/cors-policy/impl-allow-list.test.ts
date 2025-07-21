import { describe, expect, test } from '~/@/test-runner'
import { ImplAllowList } from './impl-allow-list'

describe('ImplAllowList', () => {
  test('allows origin from allow list', () => {
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual('example.com')
    expect(mappedResponse.headers.get('Access-Control-Allow-Credentials')).toEqual('true')
  })

  test('sets CORS headers for allowed origin', () => {
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
    })

    const response = new Response()
    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Methods')).toEqual(
      'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
    )
    expect(mappedResponse.headers.get('Access-Control-Allow-Headers')).toEqual('Content-Type, Authorization')
  })

  test('handles OPTIONS request', () => {
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
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

  test('does not set origin header for disallowed origin', () => {
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
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
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
    })

    const response = new Response()
    const request = new Request('http://test.com')

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Origin')).toEqual(null)
  })

  test('uses custom Access-Control-Request-Headers when provided', () => {
    const policy = ImplAllowList.init({
      t: 'allow-list',
      allowList: ['example.com'],
    })

    const response = new Response()
    response.headers.set('Access-Control-Request-Headers', 'X-Custom-Header')

    const request = new Request('http://test.com', {
      headers: {
        Origin: 'http://example.com',
      },
    })

    const mappedResponse = policy.map(response, request)

    expect(mappedResponse.headers.get('Access-Control-Allow-Headers')).toEqual('X-Custom-Header')
  })
})
