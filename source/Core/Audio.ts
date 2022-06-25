import { Task } from "fp-ts/lib/Task"
import * as Result from "./Result"

type Problem = "Unknown"

export const play =
  (file: string): Task<Result.Result<Problem, {}>> =>
  async () => {
    try {
      const audio = new Audio(file)

      await audio.play()

      return Result.Ok({})
    } catch (error) {
      return Result.Err("Unknown")
    }
  }
