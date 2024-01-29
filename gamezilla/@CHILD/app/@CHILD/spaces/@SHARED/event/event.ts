import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock/lamport-timestamp";
import { EventId } from "./event-id";

export type EventMeta = {
  happenedAt: LamportTimestamp;
  msgEvtId: EventId;
};

export type WithEventId<T> = T & {
  msgEvtId: EventId;
};

export type WithEventMeta<T> = T & EventMeta;

export const withId = <T>(msgEvtNew: T): WithEventId<T> => {
  return {
    ...msgEvtNew,
    msgEvtId: EventId.generate(),
  };
};
