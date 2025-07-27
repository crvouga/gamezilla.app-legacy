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
})
