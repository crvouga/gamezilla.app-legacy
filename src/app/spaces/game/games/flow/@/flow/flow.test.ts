import { describe, expect, test } from 'bun:test'
import { Flow } from '.'
import { FlowGrid, FlowGridShorthand } from '../variant/grid'

describe(import.meta.file, () => {
  test('isSolved 3x3 with A terminals and A pipes', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved 3x3 with A terminals', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', 'B', ' '],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('not isSolved 3x3 with A terminals and A pipes and B terminals and B pipes', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', 'B', 'b'],
      ['a', ' ', 'B'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved with A terminals and A pipes long', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('isSolved with adjacent connected A terminals', () => {
    const grid = FlowGridShorthand.toGrid([
      ['Aa', 'A'],
      [' ', ' '],
    ])
    expect(Flow.isSolved(grid)).toBe(true)
  })

  test('not isSolved with adjacent disconnected A terminals', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', ' '],
      ['A', ' '],
    ])
    expect(Flow.isSolved(grid)).toBe(false)
  })

  test('isConnectedWithPipes with connected terminals', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', ' '],
      ['a', 'A'],
    ])
    expect(Flow.isConnectedWithPipes(grid, FlowGrid.toNodeId({ x: 0, y: 0 }), FlowGrid.toNodeId({ x: 1, y: 1 }))).toBe(
      true,
    )
  })

  test('isConnectedWithPipes should not fail in case of branching', () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])
    expect(
      Flow.isConnectedWithPipes(
        grid,
        FlowGrid.toNodeId({
          x: 0,
          y: 0,
        }),
        FlowGrid.toNodeId({
          x: 2,
          y: 2,
        }),
      ),
    ).toBe(true)
  })

  test('isConnectedWithPipes should not fail in case of cycles', () => {
    const grid = FlowGridShorthand.toGrid([['A', 'a', 'A']])

    const node1 = FlowGrid.toNodeId({
      x: 0,
      y: 0,
    })
    const node2 = FlowGrid.toNodeId({
      x: 1,
      y: 0,
    })
    const node3 = FlowGrid.toNodeId({
      x: 2,
      y: 0,
    })

    const gridWithCycles: Flow.Model = {
      ...grid,
      pipesBySourceId: {
        ...grid.pipesBySourceId,
        [node3]: {
          edgeId: Flow.toFlowEdgeId({
            sourceId: node3,
            targetId: node2,
          }),
          groupId: 'A',
        },
        [node2]: {
          edgeId: Flow.toFlowEdgeId({
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
    const gridA = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const gridB = FlowGridShorthand.toGrid([
      [' ', ' ', ' '],
      [' ', ' ', 'a'],
      [' ', ' ', 'A'],
    ])

    const grid: FlowGrid.Model = {
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
    const grid = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    expect(Flow.hasBranchingPipelines(grid)).toBe(false)
  })

  test('multiple dead ends detection', async () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', 'a', 'a', ' '],
      [' ', ' ', 'a', ' '],
      ['a', 'a', 'a', ' '],
      [' ', ' ', ' ', 'A'],
    ])
    const solution = FlowGridShorthand.toGrid([
      ['A', ' ', ' ', ' '],
      ['a', ' ', ' ', ' '],
      ['a', ' ', ' ', ' '],
      ['a', 'a', 'a', 'A'],
    ])
    const multipleDeadEnds: FlowGrid.Model = {
      ...grid,
      pipesBySourceId: {
        ...grid.pipesBySourceId,
        ...solution.pipesBySourceId,
      },
    }
    expect(Flow.hasMultipleDeadEndPipelines(multipleDeadEnds)).toBe(true)
  })

  test('multiple dead ends false positive', async () => {
    const grid = FlowGridShorthand.toGrid([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['a', ' ', 'A'],
    ])
    expect(Flow.hasMultipleDeadEndPipelines(grid)).toBe(false)
  })
})
