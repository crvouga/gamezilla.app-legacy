import { Result } from "../Core"

export type PartyId = string & { _opaque: typeof PartyId }

declare const PartyId: unique symbol

export const is = (id: unknown): id is PartyId => {
  return typeof id === "string"
}

type Problem = "invalid_party_id"

export const decode = (id: string): Result.Result<Problem, PartyId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_party_id")
}
