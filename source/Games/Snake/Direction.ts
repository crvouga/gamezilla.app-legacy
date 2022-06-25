import { Keyboard } from "Core"
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

export const fromKey = (key: Keyboard.Key, fallback: Direction): Direction => {
  switch (key) {
    case "w":
    case "W":
      return "up"

    case "s":
    case "S":
      return "down"

    case "a":
    case "A":
      return "left"

    case "d":
    case "D":
      return "right"

    default:
      return fallback
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
