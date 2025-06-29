import { describe, expect, test } from '~/@/test-runner'
import { Err, Ok } from '../result'
import { TimeSpan } from '../time/time-span'
import { BackoffFunction } from './backoff-functions'
import { Retry } from './retry'

describe('Retry', () => {
  test('should return success on first attempt', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      return Ok(42)
    }

    const result = await Retry({
      maxAttempts: 3,
      backoffFunction: BackoffFunction.exponential({
        baseDelay: TimeSpan.milliseconds(100),
        maxDelay: TimeSpan.seconds(1),
      }),
      fn,
    })

    expect(result).toEqual(Ok(42))
    expect(attempts).toEqual(1)
  })

  test('should retry on failure and eventually succeed', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      if (attempts === 1) {
        return Err(new Error('First attempt'))
      }
      return Ok(42)
    }

    const result = await Retry({
      maxAttempts: 3,
      backoffFunction: BackoffFunction.exponential({
        baseDelay: TimeSpan.milliseconds(100),
        maxDelay: TimeSpan.seconds(1),
      }),
      fn,
    })

    expect(result).toEqual(Ok(42))
    expect(attempts).toEqual(2)
  })

  test('should return all errors when max attempts reached', async () => {
    let attempts = 0
    const errors = [new Error('First attempt'), new Error('Second attempt')]
    const fn = () => {
      const error = errors[attempts]
      attempts++
      return Err(error)
    }

    const result = await Retry({
      maxAttempts: 2,
      backoffFunction: BackoffFunction.exponential({
        baseDelay: TimeSpan.milliseconds(100),
        maxDelay: TimeSpan.seconds(1),
      }),
      fn,
    })

    expect(result).toEqual(Err(errors))
    expect(attempts).toEqual(2)
  })

  test('should respect max attempts limit', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      return Err(new Error('Failed attempt'))
    }

    const result = await Retry({
      maxAttempts: 2,
      backoffFunction: BackoffFunction.exponential({
        baseDelay: TimeSpan.milliseconds(100),
        maxDelay: TimeSpan.seconds(1),
      }),
      fn,
    })

    expect(result).toEqual(Err([new Error('Failed attempt'), new Error('Failed attempt')]))
    expect(attempts).toEqual(2)
  })
})
