import { test, expect, describe } from '~/@/test-runner'
import { rescale } from './rescale'

describe('rescale', async () => {
  test('rescales', async () => {
    expect(rescale(10, 0, 100, 0, 10)).toEqual(1)
  })
})
