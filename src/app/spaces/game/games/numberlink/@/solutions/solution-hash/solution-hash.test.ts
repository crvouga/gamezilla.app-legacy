import { describe, expect, test } from 'vitest'
import { Numberlink } from '../../numberlink'
import { EdgeId } from '../../numberlink/edge-id'
import { VariantGrid, VariantGridShorthand } from '../../variant/grid'
import { SolutionHash } from './solution-hash'

describe('SolutionHash', () => {
  test('deterministic', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const first = SolutionHash.init(model)
    const second = SolutionHash.init(model)
    expect(first).toEqual(second)
  })

  test('independent', () => {
    const modelA = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const modelB = VariantGridShorthand.toGrid([
      ['A', 'B', ' '],
      [' ', ' ', 'B'],
      [' ', ' ', 'A'],
    ])
    const hashA = SolutionHash.init(modelA)
    const hashB = SolutionHash.init(modelB)
    expect(hashA).not.toEqual(hashB)
  })

  test('independent of terminal order', () => {
    const modelA = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const modelB = Numberlink.flipAllTerminals(modelA)
    const hashA = SolutionHash.init(modelA)
    const hashB = SolutionHash.init(modelB)
    expect(hashA).toEqual(hashB)
  })

  test('should be sensitive to edges', () => {
    const modelA = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const edgeId = EdgeId.init(VariantGrid.toNodeId({ x: 0, y: 0 }), VariantGrid.toNodeId({ x: 0, y: 1 }))
    const modelB = Numberlink.removeEdge(modelA, edgeId)
    const hashA = SolutionHash.init(modelA)
    const hashB = SolutionHash.init(modelB)
    expect(hashA).not.toEqual(hashB)
  })

  test('should not crash when missing intermediate terminal groups', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', ' ', 'C', ' '],
      [' ', ' ', ' ', ' '],
      ['A', ' ', 'C', ' '],
      ['E', ' ', ' ', 'E'],
    ])
    const hash = SolutionHash.init(model)
    expect(hash).toBeDefined()
  })
})
