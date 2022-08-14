import { Keyboard, Option } from "../../Core"
import * as Position from "./Position"

export type Direction = "left" | "up" | "right" | "down"

export const toVector = (direction: Direction): Position.Position => {
  switch (direction) {
    case "down":
      return { x: 0, y: 1 }

    case "left":
      return { x: -1, y: 0 }

    case "right":
      return { x: 1, y: 0 }

    case "up":
      return { x: 0, y: -1 }
  }
}

export const directions: { [direction in Direction]: Direction } = {
  left: "left",
  right: "right",
  up: "up",
  down: "down",
}

export const fromKey = (key: Keyboard.Key): Option.Option<Direction> => {
  switch (key) {
    case "w":
    case "W":
      return Option.Some("up")

    case "s":
    case "S":
      return Option.Some("down")

    case "a":
    case "A":
      return Option.Some("left")

    case "d":
    case "D":
      return Option.Some("right")

    default:
      return Option.None
  }
}

export const toOpposite = (direction: Direction): Direction => {
  switch (direction) {
    case "down":
      return "up"

    case "left":
      return "right"

    case "right":
      return "left"

    case "up":
      return "down"
  }
}

export const isOpposite = (a: Direction, b: Direction): boolean => {
  return toOpposite(a) === b
}
