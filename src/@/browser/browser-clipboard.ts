import { IO } from '../program/io'
import { Result } from '../core'

export type CopyResult = Result<Problem, null>

export type Problem = { message: string }

export const copy =
  (text: string): IO<CopyResult> =>
  async () => {
    try {
      await navigator.clipboard.writeText(text)
      return Result.Ok(null)
    } catch {
      return Result.Err({
        message: 'Failed to copy to clipboard.'
      })
    }
  }
