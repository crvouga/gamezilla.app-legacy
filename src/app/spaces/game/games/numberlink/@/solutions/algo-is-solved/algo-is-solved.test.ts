import { describe, expect, test } from '~/@/test-runner'
import { VariantGridShorthand } from '../../variant/grid'
import { AlgoIsSolved } from './algo-is-solved'

describe('AlgoIsSolved', () => {
  test('isSolved 3x3 with A terminals and A pipes', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(true)
  })

  test('isSolved 3x3 with A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', ' '],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals and B pipes', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', 'b'],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(true)
  })

  test('isSolved with A terminals and A pipes long', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(true)
  })

  test('isSolved with adjacent connected A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['Aa', 'A'],
      [' ', ' '],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(true)
  })

  test('not isSolved with adjacent disconnected A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' '],
      ['A', ' '],
    ])
    expect(AlgoIsSolved.isSolved(grid)).toEqual(false)
  })
})
