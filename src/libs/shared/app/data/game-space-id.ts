import { Result } from "@gamezilla/core";

export type GameSpaceId = string & { _opaque: "SpaceId" };

const namespace = "";
const separator = "";

const is = (id: unknown): id is GameSpaceId => {
  // todo: better validation
  return typeof id === "string";
};

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, GameSpaceId> => {
  if (is(id)) {
    return Result.Ok(id);
  }

  return Result.Err("invalid_id");
};

const generate = (): GameSpaceId => {
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

export const GameSpaceId = {
  is,
  decode,
  generate,
};
