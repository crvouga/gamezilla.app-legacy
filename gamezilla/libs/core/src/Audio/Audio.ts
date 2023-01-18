import * as Howler from "howler"
import { Cmd } from "../cmd-"
import { p } from "../pipe"
import { Result } from "../result-"
import { Unit } from "../utils-"

export type Problem = "Unknown"

export type PlayResult = Result<Problem, Unit>

export type PreloadResult = Result<Problem, Unit>

const instances = new Map<string, Howler.Howl>()

const getSoundInstance = (src: string): Howler.Howl => {
  const cached = instances.get(src)

  if (cached) {
    return cached
  }

  const instance = new Howler.Howl({
    preload: true,
    src: [src],
    onplayerror: () => {
      instance.once("unlock", () => {
        if (document.hasFocus()) {
          instance.play()
        }
      })
    },
  })

  instances.set(src, instance)

  return instance
}

export const preload = <msg>(
  srcList: string[],
  mapper: (result: PreloadResult) => msg,
) =>
  p(async () => {
    for (const src of srcList) {
      getSoundInstance(src)
    }
    return Result.Ok(Unit)
  }, Cmd.perform(mapper))

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  p(async () => {
    const sound = getSoundInstance(src)

    if (document.hasFocus()) {
      sound.play()
    }

    return Result.Ok(Unit)
  }, Cmd.perform(mapper))
