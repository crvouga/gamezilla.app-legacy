import { Result } from "../Core"

export type SessionId = string & { _opaque: 'SessionId' }

export const is = (id: unknown): id is SessionId => {
  return typeof id === "string"
}

type Problem = "invalid_session_id"

export const decode = (id: string): Result<Problem, SessionId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err("invalid_session_id")
}

const characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

const randomCharacter = (word: string): string => {
  return word[Math.floor(Math.random() * word.length)] ?? "a"
}

const generateId = (length: number): string => {
  let runningId = ""

  for (let i = 0; i < length; i++) {
    runningId = `${runningId}${randomCharacter(characters)}`
  }

  return runningId
}

export const generate = (): SessionId => {
  const sessionId = generateId(10)

  if (is(sessionId)) {
    return sessionId
  }

  throw new Error("generated invalid session id")
}

export const SessionId = {
  generate,
  decode,
  is,
}