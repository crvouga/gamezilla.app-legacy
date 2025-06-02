import { describe, expect, it } from 'bun:test'
import { race } from './race'
import { sleep } from './sleep'
import { TimeSpan } from '../time/time-span'

describe('race', () => {
  it('should return the first promise that resolves', async () => {
    const signal = new AbortSignal()
    const result = await race(signal, {
      fast: async (s) => {
        await sleep(TimeSpan.milliseconds(100), s)
        return 'fast'
      },
      slow: async (s) => {
        await sleep(TimeSpan.milliseconds(1000), s)
        return 'slow'
      },
    })

    expect(result).toEqual({
      fast: 'fast',
      slow: null,
    })
  })

  it('should abort other promises when one resolves', async () => {
    const signal = new AbortSignal()
    const abortedSignals: AbortSignal[] = []

    const result = await race(signal, {
      fast: async (s) => {
        await sleep(TimeSpan.milliseconds(100), s)
        return 'fast'
      },
      slow: async (s) => {
        abortedSignals.push(s)
        await sleep(TimeSpan.milliseconds(1000), s)
        return 'slow'
      },
    })

    expect(result).toEqual({
      fast: 'fast',
      slow: null,
    })
    expect(abortedSignals[0]?.aborted).toBe(true)
  })

  it('should handle rejected promises', async () => {
    const signal = new AbortSignal()
    const result = await race(signal, {
      success: async (s) => {
        await sleep(TimeSpan.milliseconds(100), s)
        return 'success'
      },
      failure: async (s) => {
        await sleep(TimeSpan.milliseconds(50), s)
        throw new Error('failed')
      },
    })

    expect(result).toEqual({
      success: null,
      failure: null,
    })
  })

  it('should work with multiple promises', async () => {
    const signal = new AbortSignal()
    const result = await race(signal, {
      first: async (s) => {
        await sleep(TimeSpan.milliseconds(50), s)
        return 'first'
      },
      second: async (s) => {
        await sleep(TimeSpan.milliseconds(100), s)
        return 'second'
      },
      third: async (s) => {
        await sleep(TimeSpan.milliseconds(150), s)
        return 'third'
      },
    })

    expect(result).toEqual({
      first: 'first',
      second: null,
      third: null,
    })
  })
})
