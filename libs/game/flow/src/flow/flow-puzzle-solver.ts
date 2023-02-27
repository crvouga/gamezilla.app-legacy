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
      const color = column[y];
      if (!color) {
        continue;
      }
    }
  }

  return solutions;
};

const modelToKey = (model: ModelUnsolved) => {
  return model.map((column) => column.join(',')).join(',');
};

export function* generateSolutions(
  model: ModelUnsolved,
  solved: Set<string> = new Set()
): Generator<ModelSolved> {
  if (solved.has(modelToKey(model))) {
    return;
  }

  if (isSolved(model)) {
    solved.add(modelToKey(model));
    yield model;
    return;
  }

  for (const start of generateAllPositions(model)) {
    const color = model[start.x]?.[start.y];
    if (!color) {
      continue;
    }

    const end = findEndPosition(model, start);

    if (!end) {
      // invalid model
      continue;
    }

    if (end.x === start.x && end.y === start.y) {
      // invalid model
      continue;
    }

    if (isConnected(model, color, start, end)) {
      continue;
    }

    for (const path of allPaths(color, model, start, end, new Set(), [])) {
      const added = addPath(model, color, path);
      yield* generateSolutions(added, solved);
    }
  }
}

export const isConnected = (
  model: ModelUnsolved,
  color: string,
  current: Position,
  target: Position,
  visited: Set<string> = new Set()
) => {
  visited.add(toKey(current));

  if (current.x === target.x && current.y === target.y) {
    return true;
  }

  for (const delta of deltas) {
    const neighbor = { x: current.x + delta.x, y: current.y + delta.y };
    const neighborColor = model[neighbor.x]?.[neighbor.y];

    if (visited.has(toKey(neighbor))) {
      continue;
    }

    if (neighborColor !== color) {
      continue;
    }

    const isNeighborConnected = isConnected(
      model,
      color,
      neighbor,
      target,
      visited
    );

    if (isNeighborConnected) {
      return true;
    }
  }

  return false;
};

export const isSolved = (model: ModelUnsolved): model is ModelSolved => {
  const checkedColors = new Set<string>();
  for (const position of generateAllPositions(model)) {
    const color = model[position.x]?.[position.y];

    if (!color) {
      return false;
    }

    if (checkedColors.has(color)) {
      continue;
    }

    checkedColors.add(color);

    const end = findEndPosition(model, position);

    if (!end) {
      return false;
    }

    const isColorConnected = isConnected(model, color, position, end);

    if (!isColorConnected) {
      return false;
    }
  }

  return true;
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
  targetColor: string,
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

      const neighborColor = model[neighbor.x]?.[neighbor.y];

      const isOutOfBounds = neighborColor === undefined;
      if (isOutOfBounds) {
        continue;
      }

      const isObstacle =
        typeof neighborColor === 'string' && neighborColor !== targetColor;
      if (isObstacle) {
        continue;
      }

      if (visited.has(toKey(neighbor))) {
        continue;
      }

      yield* allPaths(targetColor, model, neighbor, end, visited, path);
    }
  }
  path.pop();
  visited.delete(toKey(start));
}

const setColor = (
  model: ModelUnsolved,
  position: Position,
  color: string | null
) => {
  return model.map((column, x) =>
    column.map((colorPrev, y) =>
      x === position.x && y === position.y ? color : colorPrev
    )
  );
};

export const addPath = (
  model: ModelUnsolved,
  color: string,
  path: Position[]
): ModelUnsolved => {
  return path.reduce(
    (modelNew, position) => setColor(modelNew, position, color),
    model
  );
};

export type PathSlot = '⬇️' | '⬆️' | '➡️' | '⬅️' | '✅' | '  ';

export const modelToString = (model: ModelUnsolved): string => {
  return model
    .map((column) => column.map((color) => (color ? color : '_')).join(' '))
    .join('\n');
};

export const toPathGrid = (
  model: ModelUnsolved,
  path: Position[]
): PathSlot[][] => {
  return model.map((column, x) =>
    column.map((color, y) => {
      if (!color) {
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

export const findEndPosition = (
  model: ModelUnsolved,
  start: Position
): Position | null => {
  for (const position of generateAllPositions(model)) {
    if (position.x === start.x && position.y === start.y) {
      continue;
    }

    const color = model[position.x]?.[position.y];

    if (color === model[start.x]?.[start.y]) {
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
      const color = column[y];
      if (!color) {
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
    const currentColor = currentPath[currentPath.length - 1];
    if (!currentColor) {
      continue;
    }
    if (currentColor.x === end.x && currentColor.y === end.y) {
      yield currentPath;
    }
    visited.add(toKey(currentColor));
    // const adjacentColors = getAdjacentColors(currentColor, grid.length);
    // for (const adjacent of adjacentColors) {
    //   const isVisited = visited.has(toKey(adjacent));
    //   if (!isVisited && grid[adjacent.y][adjacent.x] === 0) {
    //     const newPath = [...currentPath, adjacent];
    //     stack.push(newPath);
    //   }
    // }
  }
}
