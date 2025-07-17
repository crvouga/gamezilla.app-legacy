import { describe, expect, test } from '~/@/test-runner'
import { Logger } from '../logger'
import { cnFilter, cnLoop, cnParams } from './cn'

const SHOULD_LOG = false
const logger = SHOULD_LOG
  ? Logger({ t: 'console', namespace: ['cn'], newLinePerMsg: false, maxLogLevel: 'info' })
  : Logger({ t: 'noop' })

describe('cn performance', () => {
  test('should be fast for typical usage', () => {
    const iterations = 100000
    const start = process.hrtime.bigint()

    for (let i = 0; i < iterations; i++) {
      cnParams(
        'base-class',
        i % 2 === 0 ? 'even' : null,
        i % 3 === 0 ? 'third' : false,
        'always-there',
        undefined,
        i % 5 === 0 ? 'fifth' : null,
        'final-class',
      )
    }

    const end = process.hrtime.bigint()
    const timePerOp = Number(end - start) / iterations / 1_000_000 // Convert nanoseconds to milliseconds

    expect(timePerOp <= 0.01).toEqual(true)

    // Log actual performance for reference
    logger.info(`Average time per cnParams() call: ${timePerOp.toFixed(6)}ms`)
  })

  test('should compare cn vs cnLoop performance', () => {
    const iterations = 100

    // Test cnParams()
    const startCn = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      cnParams(
        'base-class',
        i % 2 === 0 ? 'even' : null,
        i % 3 === 0 ? 'third' : false,
        'always-there',
        undefined,
        i % 5 === 0 ? 'fifth' : null,
        'final-class',
      )
    }
    const endCn = process.hrtime.bigint()
    const timePerCn = Number(endCn - startCn) / iterations / 1_000_000 // Convert nanoseconds to milliseconds

    // Test cnLoop()
    const startLoop = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      cnLoop(
        'base-class',
        i % 2 === 0 ? 'even' : null,
        i % 3 === 0 ? 'third' : false,
        'always-there',
        undefined,
        i % 5 === 0 ? 'fifth' : null,
        'final-class',
      )
    }
    const endLoop = process.hrtime.bigint()
    const timePerLoop = Number(endLoop - startLoop) / iterations / 1_000_000 // Convert nanoseconds to milliseconds

    // Test cnFilter()
    const startFilter = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      cnFilter(
        'base-class',
        i % 2 === 0 ? 'even' : null,
        i % 3 === 0 ? 'third' : false,
        'always-there',
        undefined,
        i % 5 === 0 ? 'fifth' : null,
        'final-class',
      )
    }
    const endFilter = process.hrtime.bigint()
    const timePerFilter = Number(endFilter - startFilter) / iterations / 1_000_000 // Convert nanoseconds to milliseconds

    logger.info(`Average time per cnParams() call: ${timePerCn.toFixed(6)}ms`)
    logger.info(`Average time per cnLoop() call: ${timePerLoop.toFixed(6)}ms`)
    logger.info(`Average time per cnFilter() call: ${timePerFilter.toFixed(6)}ms`)
    logger.info(`cn is ${timePerLoop / timePerCn}x faster than cnLoop`)
    logger.info(`cn is ${timePerFilter / timePerCn}x faster than cn`)
  })
})
