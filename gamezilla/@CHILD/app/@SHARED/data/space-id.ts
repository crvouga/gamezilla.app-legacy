import { Result } from "gamezilla/@SHARED/core";

export type SpaceId = string & { _opaque: "SpaceId" };

const namespace = "space";
const separator = ":";

const is = (id: unknown): id is SpaceId => {
  // todo: better validation
  return typeof id === "string";
};

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, SpaceId> => {
  if (is(id)) {
    return Result.ok(id);
  }

  return Result.err("invalid_id");
};

const generate$ = (): SpaceId => {
  // warning collisions could happen
  // use short id so the logs are more readable
  const spaceId = `${namespace}${separator}${Math.random()
    .toString(36)
    .slice(-6)}`;

  if (is(spaceId)) {
    return spaceId;
  }

  throw new Error("generated invalid id");
};

export const SpaceId = {
  is,
  decode,
  generate$,
};
