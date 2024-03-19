import { Result, Uuid } from "gamezilla-app/@SHARED/core";
import { Brand } from "gamezilla-app/@SHARED/core/brand";
export type PartyId = Brand<string, "PartyId">;
const is = (id: unknown): id is PartyId => {
    return typeof id === "string";
};
type Problem = "invalid_party_id";
const decode = (id: string): Result<Problem, PartyId> => {
    if (is(id)) {
        return Result.ok(id);
    }
    return Result.err("invalid_party_id");
};
const generate = (): PartyId => {
    const id = Uuid.generate();
    if (is(id)) {
        return id;
    }
    throw new Error("generated invalid id");
};
export const PartyId = {
    is,
    decode,
    generate,
};
