export type Position = {
  x: number
  y: number
}

const add = (a: Position, b: Position): Position => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

const range = (exclusiveUpperBounds: { x: number; y: number }): Position[] => {
  const positions: Position[] = []

  for (let x = 0; x < exclusiveUpperBounds.x; x++) {
    for (let y = 0; y < exclusiveUpperBounds.y; y++) {
      positions.push({
        x,
        y,
      })
    }
  }

  return positions
}

const toKey = (position: Position): string => {
  return [position.x, position.y].join('-')
}

export type Bounds = {
  lower: Position
  upper: Position
}

const inclusiveContains = ({ lower, upper }: Bounds, position: Position): boolean => {
  return lower.x <= position.x && position.x <= upper.x && lower.y <= position.y && position.y <= upper.y
}

const sub = (a: Position, b: Position): Position => {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

const toDirection = ({ from, to }: { from: Position; to: Position }): Direction | null => {
  const diff = sub(to, from)

  if (diff.x > 0) {
    return 'East'
  }

  if (diff.x < 0) {
    return 'West'
  }

  if (diff.y > 0) {
    return 'South'
  }

  if (diff.y < 0) {
    return 'North'
  }

  return null
}
export const random = (gen: () => number, { lower, upper }: Bounds) => {
  const x = Math.floor(gen() * (upper.x - lower.x)) + lower.x
  const y = Math.floor(gen() * (upper.y - lower.y)) + lower.y
  return {
    x,
    y,
  }
}

export const eq = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y
}

export const Position = {
  eq,
  add,
  sub,
  random,
  range,
  toKey,
  toDirection,
  inclusiveContains,
}

export type Direction = 'North' | 'South' | 'East' | 'West'

const all: Direction[] = ['East', 'North', 'South', 'West']

const toVector = (direction: Direction): Position => {
  switch (direction) {
    case 'East': {
      return {
        x: 1,
        y: 0,
      }
    }
    case 'West': {
      return {
        x: -1,
        y: 0,
      }
    }
    case 'North': {
      return {
        x: 0,
        y: -1,
      }
    }
    case 'South': {
      return {
        x: 0,
        y: 1,
      }
    }
  }
}

export const Direction = {
  toVector,
  all,
}
