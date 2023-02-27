export type ModelUnsolved = (string | null)[][];

export type ModelSolved = string[][];

export type Position = {
  x: number;
  y: number;
};

export const solve = (model: ModelUnsolved): ModelSolved[] => {
  const solutions: ModelSolved[] = [];

  for (let x = 0; x < model.length; x++) {
    const column = model[x];
    if (!column) {
      continue;
    }
    for (let y = 0; y < column.length; y++) {
      const cell = column[y];
      if (!cell) {
        continue;
      }
    }
  }

  return solutions;
};

export function* generateSolutions(
  model: ModelUnsolved
): Generator<ModelSolved> {
  if (isSolved(model)) {
    yield model;
  }

  for (const start of generateAllPositions(model)) {
    const cell = model[start.x]?.[start.y];
    if (!cell) {
      continue;
    }

    const end = findEndPosition(model, start);

    if (!end) {
      // invalid model
      continue;
    }

    if (isConnected(model, start, end)) {
      continue;
    }

    for (const path of allPaths(cell, model, start, end, new Set(), [])) {
      const added = addPath(model, cell, path);
      yield* generateSolutions(added);
    }
  }
}

const isSolved = (model: ModelUnsolved): model is ModelSolved => {
  return model.every((column) => column.every((cell) => cell !== null));
};

export function* generateAllPossiblePaths(
  model: ModelUnsolved,
  start: Position,
  end: Position
): Generator<ModelUnsolved> {
  const stack: Position[] = [start];
  const path: Position[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      break;
    }

    if (current.x === end.x && current.y === end.y) {
      yield model;
      continue;
    }

    path.push(current);
  }
  yield model;
}

const deltas = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
] as const;

export function* allPaths(
  targetCell: string,
  model: ModelUnsolved,
  start: Position,
  end: Position,
  visited: Set<string>,
  path: Position[]
): Generator<Position[]> {
  path.push(start);
  visited.add(toKey(start));

  if (start.x === end.x && start.y === end.y) {
    const copy = path.map((position) => ({ ...position }));
    yield copy;
  } else {
    for (const delta of deltas) {
      const neighbor = { x: start.x + delta.x, y: start.y + delta.y };

      const neighborCell = model[neighbor.x]?.[neighbor.y];

      const isOutOfBounds = neighborCell === undefined;
      if (isOutOfBounds) {
        continue;
      }

      const isObstacle =
        typeof neighborCell === 'string' && neighborCell !== targetCell;
      if (isObstacle) {
        continue;
      }

      if (visited.has(toKey(neighbor))) {
        continue;
      }

      yield* allPaths(targetCell, model, neighbor, end, visited, path);
    }
  }
  path.pop();
  visited.delete(toKey(start));
}

const setCell = (
  model: ModelUnsolved,
  position: Position,
  cellNew: string | null
) => {
  return model.map((column, x) =>
    column.map((cell, y) =>
      x === position.x && y === position.y ? cellNew : cell
    )
  );
};

export const addPath = (
  model: ModelUnsolved,
  cellNew: string,
  path: Position[]
): ModelUnsolved => {
  return path.reduce(
    (modelNew, position) => setCell(modelNew, position, cellNew),
    model
  );
};

export type PathSlot = '⬇️' | '⬆️' | '➡️' | '⬅️' | '✅' | '  ';

export const modelToString = (model: ModelUnsolved): string => {
  return model
    .map((column) => column.map((cell) => (cell ? cell : '_')).join(' '))
    .join('\n');
};

export const toPathGrid = (
  model: ModelUnsolved,
  path: Position[]
): PathSlot[][] => {
  return model.map((column, x) =>
    column.map((cell, y) => {
      if (!cell) {
        return '  ';
      }

      const position = { x, y };
      const positionIndex = path.findIndex(
        (position) => position.x === x && position.y === y
      );
      if (positionIndex === -1) {
        return '  ';
      }

      const nextPosition = path[positionIndex + 1];

      if (!nextPosition) {
        return '✅';
      }
      const emoji = toDirectionEmoji(sub(nextPosition, position));
      return emoji;
    })
  );
};

export const pathGridToString = (pathGrid: PathSlot[][]): string => {
  return pathGrid.map((row) => row.join(' ')).join('\n');
};

const sub = (a: Position, b: Position): Position => {
  return { x: a.x - b.x, y: a.y - b.y };
};
const toDirectionEmoji = ({ x, y }: Position): PathSlot => {
  if (x === 1 && y === 0) {
    return '⬇️';
  }
  if (x === -1 && y === 0) {
    return '⬆️';
  }
  if (x === 0 && y === 1) {
    return '➡️';
  }
  if (x === 0 && y === -1) {
    return '⬅️';
  }
  return '  ';
};

const isConnected = (
  _model: ModelUnsolved,
  start: Position,
  end: Position
): boolean => {
  const visited = new Set<string>();
  const stack: Position[] = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const key = toKey(current);
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    if (current.x === end.x && current.y === end.y) {
      return true;
    }
  }
  return false;
};

export const findEndPosition = (
  model: ModelUnsolved,
  start: Position
): Position | null => {
  for (const position of generateAllPositions(model)) {
    if (position.x === start.x && position.y === start.y) {
      continue;
    }

    const cell = model[position.x]?.[position.y];

    if (cell === model[start.x]?.[start.y]) {
      return position;
    }
  }
  return null;
};

function* generateAllPositions(model: ModelUnsolved): Generator<Position> {
  for (let x = 0; x < model.length; x++) {
    const column = model[x];
    if (!column) {
      continue;
    }
    for (let y = 0; y < column.length; y++) {
      const cell = column[y];
      if (!cell) {
        continue;
      }
      yield { x, y };
    }
  }
}

const toKey = (position: Position) => `${position.x},${position.y}`;

export function* generateAllPaths(
  _model: ModelUnsolved,
  start: Position,
  end: Position
): Generator<Position[]> {
  const visited = new Set<string>();
  const stack: Position[][] = [[start]];
  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (!currentPath) {
      break;
    }
    const currentCell = currentPath[currentPath.length - 1];
    if (!currentCell) {
      continue;
    }
    if (currentCell.x === end.x && currentCell.y === end.y) {
      yield currentPath;
    }
    visited.add(toKey(currentCell));
    // const adjacentCells = getAdjacentCells(currentCell, grid.length);
    // for (const adjacent of adjacentCells) {
    //   const isVisited = visited.has(toKey(adjacent));
    //   if (!isVisited && grid[adjacent.y][adjacent.x] === 0) {
    //     const newPath = [...currentPath, adjacent];
    //     stack.push(newPath);
    //   }
    // }
  }
}
