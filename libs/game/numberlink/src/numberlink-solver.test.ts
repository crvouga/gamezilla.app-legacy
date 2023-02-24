import {
  addPath,
  allPaths,
  findEndPosition,
  ModelUnsolved,
  PathSlot,
  Position,
  toPathGrid,
} from './numberlink-solver';

const _ = null;
const a = 'a';
const s = 'a';
const e = 'a';
const unsolved: ModelUnsolved = [
  [a, _, _, _, _],
  [_, '4', '5', '3', '4'],
  [_, '5', _, _, '3'],
  [_, _, _, _, _],
  ['2', _, _, '2', a],
];

describe('numberlink solver', () => {
  it('finds the end position', () => {
    const start: Position = { x: 0, y: 0 };
    const expected: Position = { x: 4, y: 4 };
    const actual = findEndPosition(unsolved, start);
    expect(actual).toEqual(expected);
  });

  it('generates all possible paths for 2x2 grid', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 1, y: 1 };
    const input: ModelUnsolved = [
      [s, _],
      [_, e],
    ];

    const expected: ModelUnsolved[] = [
      [
        [s, _],
        [a, e],
      ],
      [
        [s, a],
        [_, e],
      ],
    ];

    const paths = Array.from(allPaths(input, start, end, new Set(), []));
    expect(paths.length).toEqual(expected.length);
    for (const path of paths) {
      const actual = addPath(input, a, path);
      expect(expected).toContainEqual(actual);
    }
  });

  it('generates all possible paths for 3x3 grid', () => {
    const input: ModelUnsolved = [
      ['1', null, null],
      [null, null, null],
      [null, null, '1'],
    ];
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };

    const expected: PathSlot[][][] = [
      [
        ['⬇️', '  ', '  '],
        ['⬇️', '  ', '  '],
        ['➡️', '➡️', '✅'],
      ],
      [
        ['➡️', '➡️', '⬇️'],
        ['  ', '  ', '⬇️'],
        ['  ', '  ', '✅'],
      ],
      [
        ['⬇️', '  ', '  '],
        ['⬇️', '➡️', '⬇️'],
        ['➡️', '⬆️', '✅'],
      ],
      [
        ['⬇️', '➡️', '⬇️'],
        ['⬇️', '⬆️', '⬇️'],
        ['➡️', '⬆️', '✅'],
      ],
      [
        ['➡️', '➡️', '⬇️'],
        ['⬇️', '⬅️', '⬅️'],
        ['➡️', '➡️', '✅'],
      ],
      [
        ['➡️', '⬇️', '  '],
        ['  ', '➡️', '⬇️'],
        ['  ', '  ', '✅'],
      ],
      [
        ['➡️', '⬇️', '  '],
        ['  ', '⬇️', '  '],
        ['  ', '➡️', '✅'],
      ],
      [
        ['⬇️', '  ', '  '],
        ['➡️', '➡️', '⬇️'],
        ['  ', '  ', '✅'],
      ],
      [
        ['➡️', '⬇️', '  '],
        ['⬇️', '⬅️', '  '],
        ['➡️', '➡️', '✅'],
      ],
      [
        ['⬇️', '➡️', '⬇️'],
        ['➡️', '⬆️', '⬇️'],
        ['  ', '  ', '✅'],
      ],
      [
        ['➡️', '➡️', '⬇️'],
        ['  ', '⬇️', '⬅️'],
        ['  ', '➡️', '✅'],
      ],
      [
        ['⬇️', '  ', '  '],
        ['➡️', '⬇️', '  '],
        ['  ', '➡️', '✅'],
      ],
    ];

    const paths = Array.from(allPaths(input, start, end, new Set(), []));
    const actual = paths.map((path) =>
      toPathGrid(addPath(input, a, path), path)
    );

    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(paths.length).toEqual(expected.length);
  });
  it('should solve a simple puzzle', () => {
    // const unsolved: ModelUnsolved = [
    //   [a, null, null, null, null],
    //   [null, '4', '5', '3', '4'],
    //   [null, '5', null, null, '3'],
    //   [null, null, null, null, null],
    //   ['2', null, null, '2', a],
    // ];
    // const expected: ModelSolved = [
    //   ['1', '4', '4', '4', '4'],
    //   ['1', '4', '5', '3', '4'],
    //   ['1', '5', '5', '3', '3'],
    //   ['1', '1', '1', '1', '1'],
    //   ['2', '2', '2', '2', '1'],
    // ];
    // const solutions = solve(unsolved);
    // expect(solutions).toEqual([expected]);
  });
});

const difference =
  <T>(eq: (a: T, b: T) => boolean) =>
  (a: T[], b: T[]) => {
    return a.filter((x) => !b.some((y) => eq(x, y)));
  };

const duplicates =
  <T>(eq: (a: T, b: T) => boolean) =>
  (a: T[]) => {
    return a.filter((x, i) => a.findIndex((y) => eq(x, y)) !== i);
  };
