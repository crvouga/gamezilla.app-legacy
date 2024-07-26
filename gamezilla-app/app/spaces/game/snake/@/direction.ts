import { type Keyboard, Option } from 'gamezilla-app/@/core'
import type { Position } from './position'

export type Direction = 'left' | 'up' | 'right' | 'down'

const toVector = (direction: Direction): Position => {
  switch (direction) {
    case 'down':
      return {
        x: 0,
        y: 1
      }

    case 'left':
      return {
        x: -1,
        y: 0
      }

    case 'right':
      return {
        x: 1,
        y: 0
      }

    case 'up':
      return {
        x: 0,
        y: -1
      }
  }
}

const directions: { [direction in Direction]: Direction } = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down'
}

const fromKey = (key: Keyboard.Key): Option<Direction> => {
  switch (key) {
    case 'w':
    case 'W':
      return Option.Some('up')

    case 's':
    case 'S':
      return Option.Some('down')

    case 'a':
    case 'A':
      return Option.Some('left')

    case 'd':
    case 'D':
      return Option.Some('right')

    default:
      return Option.None
  }
}

const toOpposite = (direction: Direction): Direction => {
  switch (direction) {
    case 'down':
      return 'up'

    case 'left':
      return 'right'

    case 'right':
      return 'left'

    case 'up':
      return 'down'
  }
}

const isOpposite = (a: Direction, b: Direction): boolean => {
  return toOpposite(a) === b
}

export const Direction = {
  toVector,
  directions,
  fromKey,
  toOpposite,
  isOpposite
}
