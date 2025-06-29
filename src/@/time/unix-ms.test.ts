import { describe, expect, test } from '~/@/test-runner'
import { UnixMs } from './unix-ms'

describe('UnixMs', () => {
  test('should be able to be precise to the second', () => {
    const now = UnixMs.now({
      precision: 'minutes',
    })
    const now2 = UnixMs.now({
      precision: 'minutes',
    })
    expect(now).toEqual(now2)
  })
})
