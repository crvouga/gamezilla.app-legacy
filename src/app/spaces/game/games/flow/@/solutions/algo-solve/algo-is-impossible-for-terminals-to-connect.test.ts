import { describe, expect, test } from 'bun:test'
import { VariantGridShorthand } from '../../variant/grid'
import { isImpossibleForAnyTerminalToConnect } from './algo-is-impossible-for-terminals-to-connect'
import { Flow } from '../../flow'

describe('isImpossibleForAnyTerminalToConnect', () => {
  test('should return true when there are not enough available spaces', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', 'B', 'A'],
      ['a', 'a', 'a'],
      ['C', 'B', 'C'],
    ])
    const terminals = Flow.toFullTerminals(model)
    const result = isImpossibleForAnyTerminalToConnect(model, terminals)
    expect(result).toBe(true)
  })

  test('should return true when a terminal is cut off', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', 'B', ' '],
      ['a', 'a', 'a'],
      [' ', 'B', 'A'],
    ])
    const terminals = Flow.toFullTerminals(model)
    const result = isImpossibleForAnyTerminalToConnect(model, terminals)
    expect(result).toBe(true)
  })

  test('should return false when all terminals can connect', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])
    const terminals = Flow.toFullTerminals(model)
    const result = isImpossibleForAnyTerminalToConnect(model, terminals)
    expect(result).toBe(false)
  })
})
