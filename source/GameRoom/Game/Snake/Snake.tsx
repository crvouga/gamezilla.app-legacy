import * as Direction from "./Direction"
import * as Position from "./Position"

//
//
//
// Model
//
//
//

export type Model = {
  status: Status
  head: Position.Position
  tail: Position.Position[]
  food: Position.Position
  tailLength: number
  foodEatenCount: number
  tickRate: number
  direction: Direction.Direction
  directionQueue: Direction.Direction[]
  bounds: {
    lower: Position.Position
    upper: Position.Position
  }
}

export type Status = "Paused" | "Playing"

export type MouseStatus = "active" | "inactive"

//
//
//
// Init
//
//
//

const bounds: Model['bounds'] = {
  lower: {
    x: 0,
    y: 0,
  },
  upper: {
    x: 12,
    y: 21,
  },
}

const head: Model['head'] = {
  x: Math.floor((bounds.upper.x - bounds.lower.x) / 2) - 3,
  y: Math.floor((bounds.upper.y - bounds.lower.y) / 2),
}

const tail: Model['tail'] = [Position.subtract(head, { x: 1, y: 0 }), Position.subtract(head, { x: 2, y: 0 })]

const food: Model['food'] = Position.add(head, { x: 3, y: 0 })

export const init: Model = {
  status: "Paused",
  tickRate: 1000 / 6,
  head,
  tail,
  food,
  tailLength: 4,
  foodEatenCount: 0,
  direction: "right",
  directionQueue: [],
  bounds
}


//
//
//
// Update
//
//
//

const circularIndex = (index: number, length: number): number => {
  return ((index % length) + length) % length
}

const circular = (
  model: Model,
  position: Position.Position,
): Position.Position => {
  return {
    x: circularIndex(position.x, model.bounds.upper.x),
    y: circularIndex(position.y, model.bounds.upper.y),
  }
}

export const enqueueDirection = (
  direction: Direction.Direction,
  model: Model,
): Model => {
  const directionQueueNew = unqiue(
    [...model.directionQueue, direction].slice(0, 2),
  )

  return {
    ...model,
    directionQueue: directionQueueNew,
  }
}

export const toEmptyPositions = (model: Model) => {
  const snake = [model.head, ...model.tail]
  return Position.range(model.bounds).filter((position) =>
    snake.every((snakePosition) => !Position.equals(position, snakePosition)),
  )
}

export const step = (model: Model): Model => {
  const tailNew = [model.head]
    .concat(model.tail)
    .slice(0, model.tailLength)
    .map((position) => circular(model, position))

  const queuedDirection = model.directionQueue[0] ?? model.direction

  const [_, ...directionQueueNew] = model.directionQueue

  const directionNew = Direction.isOpposite(queuedDirection, model.direction)
    ? model.direction
    : queuedDirection

  const headNew = circular(
    model,
    Position.add(model.head, Direction.toVector(directionNew)),
  )

  const isSnakeEatingFood = [headNew, ...tailNew].some((position) =>
    Position.equals(position, model.food),
  )

  const foodNew = isSnakeEatingFood
    ? shuffle(toEmptyPositions(model))[0] ?? model.food
    : model.food

  const tailLengthNew = isSnakeEatingFood
    ? model.tailLength + 1
    : model.tailLength

  const foodEatenCountNew = isSnakeEatingFood
    ? model.foodEatenCount + 1
    : model.foodEatenCount

  return {
    ...model,
    head: headNew,
    tail: tailNew,
    food: foodNew,
    tailLength: tailLengthNew,
    foodEatenCount: foodEatenCountNew,
    directionQueue: directionQueueNew,
    direction: directionNew,
  }
}

const shuffle = <T,>(xs: T[]): T[] => {
  const ys = [...xs]

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1))

  return ys
}

const unqiue = <T,>(as: T[]): T[] => {
  return Array.from(new Set(as))
}



//
//
//
// View
//
//
//

export const theme = {
  light: "#AAD751",
  dark: "#A2D149",
  snake: "#4573E8",
  apple: "#E7471D",
}

export const draw = (
  { width, height }: { width: number; height: number },
  model: Model,
  ctx: CanvasRenderingContext2D,
): void => {
  const tileWidth = width / (model.bounds.upper.x - model.bounds.lower.x)
  const tileHeight = height / (model.bounds.upper.y - model.bounds.lower.y)

  ctx.canvas.width = width
  ctx.canvas.height = height

  ctx.fillStyle = theme.light
  ctx.fillRect(0, 0, width, height)

  for (const position of Position.range(model.bounds)) {
    ctx.fillStyle = theme[toTileVariant(position)]
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight,
    )
  }

  for (const position of [model.food]) {
    ctx.fillStyle = theme.apple
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight,
    )
  }

  for (const position of [model.head, ...model.tail]) {
    ctx.fillStyle = theme.snake
    ctx.strokeStyle = theme.snake
    ctx.strokeRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight,
    )
    ctx.fillRect(
      position.x * tileWidth,
      position.y * tileHeight,
      tileWidth,
      tileHeight,
    )
  }
}

export type TileVariant = "light" | "dark"

export const toTileVariant = (position: Position.Position): TileVariant => {
  if (
    (isEven(position.x) && isOdd(position.y)) ||
    (isOdd(position.x) && isEven(position.y))
  ) {
    return "light"
  }
  return "dark"
}

const isEven = (x: number) => x % 2 === 0

const isOdd = (x: number) => !isEven(x)
