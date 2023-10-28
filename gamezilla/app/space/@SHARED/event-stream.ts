import { EventMeta } from "./event";
import { EventId } from "./event-id";

export type EventStream<T, TIndexName extends string> = {
  /**
   * Order of events in the stream
   */
  ordering: EventId[];
  /**
   * Events in the stream
   */
  events: {
    [eventId: EventId]: T & EventMeta;
  };
  /**
   * Indexes of events in the stream
   */
  indexes: {
    [indexName in TIndexName]?: EventStreamIndex;
  };
};

type EventStreamIndex = {
  [indexKey: string]: {
    ordering: EventId[];
    events: { [eventId: EventId]: EventId };
  };
};

export type EventStreamConfig<T, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: T & EventMeta) => string;
  };
};

const init = <T, TIndexName extends string>(
  indexes: EventStreamConfig<T, TIndexName>["indexes"]
): EventStreamConfig<T, TIndexName> => {
  return {
    indexes,
  };
};

const empty = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>
): EventStream<T, TIndexName> => {
  return {
    events: {},
    indexes: {},
    ordering: [],
  };
};

const append = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  event: T & EventMeta
): EventStream<T, TIndexName> => {
  const streamNew: EventStream<T, TIndexName> = {
    indexes: stream.indexes,
    events: { ...stream.events, [event.eventId]: event },
    ordering: [...stream.ordering, event.eventId],
  };

  streamNew.ordering.sort((a, b) => {
    return streamNew.events[a]!.happenedAt - streamNew.events[b]!.happenedAt;
  });

  const updated = updateIndexes(config, streamNew, event);

  return updated;
};

const updateIndexes = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  event: T & EventMeta
): EventStream<T, TIndexName> => {
  const indexesNew = { ...stream.indexes };

  for (let indexName in config.indexes) {
    const indexKey = config.indexes[indexName](event);
    const index = indexesNew[indexName] || {};
    const indexEvents = index[indexKey] || { ordering: [], events: {} };

    indexEvents.ordering.push(event.eventId);
    indexEvents.events[event.eventId] = event.eventId;

    indexEvents.ordering.sort((a, b) => {
      return stream.events[a]!.happenedAt - stream.events[b]!.happenedAt;
    });

    index[indexKey] = indexEvents;
    indexesNew[indexName] = index;
  }

  return {
    ...stream,
    indexes: indexesNew,
  };
};

const merge = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  left: EventStream<T, TIndexName>,
  right: EventStream<T, TIndexName>
): EventStream<T, TIndexName> => {
  const newOrdering = [];
  for (let i = 0; i < left.ordering.length; i++) {
    newOrdering.push(left.ordering[i]!);
  }
  for (let i = 0; i < right.ordering.length; i++) {
    newOrdering.push(right.ordering[i]!);
  }

  const newEvents = { ...left.events };
  for (let eventId in right.events) {
    // @ts-ignore
    newEvents[eventId] = right.events[eventId];
  }

  const newIndexes = { ...left.indexes };
  for (let indexName in right.indexes) {
    newIndexes[indexName] = { ...right.indexes[indexName] };
  }

  return {
    ordering: newOrdering,
    events: newEvents,
    indexes: newIndexes,
  };
};

const subset = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  indexName: TIndexName,
  indexKey: string
): EventStream<T, TIndexName> => {
  const eventStreamIndex = stream.indexes[indexName];

  if (!eventStreamIndex) {
    return empty(config);
  }

  const events = eventStreamIndex[indexKey];

  if (!events) {
    return empty(config);
  }

  const orderingNew: EventId[] = [];
  const eventsNew: { [eventId: string]: T & EventMeta } = {};

  for (let eventId in events.events) {
    if (!EventId.is(eventId)) {
      continue;
    }
    events.ordering.push(eventId);
  }

  return {
    ordering: orderingNew,
    events: eventsNew,
    indexes: {},
  };
};

const count = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>
): number => {
  return stream.ordering.length;
};

const toArray = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>
): (T & EventMeta)[] => {
  const events: (T & EventMeta)[] = [];
  for (let i = 0; i < stream.ordering.length; i++) {
    const eventId = stream.ordering[i]!;
    // @ts-ignore
    events.push(stream.events[eventId]);
  }
  return events;
};

const fromArray = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  events: (T & EventMeta)[]
): EventStream<T, TIndexName> => {
  let stream = empty(config);
  for (const event of events) {
    stream = append(config, stream, event);
  }
  return stream;
};

export const EventStream = {
  count,
  subset,
  append,
  merge,
  empty,
  init,
  toArray,
  fromArray,
};
