import { describe, expect, it } from 'vitest'
import { unique } from './unique'

const strEq = (s1: unknown, s2: unknown) => String(s1) === String(s2)

describe('unique', async () => {
  it('returns unique values', async () => {
    expect(unique(strEq, [1, '1', 2, 1])).toEqual([1, 2])
    expect(unique(strEq, [{}, {}])).toEqual([{}])
    expect(unique(strEq, [1, '1', 1])).toEqual([1])
    expect(unique(strEq, ['1', 1, 1])).toEqual(['1'])
  })
})
