import { describe, expect, test } from '~/@/test-runner'
import { Url } from './url'

describe('Url', () => {
  test('should be a brand', () => {
    const url = Url.derive('http://localhost:5556')
    expect(url).toEqual('http://localhost:5556' as Url)
  })

  test('from host and port', () => {
    const url = Url.derive('backend:5556')
    expect(url).toEqual('http://backend:5556' as Url)
  })
})
