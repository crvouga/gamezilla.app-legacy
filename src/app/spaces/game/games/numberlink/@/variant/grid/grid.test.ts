import { eq } from '~/@/equals/equals'
import { describe, expect, test } from '~/@/test-runner'
import { Numberlink } from '../../numberlink'
import { VariantGrid } from './grid'
import { VariantGridDimensions } from './grid-dimensions'
import { VariantGridShorthand } from './grid-shorthand'

describe('Grid', () => {
  test('should initialize the model', () => {
    const initial = VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 3,
        width: 3,
      }),
    })
    expect(VariantGrid.schema.parse(initial).t).toEqual('ok')
  })

  test.skip('should initialize the model quickly', () => {
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

    expect(actualNanoseconds <= expectedMaxNanoseconds).toEqual(true)
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
    const expected: VariantGrid['pipesBySourceId'] = {
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
    expect(eq(actual, expected)).toEqual(true)
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
    expect(actual).toEqual(EXPECTED)
  })
})
