import { Posix } from "gamezilla/@SHARED/core";
import { EvtId } from "./evt-id";

export type EvtMeta = {
  happenedAt: Posix;
  eventId: EvtId;
};

export const withMeta = <T>(eventNew: T): T & EvtMeta => {
  return {
    ...eventNew,
    happenedAt: Posix.now(),
    eventId: EvtId.generate(),
  };
};
