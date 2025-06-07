import { describe, expect, it, test } from 'bun:test'
import { eq } from '~/@/equals/equals'
import { VariantGrid, VariantGridDimensions, VariantGridShorthand } from '.'
import { Numberlink } from '../../numberlink'

describe(import.meta.file, () => {
  it('should initialize the model', () => {
    const initial = VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 3,
        width: 3,
      }),
    })
    expect(VariantGrid.Model.parse(initial).t).toBe('ok')
  })

  it('should initialize the model quickly', () => {
    const start = process.hrtime()

    VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 20,
        width: 20,
      }),
    })

    const end = process.hrtime(start)

    const actualNanoseconds = end[0] * 1e9 + end[1]

    const expectedMaxNanoseconds = 10 * 1e6

    expect(actualNanoseconds).toBeLessThan(expectedMaxNanoseconds)
  })

  test('reverse pipes by source id', () => {
    const grid = VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 2,
        width: 1,
      }),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 0,
            y: 1,
          }),
          groupId: 'A',
        },
      },
      pipesBySourceId: {
        [VariantGrid.toNodeId({
          x: 0,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
          }),
          groupId: 'A',
        },
      },
    })
    const expected: VariantGrid.Model['pipesBySourceId'] = {
      [VariantGrid.toNodeId({
        x: 0,
        y: 1,
      })]: {
        edgeId: Numberlink.toEdgeId({
          targetId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          sourceId: VariantGrid.toNodeId({
            x: 0,
            y: 1,
          }),
        }),
        groupId: 'A',
      },
    }
    const actual = Numberlink.toReversedPipesBySourceId(grid)
    expect(eq(actual, expected)).toBe(true)
  })

  test('distance', () => {
    const grid = VariantGridShorthand.toGrid([
      [' ', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', ' '],
    ])
    const EXPECTED = 4
    const actual = VariantGrid.distance(
      grid,
      VariantGrid.toNodeId({ x: 0, y: 0 }),
      VariantGrid.toNodeId({ x: 2, y: 2 }),
    )
    expect(actual).toBe(EXPECTED)
  })
})
