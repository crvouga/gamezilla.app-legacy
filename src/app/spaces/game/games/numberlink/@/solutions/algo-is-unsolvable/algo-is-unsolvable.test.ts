import { describe, expect, test } from 'vitest'
import { VariantGridShorthand } from '../../variant/grid'
import * as AlgoIsUnsolvable from './algo-is-unsolvable'

describe('AlgoIsUnsolvable', () => {
  test('solvable 3x3 puzzle', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', 'C'],
      [' ', ' ', ' '],
      ['A', 'B', 'C'],
    ])
    expect(AlgoIsUnsolvable.isUnsolvable(grid)).toBe(false)
  })

  test('unsolvable 3x3 puzzle', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', 'A'],
      ['a', 'a', 'a'],
      ['C', 'B', 'C'],
    ])
    expect(AlgoIsUnsolvable.isUnsolvable(grid)).toBe(true)
  })

  test.todo('unsolvable 8x8', () => {
    const grid = VariantGridShorthand.toGrid([
      ['C', ' ', ' ', 'D', ' ', ' ', ' ', 'A'],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      ['B', ' ', ' ', ' ', ' ', ' ', ' ', 'B'],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      ['A', ' ', ' ', 'D', ' ', ' ', ' ', 'C'],
    ])
    expect(AlgoIsUnsolvable.isUnsolvable(grid)).toBe(true)
  })
})
