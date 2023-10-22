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

export const appendEvt = <T>(
  evts: (T & EvtMeta)[],
  evt: T & EvtMeta
): (T & EvtMeta)[] => {
  const evtMap: Map<string, T & EvtMeta> = new Map();

  for (const evt of evts) {
    evtMap.set(evt.eventId, evt);
  }

  evtMap.set(evt.eventId, evt);

  const sorted = Array.from(evtMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  return sorted;
};

export const mergeEvts = <T>(
  left: (T & EvtMeta)[],
  right: (T & EvtMeta)[]
): (T & EvtMeta)[] => {
  const evtMap: Map<string, T & EvtMeta> = new Map();

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
