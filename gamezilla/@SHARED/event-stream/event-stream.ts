import { EventMeta } from "./event";
import { EventId } from "./event-id";

export type EventStream<T, TIndexName extends string = never> = {
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
      [indexKey: string]: EventStreamIndex;
    };
  };
  /**
   *
   */
  hash: string | number;
};

type EventStreamIndex = {
  ordering: EventId[];
  events: { [eventId: EventId]: EventId };
};

const initEventStreamIndex = (): EventStreamIndex => {
  return {
    ordering: [],
    events: {},
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
  _config: EventStreamConfig<T, TIndexName>
): EventStream<T, TIndexName> => {
  return {
    events: {},
    indexes: {},
    ordering: [],
    hash: hash([]),
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
        (stream.events?.[indexEvents.ordering?.[i] ?? EventId.generate()]
          ?.happenedAt ?? -Infinity) > event.happenedAt
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
  let stream = empty(config);

  for (const event of toIterable(left)) {
    stream = append(config, stream, event);
  }

  for (const event of toIterable(right)) {
    stream = append(config, stream, event);
  }

  return stream;
};

const subset = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  indexName: TIndexName,
  targetIndexVal: string
): EventStream<T, TIndexName> => {
  let streamNew = empty(config);

  const index: EventStreamIndex =
    stream.indexes[indexName]?.[targetIndexVal] ?? initEventStreamIndex();

  for (const eventId of index.ordering) {
    const event = stream.events[eventId as EventId];
    if (event) {
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

function hash(ordering: EventId[]): string | number {
  return djb2Hash(ordering.join(""));
}

function djb2Hash(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + c */
  }
  return hash;
}
