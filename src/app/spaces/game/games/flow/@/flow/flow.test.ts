import { describe, expect, test } from 'bun:test'
import { Flow } from '.'
import { VariantGrid, VariantGridShorthand } from '../variant/grid'
import { pipe } from '~/@/function/pipe'

describe(import.meta.file, () => {
  test('isSolved 3x3 with A terminals and A pipes', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved 3x3 with A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', ' '],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals and B pipes', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'B', 'b'],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved with A terminals and A pipes long', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved with adjacent connected A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['Aa', 'A'],
      [' ', ' '],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('not isSolved with adjacent disconnected A terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' '],
      ['A', ' '],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('isConnectedWithPipes with connected terminals', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' '],
      ['a', 'A'],
    ])
    expect(
      Flow.isConnectedWithPipes(grid, VariantGrid.toNodeId({ x: 0, y: 0 }), VariantGrid.toNodeId({ x: 1, y: 1 })),
    ).toBe(true)
  })

  test('isConnectedWithPipes should not fail in case of branching', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    expect(
      Flow.isConnectedWithPipes(
        grid,
        VariantGrid.toNodeId({
          x: 0,
          y: 0,
        }),
        VariantGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      ),
    ).toBe(true)
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

    const gridWithCycles: Flow.Model = {
      ...grid,
      pipesBySourceId: {
        ...grid.pipesBySourceId,
        [node3]: {
          edgeId: Flow.toEdgeId({
            sourceId: node3,
            targetId: node2,
          }),
          groupId: 'A',
        },
        [node2]: {
          edgeId: Flow.toEdgeId({
            sourceId: node2,
            targetId: node1,
          }),
          groupId: 'A',
        },
      },
    }

    const isConnected = Flow.isConnectedWithPipes(gridWithCycles, node1, node3)

    expect(isConnected).toBe(true)
  })

  test('branching pipelines dectection', async () => {
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

    const actual = Flow.hasBranchingPipelines(grid)
    expect(actual).toBe(true)
  })

  test('branching pipelines false postives', async () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    expect(Flow.hasBranchingPipelines(grid)).toBe(false)
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
    expect(Flow.hasMultipleDeadEndPipelines(multipleDeadEnds)).toBe(true)
  })

  test('multiple dead ends false positive', async () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(Flow.hasMultipleDeadEndPipelines(grid)).toBe(false)
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
    const pipeline = Flow.toPipelineFromGroupId(expected, 'A')
    const actual = Flow.addPipeline(emptyGrid, pipeline)
    const isSame = Flow.isSame(actual, expected)

    expect(isSame).toBe(true)
  })

  test('add pipeline when terminal orentation does not match pipeline being added', async () => {
    const expected = pipe(
      VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        ['a', ' ', ' '],
        ['a', 'a', 'A'],
      ]),
      (x) => Flow.toPipelineFromGroupId(x, 'A'),
    )

    const actual = pipe(
      VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ]),
      Flow.flipAllTerminals,
      (x) => Flow.addPipeline(x, expected),
      (x) => Flow.toPipelineFromGroupId(x, 'A'),
    )

    expect(expected).toEqual(actual)
  })
})
