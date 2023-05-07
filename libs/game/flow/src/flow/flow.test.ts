import { ColoredNode, bounds8x8, findEndNode, initGrid, setNode } from './flow';

type TestModel = (string | null)[][];

const puzzle: TestModel = [
  ['🔴', null, null],
  [null, null, null],
  [null, null, '🔴'],
];

describe('flow graph', () => {
  it('create grid graph', () => {
    const grid = initGrid({
      bounds: bounds8x8,
    });

    expect(Object.keys(grid.nodes).length).toEqual(8 * 8);
  });

  it('finds the end position', () => {
    const graph = testModelToGraph(puzzle);

    const startNode = { x: 0, y: 0, color: '🔴' };
    const actual = findEndNode(graph, startNode);
    const expected: ColoredNode = { x: 2, y: 2, color: '🔴' };
    expect(actual).toEqual(expected);
  });
});

//
//
//
//
//
//

const testModelToGraph = (puzzle: TestModel) => {
  let grid = initGrid({
    bounds: {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: puzzle[0]?.length ?? 0,
        y: puzzle.length,
      },
    },
  });

  for (let x = 0; x < puzzle.length; x++) {
    const column = puzzle[x];
    if (!column) {
      continue;
    }
    for (let y = 0; y < column.length; y++) {
      const color = column[y];
      if (!color) {
        continue;
      }

      grid = setNode(grid, {
        x,
        y,
        color,
      });
    }
  }

  return grid;
};
