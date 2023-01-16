import { Result, Uuid } from "../Core"

export type UserId = string & { _opaque: "UserId" }

const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string"
}

type Problem = "invalid_user_id"

const decode = (id: unknown): Result<Problem, UserId> => {
  if (is(id)) {
    return Result.Ok(id)
  }
  return Result.Err("invalid_user_id")
}

const generate = () => {
  const id = Uuid.generateSync()

  if (is(id)) {
    return id
  }

  throw new Error("impossible condition. generated invalid user id.")
}

export const UserId = {
  generate,
  decode,
  is,
}
