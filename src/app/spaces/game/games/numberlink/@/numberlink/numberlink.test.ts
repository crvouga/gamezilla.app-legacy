import { describe, expect, test } from '~/@/test-runner'
import { pipe } from '~/@/function/pipe'
import { Numberlink } from '.'
import { VariantGrid, VariantGridShorthand } from '../variant/grid'
import { Model } from './numberlink'
import { NodeId } from './node-id'

describe('Numberlink', () => {
  test('isConnectedWithPipes with connected terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' '],
      ['a', 'A'],
    ])
    expect(
      Numberlink.isConnectedWithPipes(grid, VariantGrid.toNodeId({ x: 0, y: 0 }), VariantGrid.toNodeId({ x: 1, y: 1 })),
    ).toEqual(true)
  })

  test('isConnectedWithPipes should not fail in case of branching', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    const start = VariantGrid.toNodeId({ x: 0, y: 0 })
    const end = VariantGrid.toNodeId({ x: 2, y: 2 })
    const isConnected = Numberlink.isConnectedWithPipes(grid, start, end)
    expect(isConnected).toEqual(true)
  })

  test('isConnectedWithPipes should not fail in case of cycles', () => {
    const grid = VariantGridShorthand.toGrid([['A', 'a', 'A']])

    const node1 = VariantGrid.toNodeId({
      x: 0,
      y: 0,
    })
    const node2 = VariantGrid.toNodeId({
      x: 1,
      y: 0,
    })
    const node3 = VariantGrid.toNodeId({
      x: 2,
      y: 0,
    })

    const gridWithCycles: Numberlink.Model = {
      ...grid,
      pipesBySourceId: {
        ...grid.pipesBySourceId,
        [node3]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: node3,
            targetId: node2,
          }),
          groupId: 'A',
        },
        [node2]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: node2,
            targetId: node1,
          }),
          groupId: 'A',
        },
      },
    }

    const isConnected = Numberlink.isConnectedWithPipes(gridWithCycles, node1, node3)

    expect(isConnected).toEqual(true)
  })

  test('branching pipelines detection', async () => {
    const gridA = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const gridB = VariantGridShorthand.toGrid([
      [' ', ' ', ' '],
      [' ', ' ', 'a'],
      [' ', ' ', 'A'],
    ])

    const grid: VariantGrid.Model = {
      ...gridA,
      pipesBySourceId: {
        ...gridA.pipesBySourceId,
        ...gridB.pipesBySourceId,
      },
    }

    const actual = Numberlink.hasBranchingPipelines(grid)
    expect(actual).toEqual(true)
  })

  test('branching pipelines false positives', async () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    expect(Numberlink.hasBranchingPipelines(grid)).toEqual(false)
  })

  test('multiple dead ends detection', async () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'a', 'a', ' '],
      [' ', ' ', 'a', ' '],
      ['a', 'a', 'a', ' '],
      [' ', ' ', ' ', 'A'],
    ])
    const solution = VariantGridShorthand.toGrid([
      ['A', ' ', ' ', ' '],
      ['a', ' ', ' ', ' '],
      ['a', ' ', ' ', ' '],
      ['a', 'a', 'a', 'A'],
    ])
    const multipleDeadEnds: VariantGrid.Model = {
      ...grid,
      pipesBySourceId: {
        ...grid.pipesBySourceId,
        ...solution.pipesBySourceId,
      },
    }
    expect(Numberlink.hasMultipleDeadEndPipelines(multipleDeadEnds)).toEqual(true)
  })

  test('multiple dead ends false positive', async () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(Numberlink.hasMultipleDeadEndPipelines(grid)).toEqual(false)
  })

  test('add pipeline', async () => {
    const emptyGrid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const expected = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])
    const pipeline = Numberlink.toPipelineFromGroupId(expected, 'A')
    const actual = Numberlink.addPipeline(emptyGrid, pipeline)
    const isSame = Numberlink.isSame(actual, expected)

    expect(isSame).toEqual(true)
  })

  test('add pipeline when terminal orientation does not match pipeline being added', async () => {
    const expected = pipe(
      VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        ['a', ' ', ' '],
        ['a', 'a', 'A'],
      ]),
      (x) => Numberlink.toPipelineFromGroupId(x, 'A'),
    )

    const actual = pipe(
      VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
      Numberlink.flipAllTerminals,
      (x) => Numberlink.addPipeline(x, expected),
      (x) => Numberlink.toPipelineFromGroupId(x, 'A'),
    )

    expect(expected).toEqual(actual)
  })

  test('deriveTerminalHash should not crash when having undefined values passed to it', () => {
    const terminals: Model['terminalsByGroupId'] = {
      A: {
        endId: NodeId.init('0'),
        groupId: 'A',
        startId: NodeId.init('1'),
      },
      B: undefined,
      C: {
        endId: NodeId.init('2'),
        groupId: 'C',
        startId: NodeId.init('3'),
      },
    }
    const hash = Numberlink.deriveTerminalHash(terminals)
    expect(hash).toBeDefined()
  })
})
