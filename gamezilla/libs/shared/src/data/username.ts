import { Result } from "@gamezilla/core"
const { Ok, Err } = Result

export type Username = string & { _opaque: "Username" }

const is = (username: unknown): username is Username => {
  return (
    typeof username === "string" &&
    username.length > 0 &&
    username.length <= 100
  )
}

type Problem = "invalid_username"

const decode = (username: unknown): Result<Problem, Username> => {
  if (is(username)) {
    return Ok(username)
  }
  return Err("invalid_username")
}

const fromString = (username: string): Username => {
  const cleaned = username.substring(0, 100)
  if (is(cleaned)) {
    return cleaned
  }

  throw new Error("impossible state. did not create username from string")
}

export const Username = {
  is,
  fromString,
  decode,
}
