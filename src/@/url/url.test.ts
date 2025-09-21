import { describe, expect, test } from '~/@/test-runner'
import { Url } from './url'

describe('Url', () => {
  test('should be a brand', () => {
    const url = Url.derive('http://localhost:5003', 'http')
    expect(url).toEqual('http://localhost:5003' as Url)
  })

  test('from host and port', () => {
    const url = Url.derive('backend:5003', 'http')
    expect(url).toEqual('http://backend:5003' as Url)
  })

  test('websocket protocol https', () => {
    const url = Url.derive('ws://localhost:5003', 'https')
    expect(url).toEqual('https://localhost:5003' as Url)
  })

  test('websocket protocol http', () => {
    const url = Url.derive('ws://localhost:5003', 'http')
    expect(url).toEqual('http://localhost:5003' as Url)
  })

  test('wss protocol to https', () => {
    const url = Url.derive('wss://localhost:5003', 'https')
    expect(url).toEqual('https://localhost:5003' as Url)
  })

  test('wss protocol to http', () => {
    const url = Url.derive('wss://localhost:5003', 'http')
    expect(url).toEqual('http://localhost:5003' as Url)
  })

  test.skip('ws: protocol to https', () => {
    const url = Url.derive('ws:localhost:5003', 'https')
    expect(url).toEqual('ws://localhost:5003' as Url)
  })

  test.skip('wss: protocol to http', () => {
    const url = Url.derive('wss:localhost:5003', 'http')
    expect(url).toEqual('wss://localhost:5003' as Url)
  })

  test('preserves existing http protocol', () => {
    const url = Url.derive('http://example.com', 'https')
    expect(url).toEqual('http://example.com' as Url)
  })

  test('preserves existing https protocol', () => {
    const url = Url.derive('https://example.com', 'http')
    expect(url).toEqual('https://example.com' as Url)
  })

  test('should remove path from url', () => {
    const url = Url.removePath('https://example.com/some/path' as Url)
    expect(url).toEqual('https://example.com/some' as Url)
  })

  test('should handle url without path', () => {
    const url = Url.removePath('https://example.com' as Url)
    expect(url).toEqual('https://example.com' as Url)
  })

  test('should handle url with trailing slash', () => {
    const url = Url.removePath('https://example.com/' as Url)
    expect(url).toEqual('https://example.com' as Url)
  })

  describe('ensureWs', () => {
    test('should preserve existing ws protocol', () => {
      const url = Url.ensureWs('ws://example.com')
      expect(url).toEqual('ws://example.com' as Url)
    })

    test('should convert wss to ws', () => {
      const url = Url.ensureWs('wss://example.com')
      expect(url).toEqual('ws://example.com' as Url)
    })

    test('should convert http to ws', () => {
      const url = Url.ensureWs('http://example.com')
      expect(url).toEqual('ws://example.com' as Url)
    })

    test('should convert https to ws', () => {
      const url = Url.ensureWs('https://example.com')
      expect(url).toEqual('ws://example.com' as Url)
    })

    test('should add ws protocol to domain only', () => {
      const url = Url.ensureWs('example.com')
      expect(url).toEqual('ws://example.com' as Url)
    })

    test('should handle domain with port', () => {
      const url = Url.ensureWs('localhost:5003')
      expect(url).toEqual('ws://localhost:5003' as Url)
    })

    test('should handle wss with port', () => {
      const url = Url.ensureWs('wss://localhost:5003')
      expect(url).toEqual('ws://localhost:5003' as Url)
    })

    test('should handle https with port', () => {
      const url = Url.ensureWs('https://localhost:5003')
      expect(url).toEqual('ws://localhost:5003' as Url)
    })
  })

  describe('ensureWss', () => {
    test('should preserve existing wss protocol', () => {
      const url = Url.ensureWss('wss://example.com')
      expect(url).toEqual('wss://example.com' as Url)
    })

    test('should convert ws to wss', () => {
      const url = Url.ensureWss('ws://example.com')
      expect(url).toEqual('wss://example.com' as Url)
    })

    test('should convert http to wss', () => {
      const url = Url.ensureWss('http://example.com')
      expect(url).toEqual('wss://example.com' as Url)
    })

    test('should convert https to wss', () => {
      const url = Url.ensureWss('https://example.com')
      expect(url).toEqual('wss://example.com' as Url)
    })

    test('should add wss protocol to domain only', () => {
      const url = Url.ensureWss('example.com')
      expect(url).toEqual('wss://example.com' as Url)
    })

    test('should handle domain with port', () => {
      const url = Url.ensureWss('localhost:5003')
      expect(url).toEqual('wss://localhost:5003' as Url)
    })

    test('should handle ws with port', () => {
      const url = Url.ensureWss('ws://localhost:5003')
      expect(url).toEqual('wss://localhost:5003' as Url)
    })

    test('should handle https with port', () => {
      const url = Url.ensureWss('https://localhost:5003')
      expect(url).toEqual('wss://localhost:5003' as Url)
    })
  })
})
