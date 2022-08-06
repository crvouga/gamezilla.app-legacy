import { Cmd, exhaustive, Keyboard, Sub, Time } from "../../Core"
import * as Route from "../../Route"
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
  mouseStatus: MouseStatus
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
  touched?: Position.Position
}

type Status = { type: "Paused" } | { type: "Playing" }

type MouseStatus = "active" | "inactive"

//
//
//
// Init
//
//
//

export const init: Model = {
  status: { type: "Paused" },
  mouseStatus: "inactive",
  tickRate: 1000 / 7,
  head: { x: 4, y: 6 },
  tail: [
    { x: 3, y: 6 },
    { x: 2, y: 6 },
  ],
  food: { x: 7, y: 6 },
  tailLength: 4,
  foodEatenCount: 0,
  direction: "right",
  directionQueue: [],
  bounds: {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 12,
      y: 21,
    },
  },
}

//
//
//
// Msg
//
//
//

export type Msg =
  | ["Elapsed"]
  | ["ClickedBack"]
  | ["ClickedRestart"]
  | ["ClickedToggle"]
  | ["AudioFailed"]
  | ["AudioSucceeded"]
  | ["MouseDownBoard"]
  | ["MouseUpBoard"]
  | ["PressedKeyDown", Keyboard.Key]
  | ["MouseMovedBoard", Position.Position]
  | ["TouchMoveBoard", Position.Position]

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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedRestart":
      return [init, Cmd.None]

    case "Elapsed":
      switch (model.status.type) {
        case "Paused":
          return [model, Cmd.None]

        case "Playing":
          return [updatePlaying(model), Cmd.None]
      }

    case "ClickedBack":
      return [model, Route.back]

    case "MouseUpBoard":
      return [{ ...model, mouseStatus: "inactive" }, Cmd.None]

    case "MouseDownBoard":
      return [{ ...model, mouseStatus: "active" }, Cmd.None]

    case "PressedKeyDown":
      const statusNew: Status =
        msg[1] === "Space"
          ? model.status.type === "Paused"
            ? { type: "Playing" }
            : { type: "Paused" }
          : model.status

      const directionFromKey = Direction.fromKey(msg[1], model.direction)

      return [
        enqueueDirection(directionFromKey, {
          ...model,
          status: statusNew,
        }),
        Cmd.None,
      ]

    case "ClickedToggle":
      switch (model.status.type) {
        case "Paused":
          return [{ ...model, status: { type: "Playing" } }, Cmd.None]

        case "Playing":
          return [{ ...model, status: { type: "Paused" } }, Cmd.None]
      }

    case "AudioFailed":
      return [model, Cmd.None]

    case "AudioSucceeded":
      return [model, Cmd.None]

    case "MouseMovedBoard":
    case "TouchMoveBoard":
      const previous = model.touched

      if (!previous) {
        return [{ ...model, touched: msg[1] }, Cmd.None]
      }

      const touchedNew = msg[1]

      const delta = Position.subtract(previous, touchedNew)

      const maxDeltaMagnitude = Math.max(Math.abs(delta.x), Math.abs(delta.y))

      if (maxDeltaMagnitude < 4) {
        return [{ ...model, touched: touchedNew }, Cmd.None]
      }

      const xDirection = delta.x > 0 ? "left" : "right"

      const yDirection = delta.y > 0 ? "up" : "down"

      const directionFromSwipe =
        Math.abs(delta.x) > Math.abs(delta.y) ? xDirection : yDirection

      return [
        enqueueDirection(directionFromSwipe, {
          ...model,
          touched: touchedNew,
        }),
        Cmd.None,
      ]

    default:
      return exhaustive(msg[0])
  }
}

const enqueueDirection = (
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

const toEmptyPositions = (model: Model) => {
  const snake = [model.head, ...model.tail]
  return Position.range(model.bounds).filter((position) =>
    snake.every((snakePosition) => !Position.equals(position, snakePosition)),
  )
}

const updatePlaying = (model: Model): Model => {
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

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model.status.type) {
    case "Paused":
      return Sub.None

    case "Playing":
      return Sub.batch([Time.every<Msg>(model.tickRate, () => ["Elapsed"])])
  }
}

//
//
//
// Helpers
//
//
//

const shuffle = <T>(xs: T[]): T[] => {
  const ys = [...xs]

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1))

  return ys
}
const isEven = (x: number) => x % 2 === 0

const isOdd = (x: number) => !isEven(x)

const unqiue = <T>(as: T[]): T[] => {
  return Array.from(new Set(as))
}
