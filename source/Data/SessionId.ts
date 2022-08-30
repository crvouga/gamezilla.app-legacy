import { Uuid, Result } from "../Core"

export type SessionId = string & { _opaque: typeof SessionId }

declare const SessionId: unique symbol

export const is = (id: unknown): id is SessionId => {
  return typeof id === "string"
}

type Problem = "invalid_session_id"

export const decode = (id: string): Result.Result<Problem, SessionId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_session_id")
}

export const generate = (): SessionId => {
  const sessionId = Uuid.generateSync()

  if (is(sessionId)) {
    return sessionId
  }

  throw new Error("generated invalid session id")
}
