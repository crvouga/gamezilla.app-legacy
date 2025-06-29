import { test, expect, describe } from '~/@/test-runner'
import { rescale } from './rescale'

describe('rescale', async () => {
  test('rescales', async () => {
    expect(
      rescale({
        value: 10,
        from: [0, 100],
        to: [0, 10],
      }),
    ).toEqual(1)
  })
})
