import { Result, Uuid, err, ok } from "gamezilla/@SHARED/core";

export type EventId = string & { _opaque: "EventId" };

const namespace = "space-event";
const separator = ":";

const is = (id: unknown): id is EventId => {
  return typeof id === "string";
};

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, EventId> => {
  if (is(id)) {
    return ok(id);
  }

  return err("invalid_id");
};

const baseId = Uuid.generate();
let runningId = 0;

const generate = (): EventId => {
  runningId++;
  const id = `${baseId}-${runningId}`;

  const msgEvtId = `${namespace}${separator}${id}`;

  if (is(msgEvtId)) {
    return msgEvtId;
  }

  throw new Error("impossible condition. generated invalid id");
};

export const EventId = {
  is,
  decode,
  generate,
};
