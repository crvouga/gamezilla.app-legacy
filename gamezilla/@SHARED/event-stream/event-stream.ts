export type EventStreamConfig<
  TEvent,
  TIndexName extends string,
  TEventId extends string
> = {
  indexes: {
    [indexName in TIndexName]: (event: TEvent) => string;
  };
  toId: (event: TEvent) => TEventId;
  toOrdering: (event: TEvent) => number;
};

export type EventStream<
  TEvent,
  TIndexName extends string,
  TEventId extends string
> = {
  /**
   * Order of events in the stream
   */
  ordering: TEventId[];
  /**
   * Events in the stream
   */
  events: {
    [eventId in TEventId]?: TEvent;
  };
  /**
   * Indexes of events in the stream
   */
  indexes: {
    [indexName in TIndexName]?: {
      [indexKey: string]: EventStreamIndex<TEventId>;
    };
  };
  /**
   *
   */
  hash: string | number;
};

type EventStreamIndex<TEventId extends string> = {
  ordering: TEventId[];
  events: { [eventId in TEventId]?: TEventId };
};

const initEventStreamIndex = <
  TEventId extends string
>(): EventStreamIndex<TEventId> => {
  return {
    ordering: [],
    events: {},
  };
};

const initConfig = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>
): EventStreamConfig<T, TIndexName, TEventId> => {
  return config;
};

const empty = <T, TIndexName extends string, TEventId extends string>(
  _config: EventStreamConfig<T, TIndexName, TEventId>
): EventStream<T, TIndexName, TEventId> => {
  return {
    events: {},
    indexes: {},
    ordering: [],
    hash: hash([]),
  };
};

const append = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>,
  stream: EventStream<T, TIndexName, TEventId>,
  event: T
): EventStream<T, TIndexName, TEventId> => {
  const { ordering, events } = stream;

  if (config.toId(event) in events) {
    return stream;
  }

  const newOrdering = [];
  let inserted = false;

  for (let i = 0; i < ordering.length; i++) {
    if (
      !inserted &&
      config.toOrdering(events[ordering[i]!]!) > config.toOrdering(event)
    ) {
      newOrdering.push(config.toId(event));
      inserted = true;
    }
    newOrdering.push(ordering[i]!);
  }

  if (!inserted) {
    newOrdering.push(config.toId(event));
  }

  const newEvents = { ...events, [config.toId(event)]: event };

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

const updateIndexes = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>,
  stream: EventStream<T, TIndexName, TEventId>,
  event: T
): EventStream<T, TIndexName, TEventId> => {
  const indexesNew = { ...stream.indexes };

  for (let indexName in config.indexes) {
    const indexKey = config.indexes[indexName](event);
    const index = indexesNew[indexName] || {};
    const indexEvents = index[indexKey] || { ordering: [], events: {} };

    // Similar optimized insertion as in the append function
    let inserted = false;
    const newOrdering = [];
    for (let i = 0; i < indexEvents.ordering.length; i++) {
      const event = stream.events?.[indexEvents?.ordering?.[i]!]!;
      if (
        !inserted &&
        (config.toOrdering(event) ?? -Infinity) > config.toOrdering(event)
      ) {
        newOrdering.push(config.toId(event));
        inserted = true;
      }
      newOrdering.push(indexEvents.ordering[i]!);
    }
    if (!inserted) {
      newOrdering.push(config.toId(event));
    }

    indexEvents.ordering = newOrdering;
    indexEvents.events = {
      ...indexEvents.events,
      [config.toId(event)]: config.toId(event),
    };
    index[indexKey] = indexEvents;
    indexesNew[indexName] = index;
  }

  return {
    ...stream,
    indexes: indexesNew,
  };
};

const mergeLeft = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>,
  left: EventStream<T, TIndexName, TEventId>,
  right: EventStream<T, TIndexName, TEventId>
): EventStream<T, TIndexName, TEventId> => {
  let stream = empty(config);

  for (const event of toIterable(left)) {
    stream = append(config, stream, event);
  }

  for (const event of toIterable(right)) {
    stream = append(config, stream, event);
  }

  return stream;
};

const subset = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>,
  stream: EventStream<T, TIndexName, TEventId>,
  indexName: TIndexName,
  targetIndexVal: string
): EventStream<T, TIndexName, TEventId> => {
  let streamNew = empty(config);

  const index: EventStreamIndex<TEventId> =
    stream.indexes[indexName]?.[targetIndexVal] ?? initEventStreamIndex();

  for (const eventId of index.ordering) {
    const event = stream.events[eventId as TEventId];
    if (event) {
      streamNew = append(config, streamNew, event);
    }
  }

  return streamNew;
};

const toIterableBackwards = function* <
  T,
  TIndexName extends string,
  TEventId extends string
>(stream: EventStream<T, TIndexName, TEventId>): Iterable<T> {
  for (let i = stream.ordering.length - 1; i >= 0; i--) {
    const eventId = stream.ordering[i]!;
    const event = stream.events[eventId as TEventId];
    if (event) {
      yield event;
    }
  }
};

const toIterable = function* <
  T,
  TIndexName extends string,
  TEventId extends string
>(stream: EventStream<T, TIndexName, TEventId>): Iterable<T> {
  for (const eventId of stream.ordering) {
    const event = stream.events[eventId as TEventId];
    if (event) {
      yield event;
    }
  }
};

const toArray = <T, TIndexName extends string, TEventId extends string>(
  stream: EventStream<T, TIndexName, TEventId>
): T[] => {
  return Array.from(toIterable(stream));
};

const fromArray = <T, TIndexName extends string, TEventId extends string>(
  config: EventStreamConfig<T, TIndexName, TEventId>,
  events: T[]
): EventStream<T, TIndexName, TEventId> => {
  let stream = empty(config);
  for (const event of events) {
    stream = append(config, stream, event);
  }
  return stream;
};

export const EventStream = {
  subset,
  append,
  mergeLeft,
  empty,
  initConfig,
  toArray,
  fromArray,
  toIterable,
  toIterableBackwards,
};

function hash<TEventId extends string>(ordering: TEventId[]): string | number {
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
