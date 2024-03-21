import { Uuid } from "gamezilla-app/@SHARED/core"
import { Brand } from "gamezilla-app/@SHARED/core/brand"
import { p } from "gamezilla-app/@SHARED/core/parser"

export type UserId = Brand<string, "UserId">

const parser = p.custom(is, "Invalid user id")

const namespace = "user"
const separator = ":"

function is(userId: unknown): userId is UserId {
  return typeof userId === "string"
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
  ...parser,
  generate,
  is,
}
