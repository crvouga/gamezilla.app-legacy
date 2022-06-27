import * as Task from "./Task"

export type Uuid = string & { _opaque: typeof Uuid }

declare const Uuid: unique symbol

export const is = (id: unknown): id is Uuid => {
  const regex = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  )

  return typeof id === "string" && regex.test(id)
}

export const generate: Task.Task<Uuid> = async () => {
  const id = crypto.randomUUID()

  if (is(id)) {
    return id
  }

  throw new Error("generated invalid uuid")
}
