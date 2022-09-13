import { Result } from "../Core"

export type Username = string & { _opaque: typeof Username }

declare const Username: unique symbol

export const is = (username: unknown): username is Username => {
  return (
    typeof username === "string" &&
    username.length > 0 &&
    username.length <= 100
  )
}

type Problem = "invalid_username"

export const decode = (username: unknown): Result.Result<Problem, Username> => {
  if (is(username)) {
    return Result.Ok(username)
  }
  return Result.Err("invalid_username")
}
