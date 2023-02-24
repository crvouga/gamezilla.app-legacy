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

  for (const [start, end] of generateAllNonConnectedPair(model)) {
    for (const pathAdded of generateAllPossiblePaths(model, start, end)) {
      yield* generateSolutions(pathAdded);
    }
  }
}

function* generateAllNonConnectedPair(
  model: ModelUnsolved
): Generator<[Position, Position]> {
  for (const start of generateAllPositions(model)) {
    const cell = model[start.x]?.[start.y];
    if (!cell) {
      continue;
    }

    const end = findEndPosition(model, start);

    if (!end) {
      // impossible
      continue;
    }

    if (isConnected(model, start, end)) {
      continue;
    }

    yield [start, end];
  }
}

const isSolved = (model: ModelUnsolved): model is ModelSolved => {
  return model.every((column) => column.every((cell) => cell !== null));
};

function* generateAllPossiblePaths(
  _model: ModelUnsolved,
  _start: Position,
  _end: Position
): Generator<ModelUnsolved> {
  yield _model;
}

const isConnected = (
  model: ModelUnsolved,
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
    for (const neighbor of getNeighbors(model, current)) {
      stack.push(neighbor);
    }
  }
  return false;
};

const getNeighbors = (model: ModelUnsolved, position: Position): Position[] => {
  const neighbors: Position[] = [];
  const { x, y } = position;
  if (model[x - 1]?.[y]) {
    neighbors.push({ x: x - 1, y });
  }
  if (model[x + 1]?.[y]) {
    neighbors.push({ x: x + 1, y });
  }
  if (model[x]?.[y - 1]) {
    neighbors.push({ x, y: y - 1 });
  }
  if (model[x]?.[y + 1]) {
    neighbors.push({ x, y: y + 1 });
  }
  return neighbors;
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
