import { Result } from "./result"

export type Json = boolean | number | string | null | JsonArray | JsonRecord

export type JsonArray = ReadonlyArray<Json>

export interface JsonRecord {
    readonly [key: string]: Json
}

export type Problem = { message: string }

export const parse = (s: string): Result<Problem, Json> => {
    try {
        const parsed: Json = JSON.parse(s)

        return Result.ok(parsed)
    } catch (error) {
        // todo make better
        const message = String(error)
        return Result.err({ message })
    }
}

export const stringify = (json: Json): Result<Problem, string> => {
    try {
        const stringified: string = JSON.stringify(json)

        return Result.ok(stringified)
    } catch (error) {
        // todo make better
        const message = String(error)
        return Result.err({ message })
    }
}
