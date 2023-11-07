export type Position = {
  x: number;
  y: number;
};

const range = ({ maxY, maxX }: { maxY: number; maxX: number }): Position[] => {
  const positions: Position[] = [];
  for (let x = 0; x < maxX; x++) {
    for (let y = 0; y < maxY; y++) {
      positions.push({ x, y });
    }
  }
  return positions;
};

const add = (a: Position, b: Position): Position => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
};

export const Position = {
  range,
  add,
};
