export type Position = { x: number; y: number };

export const range = ({
  lower,
  upper,
}: {
  lower: Position;
  upper: Position;
}): Position[] => {
  const positions: Position[] = [];

  for (let x = lower.x; x < upper.x; x++) {
    for (let y = lower.y; y < upper.y; y++) {
      positions.push({ x, y });
    }
  }

  return positions;
};

export const add = (a: Position, b: Position): Position => {
  return { x: a.x + b.x, y: a.y + b.y };
};

export const scale = (scaleFactor: Position, a: Position): Position => {
  return { x: a.x * scaleFactor.x, y: a.y * scaleFactor.y };
};

export const equals = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y;
};
