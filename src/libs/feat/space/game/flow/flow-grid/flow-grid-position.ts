export type Position = { x: number; y: number };

export type Bounds = {
  min: Position;
  max: Position;
};

export const bounds8x8: Bounds = {
  min: { x: 0, y: 0 },
  max: { x: 8, y: 8 },
};

export const yieldRange = function* ({
  bounds,
}: {
  bounds: Bounds;
}): Generator<Position> {
  for (let x = bounds.min.x; x < bounds.max.x; x++) {
    for (let y = bounds.min.y; y < bounds.max.y; y++) {
      yield { x, y };
    }
  }
};

export const deltas: Position[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];
