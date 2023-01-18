export type Position = {
  x: number
  y: number
}

export const rotate = (position: Position): Position => {
  return {
    x: -position.y,
    y: position.x,
  }
}

export const add = (a: Position, b: Position): Position => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}
