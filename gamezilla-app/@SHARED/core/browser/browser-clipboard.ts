import { IO } from "../io"
import { Result } from "../result"

export type CopyResult = Result<Problem, null>

export type Problem = { message: string }

export const copy =
  (text: string): IO<CopyResult> =>
  async () => {
    try {
      await navigator.clipboard.writeText(text)
      return Result.ok(null)
    } catch {
      return Result.err({ message: "Failed to copy to clipboard." })
    }
  }
