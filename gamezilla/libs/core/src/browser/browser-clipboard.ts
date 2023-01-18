import { Result } from "../result-"
import { Task } from "../task-"

export type CopyResult = Result<Problem, {}>

export type Problem = { message: string }

export const copy =
  (text: string): Task<CopyResult> =>
    async () => {
      try {
        await navigator.clipboard.writeText(text)
        return Result.Ok({})
      } catch {
        return Result.Err({ message: "Failed to copy to clipboard." })
      }
    }
