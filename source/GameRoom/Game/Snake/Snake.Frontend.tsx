import { useLayoutEffect, useRef } from "react"
import {
  Option,
  Audio,
  Cmd,
  exhaustive,
  Keyboard,
  pipe,
  Result,
  Sub
} from "../../../Core"
import * as Direction from "../../../Games/Snake/Direction"
import * as Position from "../../../Games/Snake/Position"
import * as Route from "../../../Route"
import * as UI from "../../../UI"

import { FrontendModel, FrontendMsg, initSharedModel, Status, ToFrontend } from "./Snake.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
  ...initSharedModel,
  mouseStatus: 'inactive', 
  touched: Option.None
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg



export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedRestart":
      return [init, Cmd.None]

    case "ClickedBack":
      return [model, Route.back]

    case "MouseUpBoard":
      return [model, Cmd.None]
      

    case "MouseDownBoard":
      return [model, Cmd.None]
      

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
      return [model, Cmd.None]
      // const previous = model.touched

      // if (!previous) {
      //   return [{ ...model, touched: msg[1] }, Cmd.None]
      // }

      // const touchedNew = msg[1]

      // const delta = Position.subtract(previous, touchedNew)

      // const maxDeltaMagnitude = Math.max(Math.abs(delta.x), Math.abs(delta.y))

      // if (maxDeltaMagnitude < 4) {
      //   return [{ ...model, touched: touchedNew }, Cmd.None]
      // }

      // const xDirection = delta.x > 0 ? "left" : "right"

      // const yDirection = delta.y > 0 ? "up" : "down"

      // const directionFromSwipe =
      //   Math.abs(delta.x) > Math.abs(delta.y) ? xDirection : yDirection

      // return [
      //   enqueueDirection(directionFromSwipe, {
      //     ...model,
      //     touched: touchedNew,
      //   }),
      //   Cmd.None,
      // ]

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


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'Sync': {
      const x = msg[1]
      return [model, Cmd.None]
      
    }
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
  return Keyboard.keyDowns<Msg>((key) => ["PressedKeyDown", key])
}



//
//
//
// View
//
//
//

const theme = {
  light: "#AAD751",
  dark: "#A2D149",
  snake: "#4573E8",
  apple: "#E7471D",
}

export const view =
  (model: Model): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.FillBox>
        <Board
          model={model}
          dispatch={dispatch}
        />
      </UI.FillBox>
    )
  }

export const Board = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      const dpi = 1000
      ctx.scale(dpi, dpi)

      const width = canvas.width
      const height = canvas.height

      draw({ width, height }, model, ctx)
    }
  }, [model])

  return (
    <UI.Box sx={{ flex: 1, width: "100%", userSelect: "none" }}>
      <canvas
        style={{
          // cursor: model.mouseStatus === "active" ? "grabbing" : "grab",
          userSelect: "none",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: "100%",
        }}
        ref={ref}
        onMouseDown={() => {
          dispatch(["MouseDownBoard"])
        }}
        onMouseUp={() => {
          dispatch(["MouseUpBoard"])
        }}
        onMouseMove={(event) => {
          // if (model.mouseStatus === "active") {
          //   const x = event.clientX
          //   const y = event.clientY
          //   dispatch(["MouseMovedBoard", { x, y }])
          // }
        }}
        onClick={() => {}}
        onTouchMove={(event) => {
          const touch = event.touches[0]
          if (touch) {
            const x = touch.clientX
            const y = touch.clientY
            dispatch(["TouchMoveBoard", { x, y }])
          }
        }}
      />
    </UI.Box>
  )
}

const draw = (
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

type TileVariant = "light" | "dark"

const toTileVariant = (position: Position.Position): TileVariant => {
  if (
    (isEven(position.x) && isOdd(position.y)) ||
    (isOdd(position.x) && isEven(position.y))
  ) {
    return "light"
  }
  return "dark"
}

const toViewBox = ({ lower, upper }: Model["bounds"]) =>
  [lower.x, lower.y, upper.x, upper.y].join(", ")

export const CoverArt = () => {
  const bounds: Model["bounds"] = {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 4,
      y: 4,
    },
  }

  const tail: Model["tail"] = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ]

  const food: Model["food"] = { x: 2, y: 2 }

  return (
    <svg
      width="100%"
      viewBox={toViewBox(bounds)}
    >
      {Position.range(bounds).map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme[toTileVariant({ x, y })]}
          stroke="none"
        />
      ))}

      {tail.map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme.snake}
          stroke="none"
        />
      ))}

      {[food].map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme.apple}
          stroke="none"
        />
      ))}
    </svg>
  )
}

//
//
//
// Sounds
//
//
//

export const playSound = (src: string) => {
  return pipe(
    Audio.play(src),
    Cmd.fromTask(
      Result.fold<{}, {}, Msg>(
        () => ["AudioFailed"],
        () => ["AudioSucceeded"],
      ),
    ),
  )
}
//
//
//
// Helpers
//
//
//

const shuffle = <T,>(xs: T[]): T[] => {
  const ys = [...xs]

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1))

  return ys
}
const isEven = (x: number) => x % 2 === 0

const isOdd = (x: number) => !isEven(x)

const unqiue = <T,>(as: T[]): T[] => {
  return Array.from(new Set(as))
}
