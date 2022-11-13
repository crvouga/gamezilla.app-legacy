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

export const decode = (username: unknown): Result<Problem, Username> => {
  if (is(username)) {
    return Result.Ok(username)
  }
  return Result.Err("invalid_username")
}

export const fromString = (username: string): Username => {
  const cleaned = username.substring(0, 100)
  if (is(cleaned)) {
    return cleaned
  }

  throw new Error("impossible state. did not create username from string")
}
