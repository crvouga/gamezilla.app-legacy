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
};

export type EventStreamConfig<T, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: T & EventMeta) => string[];
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
  const { ordering, events } = stream;
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
      { ordering: newOrdering, events: newEvents, indexes: stream.indexes },
      event
    ).indexes,
  };
};

const updateIndexes = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  event: T & EventMeta
): EventStream<T, TIndexName> => {
  const indexesNew = { ...stream.indexes };

  for (let indexName in config.indexes) {
    const indexKey = config.indexes[indexName](event).join("-");
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
  };
};

const subset = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>,
  indexName: TIndexName,
  targetIndexVal: string[]
): EventStream<T, TIndexName> => {
  let streamNew = empty(config);

  for (const event of iter(config, stream)) {
    const eventIndexVal = config.indexes[indexName](event).join("-");

    if (eventIndexVal === targetIndexVal.join("-")) {
      streamNew = append(config, streamNew, event);
    }
  }

  return streamNew;
};

const iter = function* <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T, TIndexName>
): Iterable<T & EventMeta> {
  for (const eventId of stream.ordering) {
    if (!EventId.is(eventId)) {
      continue;
    }
    const event = stream.events[eventId];
    if (!event) {
      continue;
    }
    yield event;
  }
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
  iter,
};
