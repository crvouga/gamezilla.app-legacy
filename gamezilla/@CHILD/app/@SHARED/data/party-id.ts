import { Result, Uuid } from "gamezilla/@SHARED/core"

export type PartyId = string & { _opaque: "PartyId" }

const is = (id: unknown): id is PartyId => {
    return typeof id === "string"
}

type Problem = "invalid_party_id"

const decode = (id: string): Result<Problem, PartyId> => {
    if (is(id)) {
        return Result.ok(id)
    }

    return Result.err("invalid_party_id")
}
const generate = (): PartyId => {
    const id = Uuid.generate()
    if (is(id)) {
        return id
    }

    throw new Error("generated invalid id")
}

export const PartyId = {
    is,
    decode,
    generate,
}
