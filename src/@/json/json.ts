import { Result } from '../core/result'

export type Json = boolean | number | string | null | JsonArray | JsonRecord

export type JsonArray = ReadonlyArray<Json>

export interface JsonRecord {
  readonly [key: string]: Json
}

export type Problem = { message: string }

const parse = (s: string): Result<Problem, Json> => {
  try {
    const parsed: Json = JSON.parse(s)

    return Result.Ok(parsed)
  } catch (error) {
    // todo make better
    const message = String(error)
    return Result.Err({ message })
  }
}

const stringify = (json: Json): Result<Problem, string> => {
  try {
    const stringified: string = JSON.stringify(json)

    return Result.Ok(stringified)
  } catch (error) {
    // todo make better
    const message = String(error)
    return Result.Err({ message })
  }
}

export const Json = {
  parse,
  stringify
}
