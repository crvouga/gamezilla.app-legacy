import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock/lamport-timestamp";
import { EventId } from "./event-id";

export type EventMeta = {
  happenedAt: LamportTimestamp;
  eventId: EventId;
};

export type WithEventId<T> = T & {
  eventId: EventId;
};

export const withEventId$ = <T>(eventNew: T): WithEventId<T> => {
  return {
    ...eventNew,
    eventId: EventId.generate$(),
  };
};
