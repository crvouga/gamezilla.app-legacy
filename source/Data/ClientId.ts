import { Result } from "../Core"

export type ClientId = string & { _opaque: typeof ClientId }

declare const ClientId: unique symbol

export const is = (id: unknown): id is ClientId => {
  return typeof id === "string"
}

type Problem = "invalid_client_id"

export const decode = (id: string): Result.Result<Problem, ClientId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_client_id")
}
