import { Posix } from "gamezilla/@SHARED/core";
import { EventId } from "./event-id";

export type EventMeta = {
  happenedAt: Posix;
  eventId: EventId;
};

export const withMeta = <T>(eventNew: T): T & EventMeta => {
  return {
    ...eventNew,
    happenedAt: Posix.now(),
    eventId: EventId.generate(),
  };
};
