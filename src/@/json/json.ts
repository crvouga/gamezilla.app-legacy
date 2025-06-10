import { Err, Ok, Result } from '../result'

export type Json = boolean | number | string | null | JsonArray | JsonRecord

export type JsonArray = ReadonlyArray<Json>

export interface JsonRecord {
  readonly [key: string]: Json
}

const parse = (s: string): Result<string, Json> => {
  try {
    const parsed: Json = JSON.parse(s)
    return Ok(parsed)
  } catch (error) {
    return Err(String(error))
  }
}

const stringify = (json: unknown): Result<string, string> => {
  try {
    const stringified: string = JSON.stringify(json)
    return Ok(stringified)
  } catch (error) {
    return Err(String(error))
  }
}

export const Json = {
  parse,
  stringify,
}
