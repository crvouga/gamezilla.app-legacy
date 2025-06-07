import { describe, expect, it, test } from 'bun:test'
import { Numberlink } from '../../../numberlink'
import { VariantGrid, VariantGridDimensions } from '../index'
import * as VariantGridShorthand from './grid-shorthand'

describe(import.meta.file, () => {
  test('1x1 with A', async () => {
    const shorthand = VariantGridShorthand.init([['A']])
    const actual = VariantGridShorthand.toGrid(shorthand)
    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: null,
          groupId: 'A',
        },
      },
    })
    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with A', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' '],
      [' ', 'A'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 2,
        width: 2,
      }),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 1,
          }),
          groupId: 'A',
        },
      },
    })
    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with A and B', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', 'B'],
      ['B', 'A'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridDimensions.init({
        height: 2,
        width: 2,
      }),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 1,
          }),
          groupId: 'A',
        },
        B: {
          startId: VariantGrid.toNodeId({
            x: 1,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 0,
            y: 1,
          }),
          groupId: 'B',
        },
      },
    })
    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('3x3 with A', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const actual = VariantGridShorthand.toGrid(shorthand)
    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 2,
            y: 2,
          }),
          groupId: 'A',
        },
      },
    })
    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('3x3 with A and B', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' ', 'B'],
      [' ', 'B', ' '],
      [' ', ' ', 'A'],
    ])
    const actual = VariantGridShorthand.toGrid(shorthand)
    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 2,
            y: 2,
          }),
          groupId: 'A',
        },
        B: {
          startId: VariantGrid.toNodeId({
            x: 2,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 1,
          }),
          groupId: 'B',
        },
      },
    })
    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with terminal and pipe', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' '],
      ['a', 'A'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
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
        [VariantGrid.toNodeId({
          x: 0,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'A',
        },
      },
    })

    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with adjacent connected terminals', async () => {
    const shorthand = VariantGridShorthand.init([
      ['Aa', ' '],
      ['A', ' '],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
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

    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with adjacent non-connected terminals', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' '],
      ['A', ' '],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
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
    })

    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  test('2x2 with A terminal with pipe and B terminal with pipe', async () => {
    const shorthand = VariantGridShorthand.init([
      ['Aa', 'B'],
      ['A', 'Bb'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
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
        B: {
          startId: VariantGrid.toNodeId({
            x: 1,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 1,
          }),
          groupId: 'B',
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
        [VariantGrid.toNodeId({
          x: 1,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'B',
        },
      },
    })

    const isSame = Numberlink.isSame(actual, expected)

    expect(isSame).toBe(true)
  })

  test('3x3 with A terminal and pipes and B terminal and pipes', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', 'B', ' '],
      ['a', 'b', ' '],
      ['A', 'B', ' '],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 0,
            y: 2,
          }),
          groupId: 'A',
        },
        B: {
          startId: VariantGrid.toNodeId({
            x: 1,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 2,
          }),
          groupId: 'B',
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
        [VariantGrid.toNodeId({
          x: 0,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 0,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'B',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 2,
            }),
          }),
          groupId: 'B',
        },
      },
    })

    const isSame = Numberlink.isSame(actual, expected)

    expect(isSame).toBe(true)
  })

  it('should work with 3x3 grid with A terminal and pipes', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' ', ' '],
      ['a', 'B', ' '],
      ['a', ' ', 'A'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 2,
            y: 2,
          }),
          groupId: 'A',
        },
        B: {
          startId: VariantGrid.toNodeId({
            x: 1,
            y: 1,
          }),
          endId: null,
          groupId: 'B',
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
        [VariantGrid.toNodeId({
          x: 0,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 0,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
      },
    })

    expect(Numberlink.isSame(actual, expected)).toBe(true)
  })

  it('should only return grids with the longest paths', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])

    const grids = VariantGridShorthand.toGrids(shorthand)

    const expected = 2
    const actual = grids.length

    expect(actual).toBe(expected)
  })

  it('should be able to find longest path', async () => {
    const shorthand = VariantGridShorthand.init([
      ['A', 'a', 'a'],
      ['a', 'a', 'a'],
      ['a', 'a', 'A'],
    ])

    const actual = VariantGridShorthand.toGrids(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 2,
            y: 2,
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
        [VariantGrid.toNodeId({
          x: 0,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 0,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 0,
          y: 2,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 2,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 2,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 2,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 0,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 2,
              y: 0,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 2,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 2,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 2,
              y: 1,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 2,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 2,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 2,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
      },
    })

    expect(actual.some((actual) => Numberlink.isSame(actual, expected))).toBe(true)
  })

  test('3x3 with A terminal and pipes and B terminal and pipes and C terminal and pipes', () => {
    const shorthand = VariantGridShorthand.init([
      ['A', 'B', 'C'],
      ['a', 'b', 'c'],
      ['A', 'B', 'C'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: {
        A: {
          startId: VariantGrid.toNodeId({
            x: 0,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 0,
            y: 2,
          }),
          groupId: 'A',
        },
        B: {
          startId: VariantGrid.toNodeId({
            x: 1,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 1,
            y: 2,
          }),
          groupId: 'B',
        },
        C: {
          startId: VariantGrid.toNodeId({
            x: 2,
            y: 0,
          }),
          endId: VariantGrid.toNodeId({
            x: 2,
            y: 2,
          }),
          groupId: 'C',
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
        [VariantGrid.toNodeId({
          x: 0,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 0,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 0,
              y: 2,
            }),
          }),
          groupId: 'A',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'B',
        },
        [VariantGrid.toNodeId({
          x: 1,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 2,
            }),
          }),
          groupId: 'B',
        },
        [VariantGrid.toNodeId({
          x: 2,
          y: 0,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 2,
              y: 0,
            }),
            targetId: VariantGrid.toNodeId({
              x: 2,
              y: 1,
            }),
          }),
          groupId: 'C',
        },
        [VariantGrid.toNodeId({
          x: 2,
          y: 1,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 2,
              y: 1,
            }),
            targetId: VariantGrid.toNodeId({
              x: 2,
              y: 2,
            }),
          }),
          groupId: 'C',
        },
      },
    })

    const isSame = Numberlink.isSame(actual, expected)

    expect(isSame).toBe(true)
  })

  test('from grid 3x3', () => {
    const expected = VariantGridShorthand.init([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      ['A', ' ', ' '],
    ])

    const grid = VariantGridShorthand.toGrid(expected)

    const actual = VariantGridShorthand.fromGrid(grid)

    expect(actual).toEqual(expected)
  })

  test('from grid 3x3 with pipes', () => {
    const expected = VariantGridShorthand.init([
      ['A', ' ', ' '],
      ['a', ' ', ' '],
      ['A', ' ', ' '],
    ])

    const grid = VariantGridShorthand.toGrid(expected)

    const actual = VariantGridShorthand.fromGrid(grid)

    expect(actual).toEqual(expected)
  })

  test('from grid 2x2 with pipes and adjacent terminals', () => {
    const expected = VariantGridShorthand.init([
      ['Aa', 'A'],
      [' ', ' '],
    ])

    const grid = VariantGridShorthand.toGrid(expected)

    const actual = VariantGridShorthand.fromGrid(grid)

    expect(actual).toEqual(expected)
  })

  test('from grid 2x2 with pipes and right side adjacent terminals', () => {
    const expected = VariantGridShorthand.init([
      ['A', 'Aa'],
      [' ', ' '],
    ])

    const expectedGrid = VariantGridShorthand.toGrid(expected)

    const actual = VariantGridShorthand.fromGrid(expectedGrid)

    const actualGrid = VariantGridShorthand.toGrid(actual)

    expect(Numberlink.isSame(actualGrid, expectedGrid)).toBe(true)
  })

  test('from grid 2x3', () => {
    const expected = VariantGridShorthand.init([
      ['A', ' '],
      [' ', ' '],
      [' ', 'A'],
    ])

    const grid = VariantGridShorthand.toGrid(expected)

    const actual = VariantGridShorthand.fromGrid(grid)

    expect(actual).toEqual(expected)
  })

  test('creating pipes', () => {
    const grid = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      ['a', 'a', 'A'],
    ])

    const pipeline = Numberlink.toPipelineFromGroupId(grid, 'A')
    expect(pipeline.length).toEqual(2)
  })

  test.todo('from grid 2x3', () => {
    const shorthand = VariantGridShorthand.init([
      ['A', ' '],
      [' ', 'a'],
      [' ', 'A'],
    ])

    const actual = VariantGridShorthand.toGrid(shorthand)

    const expected = VariantGrid.init({
      dimensions: VariantGridShorthand.toDimensions(shorthand),
      terminalsByGroupId: actual.terminalsByGroupId,
      pipesBySourceId: {
        [VariantGrid.toNodeId({
          x: 1,
          y: 2,
        })]: {
          edgeId: Numberlink.toEdgeId({
            sourceId: VariantGrid.toNodeId({
              x: 1,
              y: 2,
            }),
            targetId: VariantGrid.toNodeId({
              x: 1,
              y: 1,
            }),
          }),
          groupId: 'A',
        },
      },
    })

    expect(Numberlink.isSame(actual, expected)).toEqual(true)
  })
})
