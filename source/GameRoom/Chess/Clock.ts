import * as Board from "./Board"

export type Clock = {
  preset: Preset
  times: {
    [color in Board.Color]: Seconds
  }
}

export type Seconds = number & { _type: "Seconds" }

export const decrement = (color: Board.Color, clock: Clock): Clock => {
  return {
    ...clock,
    [color]: toSeconds(Math.max(0, clock.times[color] - 1)),
  }
}

export const toTime = (color: Board.Color, clock: Clock): Seconds => {
  return clock.times[color]
}

export const toSeconds = (seconds: number): Seconds => {
  return seconds as Seconds
}

export type Preset = "Bullet" | "Blitz" | "Fast"

export const presets: { [preset in Preset]: Preset } = {
  Bullet: "Bullet",
  Blitz: "Blitz",
  Fast: "Fast",
}

export const presetToSeconds: { [preset in Preset]: Seconds } = {
  Bullet: toSeconds(60 * 1),
  Blitz: toSeconds(60 * 3),
  Fast: toSeconds(60 * 10),
}

export const presetToClock = (preset: Preset): Clock => {
  const seconds = presetToSeconds[preset]
  return {
    preset,
    times: {
      w: seconds,
      b: seconds,
    }
  }
}

export const presetToString = (preset: Preset): string => {
  const minutes = presetToSeconds[preset] / 60

  return `${minutes} min`
}

export const formatSeconds = (seconds: Seconds): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${formatTwoDigits(remainingSeconds)}`
}

const formatTwoDigits = (number: number): string => {
  if (number < 10) {
    return `0${number}`
  }
  return `${number}`
}
