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
    [indexName in TIndexName]?: {
      [indexKey: string]: {
        ordering: EventId[];
        events: { [eventId: EventId]: EventId };
      };
    };
  };
  /**
   *
   */
  hash: number;
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
    hash: simpleHash(""),
  };
};

const append = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  event: T & EventMeta
): EventStream<T, TIndexName> => {
  const { ordering, events } = stream;

  if (event.eventId in events) {
    return stream;
  }

  const newOrdering = [];
  let inserted = false;

  for (let i = 0; i < ordering.length; i++) {
    if (!inserted && events[ordering[i]!]!.happenedAt > event.happenedAt) {
      newOrdering.push(event.eventId);
      inserted = true;
    }
    newOrdering.push(ordering[i]!);
  }

  if (!inserted) {
    newOrdering.push(event.eventId);
  }

  const newEvents = { ...events, [event.eventId]: event };

  return {
    ordering: newOrdering,
    events: newEvents,
    indexes: updateIndexes(
      config,
      {
        ordering: newOrdering,
        events: newEvents,
        indexes: stream.indexes,
        hash: stream.hash,
      },
      event
    ).indexes,
    hash: hash(newOrdering),
  };
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

    // Similar optimized insertion as in the append function
    let inserted = false;
    const newOrdering = [];
    for (let i = 0; i < indexEvents.ordering.length; i++) {
      if (
        !inserted &&
        stream.events[indexEvents.ordering[i]!]!.happenedAt > event.happenedAt
      ) {
        newOrdering.push(event.eventId);
        inserted = true;
      }
      newOrdering.push(indexEvents.ordering[i]!);
    }
    if (!inserted) {
      newOrdering.push(event.eventId);
    }

    indexEvents.ordering = newOrdering;
    indexEvents.events[event.eventId] = event.eventId;
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
    hash: hash(newOrdering),
  };
};

const subset = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  indexName: TIndexName,
  targetIndexVal: string
): EventStream<T, TIndexName> => {
  let streamNew = empty(config);

  for (const event of toIterable(stream)) {
    const eventIndexVal = config.indexes[indexName](event);

    if (eventIndexVal === targetIndexVal) {
      streamNew = append(config, streamNew, event);
    }
  }

  return streamNew;
};

const toIterable = function* <T, TIndexName extends string>(
  stream: EventStream<T, TIndexName>
): Iterable<T & EventMeta> {
  for (const eventId of stream.ordering) {
    const event = stream.events[eventId as EventId];
    if (event) {
      yield event;
    }
  }
};

const toArray = <T, TIndexName extends string>(
  stream: EventStream<T, TIndexName>
): (T & EventMeta)[] => {
  return Array.from(toIterable(stream));
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
  subset,
  append,
  merge,
  empty,
  init,
  toArray,
  fromArray,
  toIterable,
};

function hash(ordering: EventId[]): number {
  return simpleHash(ordering.join(""));
}

function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
