import { Result } from "../../../../@SHARED/core/data/result"

export type ClientId = string & { _opaque: "ClientId" }

const is = (id: unknown): id is ClientId => {
    return typeof id === "string"
}

type Problem = "invalid_client_id"

const decode = (id: string): Result<Problem, ClientId> => {
    if (is(id)) {
        return Result.ok(id)
    }

    return Result.err("invalid_client_id")
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

const namespace = "client"
const separator = ":"

const generate = (): ClientId => {
    const id = `${generateId(5)}`

    const clientId = `${namespace}${separator}${id}`

    if (is(clientId)) {
        return clientId
    }

    throw new Error("generated invalid client id")
}

export const ClientId = {
    is,
    decode,
    generate,
}
