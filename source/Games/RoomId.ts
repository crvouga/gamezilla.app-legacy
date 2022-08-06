import { Result, Uuid } from "../Core"

export type RoomId = string & { _opaque: typeof RoomId }

declare const RoomId: unique symbol

export const is = (id: unknown): id is RoomId => {
  return typeof id === "string"
}

type Problem = "invalid_id"

export const decode = (id: string): Result.Result<Problem, RoomId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_id")
}

export const generate = (): RoomId => {
  const roomId = Uuid.generateSync()

  if (is(roomId)) {
    return roomId
  }

  throw new Error("generated invalid id")
}
