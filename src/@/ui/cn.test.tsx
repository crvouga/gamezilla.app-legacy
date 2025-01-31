import { describe, expect, test } from 'bun:test'
import { cn, cnLoop } from './cn'

describe.only('cn performance', () => {
  test('should be fast for typical usage', () => {
    const iterations = 100000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      cn(
        'base-class',
        i % 2 === 0 ? 'even' : null,
        i % 3 === 0 ? 'third' : false,
        'always-there',
        undefined,
        i % 5 === 0 ? 'fifth' : null,
        'final-class',
      )
    }

    const end = performance.now()
    const timePerOp = (end - start) / iterations

    // Should be well under 1ms per operation
    expect(timePerOp).toBeLessThan(0.001)

    // Log actual performance for reference
    console.log(`Average time per cn() call: ${timePerOp.toFixed(6)}ms`)
  })

  test('should compare cn vs cnLoop performance', () => {
    const iterations = 100

    // Test cn()
    const startCn = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      cn(
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
    console.log(`Average time per cn() call: ${timePerCn.toFixed(6)}ms`)
    console.log(`Average time per cnLoop() call: ${timePerLoop.toFixed(6)}ms`)
    console.log(`cn is ${timePerLoop / timePerCn}x faster than cnLoop`)
  })
})
