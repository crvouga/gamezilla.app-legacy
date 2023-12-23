import { EventStreamConfig, IEventStream } from "./event-stream-v2";

export type Instance<
  TEventId extends string,
  TEvent,
  TIndexName extends string
> = {
  /**
   * Order of events in the stream
   */
  _ordering: TEventId[];
  /**
   * Events in the stream
   */
  _events: {
    [eventId in TEventId]?: TEvent;
  };
  /**
   * Custom indexes of events in the stream
   */
  _indexes: {
    [indexName in TIndexName]?: {
      [indexKey: string]: EventStreamIndex<TEventId>;
    };
  };
  /**
   *
   */
  _hash: string | number;
};

type EventStreamIndex<TEventId extends string> = {
  ordering: TEventId[];
  events: { [eventId in TEventId]?: TEventId };
};

export const EventStreamInMemory = <
  TEventId extends string,
  TEvent,
  TIndexName extends string
>(): IEventStream<
  TEventId,
  TEvent,
  TIndexName,
  Instance<TEventId, TEvent, TIndexName>
> => {
  type Model = Instance<TEventId, TEvent, TIndexName>;
  return {
    config(config) {
      return config;
    },
    async init(_config) {
      return {
        _events: {},
        _hash: 0,
        _indexes: {},
        _ordering: [],
      };
    },
    async append(config, stream, event) {
      if (config.toId(event) in stream._events) {
        return stream;
      }

      const newOrdering = [];
      let inserted = false;

      for (let i = 0; i < stream._ordering.length; i++) {
        if (
          !inserted &&
          config.toOrdering(stream._events[stream._ordering[i]!]!) >
            config.toOrdering(event)
        ) {
          newOrdering.push(config.toId(event));
          inserted = true;
        }
        newOrdering.push(stream._ordering[i]!);
      }

      if (!inserted) {
        newOrdering.push(config.toId(event));
      }

      const newEvents = { ...stream._events, [config.toId(event)]: event };

      return {
        _ordering: newOrdering,
        _events: newEvents,
        _indexes: updateIndexes(
          config,
          {
            _ordering: newOrdering,
            _events: newEvents,
            _indexes: stream._indexes,
            _hash: stream._hash,
          },
          event
        )._indexes,
        _hash: hash(newOrdering),
      };
    },
    async mergeLeft(config, left, right) {
      let stream = await this.init(config);

      for (const eventId of left._ordering) {
        const event = left._events[eventId]!;
        stream = await this.append(config, stream, event);
      }

      for (const eventId of right._ordering) {
        const event = right._events[eventId]!;
        stream = await this.append(config, stream, event);
      }

      return stream;
    },
    async has(instance, eventId) {
      return eventId in instance._events;
    },
    async equals(left, right) {
      return left._hash === right._hash;
    },
    async subset(config, instance, indexName, targetIndexVal) {
      let streamNew = await this.init(config);

      const index: EventStreamIndex<TEventId> = instance._indexes[indexName]?.[
        targetIndexVal
      ] ?? {
        events: {},
        ordering: [],
      };

      for (const eventId of index.ordering) {
        const event = instance._events[eventId as TEventId];
        if (event) {
          streamNew = await this.append(config, streamNew, event);
        }
      }

      return streamNew;
    },
    async startingAt(_config, instance, eventId) {
      const orderingIndex = instance._ordering.indexOf(eventId);

      if (orderingIndex === undefined) {
        return instance;
      }

      const newOrdering = instance._ordering.slice(orderingIndex);

      const newEvents: Model["_events"] = {};

      for (const eventId of newOrdering) {
        newEvents[eventId] = instance._events[eventId];
      }

      return {
        _events: newEvents,
        _hash: 0,
        _indexes: instance._indexes,
        _ordering: newOrdering,
      };
    },
    toIterable(instance) {
      return {
        [Symbol.asyncIterator]() {
          let currentIndex = 0; // Keeps track of the current position in the ordering array
          return {
            next: async () => {
              if (currentIndex >= instance._ordering.length) {
                return { done: true, value: undefined };
              }

              const eventId = instance._ordering[currentIndex]!;

              const event = instance._events[eventId]!;

              currentIndex++;

              return { done: false, value: event };
            },
            // Optional: Implement return and throw if needed for your use case
            return() {
              return Promise.resolve({ done: true, value: undefined });
            },
            throw(error) {
              throw error;
            },
          };
        },
      };
    },
    
    async fromArray(config, events) {
      let instance = await this.init(config);

      for (const event of events) {
        instance = await this.append(config, instance, event);
      }

      return instance;
    },
    async toArray(instance) {
      const events: TEvent[] = [];

      for (const eventId of instance._ordering) {
        events.push(instance._events[eventId]!);
      }

      return events;
    }
  };
};

const updateIndexes = <
  TEventId extends string,
  TEvent,
  TIndexName extends string
>(
  config: EventStreamConfig<TEventId, TEvent, TIndexName>,
  stream: Instance<TEventId, TEvent, TIndexName>,
  event: TEvent
): Instance<TEventId, TEvent, TIndexName> => {
  const indexesNew = { ...stream._indexes };

  for (let indexName in config.indexes) {
    const indexKey = config.indexes[indexName](event);
    const index = indexesNew[indexName] || {};
    const indexEvents = index[indexKey] || { ordering: [], events: {} };

    // Similar optimized insertion as in the append function
    let inserted = false;
    const newOrdering = [];
    for (let i = 0; i < indexEvents.ordering.length; i++) {
      const event = stream._events?.[indexEvents?.ordering?.[i]!]!;
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
    _indexes: indexesNew,
  };
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
