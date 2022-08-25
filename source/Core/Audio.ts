import * as Result from "./Result"
import * as Task from "./Task"
import { Unit } from "./Utility"

export type Problem = "Unknown"

export type PlayResult = Result.Result<Problem, Unit>

export const play =
  (file: string): Task.Task<PlayResult> =>
  async () => {
    try {
      const audio = new Audio(file)
      audio.autoplay = true
      audio.src = file
      await audio.play()

      return Result.Ok(Unit)
    } catch (error) {
      return Result.Err("Unknown")
    }
  }
