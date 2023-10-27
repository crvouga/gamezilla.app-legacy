import { Posix } from "gamezilla/@SHARED/core";
import { EvtId } from "./evt-id";

export type EventMeta = {
  happenedAt: Posix;
  eventId: EvtId;
};

export const withMeta = <T>(eventNew: T): T & EventMeta => {
  return {
    ...eventNew,
    happenedAt: Posix.now(),
    eventId: EvtId.generate(),
  };
};

export const mergeEvts = <T>(
  left: (T & EventMeta)[],
  right: (T & EventMeta)[]
): (T & EventMeta)[] => {
  const evtMap: Map<string, T & EventMeta> = new Map();

  for (const evt of left) {
    evtMap.set(evt.eventId, evt);
  }

  for (const evt of right) {
    evtMap.set(evt.eventId, evt);
  }

  const sorted = Array.from(evtMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  return sorted;
};
