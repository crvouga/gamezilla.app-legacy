import { err, ok, Result, Uuid } from "gamezilla-app/@SHARED/core"
import { Brand } from "gamezilla-app/@SHARED/core/brand"

export type UserId = Brand<string, "UserId">

const namespace = "user"
const separator = ":"

const is = (userId: unknown): userId is UserId => {
  return typeof userId === "string"
}

type Problem = "invalid_user_id"

const parse = (id: unknown): Result<Problem, UserId> => {
  if (is(id)) {
    return ok(id)
  }
  return err("invalid_user_id")
}

const generate = () => {
  const id = Uuid.generate()
  const userId = `${namespace}${separator}${id}`

  if (is(userId)) {
    return userId
  }

  throw new Error("impossible condition. generated invalid user id.")
}

export const UserId = {
  generate,
  parse,
  is,
}
