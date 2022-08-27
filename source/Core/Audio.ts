import { pipe } from "./pipe"
import * as Result from "./Result"
import * as Task from "./Task"
import * as Cmd from "./Cmd"
import { Unit } from "./Utility"

export type Problem = "Unknown"

export type PlayResult = Result.Result<Problem, Unit>

export const play = <msg>(src: string, mapper: (result: PlayResult) => msg) =>
  pipe(
    playTask(src),
    Cmd.perform((result) => mapper(result)),
  )

const playTask =
  (src: string): Task.Task<PlayResult> =>
  async () => {
    try {
      const audio = new Audio(src)
      audio.autoplay = true
      audio.src = src
      await audio.play()

      return Result.Ok(Unit)
    } catch (error) {
      return Result.Err("Unknown")
    }
  }
