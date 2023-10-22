import { Result, Uuid } from "gamezilla/@SHARED/core";

export type EvtId = string & { _opaque: "EventId" };

const namespace = "event";
const separator = ":";

const is = (id: unknown): id is EvtId => {
  return typeof id === "string";
};

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, EvtId> => {
  if (is(id)) {
    return Result.ok(id);
  }

  return Result.err("invalid_id");
};

const generate = (): EvtId => {
  const uuid = Uuid.generate();
  // warning collisions could happen
  // use short id so the logs are more readable

  const evtId = `${namespace}${separator}${uuid}`;

  if (is(evtId)) {
    return evtId;
  }

  throw new Error("generated invalid id");
};

export const EvtId = {
  is,
  decode,
  generate,
};
