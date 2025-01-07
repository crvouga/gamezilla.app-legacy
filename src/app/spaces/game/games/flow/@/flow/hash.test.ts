import { describe, expect, test } from 'bun:test'
import { VariantGridShorthand } from '../variant/grid'
import { FlowHash } from './hash'
import { Flow } from '.'

describe(import.meta.file, () => {
  test('deterministic', () => {
    const model = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const first = FlowHash.init(model)
    const second = FlowHash.init(model)
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
    const hashA = FlowHash.init(modelA)
    const hashB = FlowHash.init(modelB)
    expect(hashA).not.toEqual(hashB)
  })

  test('independent of terminal order', () => {
    const modelA = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const modelB = Flow.flipAllTerminals(modelA)
    const hashA = FlowHash.init(modelA)
    const hashB = FlowHash.init(modelB)
    expect(hashA).toEqual(hashB)
  })
})
