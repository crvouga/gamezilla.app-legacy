import { Result } from "@gamezilla/core"


export type RoomId = string & { _opaque: "RoomId" }

const namespace = ""
const separator = ""

const is = (id: unknown): id is RoomId => {
  // todo: better validation
  return typeof id === "string"
}

type Problem = "invalid_id"

const decode = (id: string): Result<Problem, RoomId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_id")
}


const generate = (): RoomId => {
  // warning collisions could happen
  // use short id so the logs are more readable
  const roomId = `${namespace}${separator}${Math.random().toString(36).slice(-6)}`

  if (is(roomId)) {
    return roomId
  }

  throw new Error("generated invalid id")
}

export const RoomId = {
  is,
  decode,
  generate,
}
