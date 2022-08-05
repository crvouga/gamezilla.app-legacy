import { Result } from "../Core"

export type UserId = string & { _opaque: typeof UserId }

declare const UserId: unique symbol

export const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string"
}

type Problem = "invalid_user_id"

export const decode = (id: unknown): Result.Result<Problem, UserId> => {
  if (is(id)) {
    return Result.Ok(id)
  }
  return Result.Err("invalid_user_id")
}
