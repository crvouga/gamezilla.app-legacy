import { IEventStreamConfig, IEventStream } from "./event-stream";

export type Instance<
  TEventId extends string,
  TEvent,
  TIndexName extends string
> = {
  /**
   * Order of msgEvents in the stream
   */
  _ordering: TEventId[];
  /**
   * Events in the stream
   */
  _msgEvents: {
    [msgEventId in TEventId]?: TEvent;
  };
  /**
   * Custom indexes of msgEvents in the stream
   */
  _indexes: {
    [indexName in TIndexName]?: {
      [indexKey: string]: EventStreamIndex<TEventId>;
    };
  };
  /**
   * Unique hash of the stream. Used for equality and memoization.
   */
  _hash: string | number;
};

type EventStreamIndex<TEventId extends string> = {
  _ordering: TEventId[];
  _msgEvents: {
    [msgEventId in TEventId]?: TEventId;
  };
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
        _msgEvents: {},
        _hash: 0,
        _indexes: {},
        _ordering: [],
      };
    },

    toHash(instance) {
      return instance._hash;
    },

    async latest(_config, instance) {
      const msgEventId = instance._ordering[instance._ordering.length - 1];
      if (!msgEventId) {
        return null;
      }
      const msgEvent = instance._msgEvents[msgEventId];
      if (!msgEvent) {
        return null;
      }
      return msgEvent;
    },

    async get(instance, msgEventId) {
      return instance._msgEvents[msgEventId] ?? null;
    },

    async append(config, stream, msgEvent) {
      if (config.toId(msgEvent) in stream._msgEvents) {
        return stream;
      }

      const newOrdering = [];
      let inserted = false;

      for (let i = 0; i < stream._ordering.length; i++) {
        if (
          !inserted &&
          config.toOrdering(stream._msgEvents[stream._ordering[i]!]!) >
            config.toOrdering(msgEvent)
        ) {
          newOrdering.push(config.toId(msgEvent));
          inserted = true;
        }
        newOrdering.push(stream._ordering[i]!);
      }

      if (!inserted) {
        newOrdering.push(config.toId(msgEvent));
      }

      const newEvents = {
        ...stream._msgEvents,
        [config.toId(msgEvent)]: msgEvent,
      };

      return {
        _ordering: newOrdering,
        _msgEvents: newEvents,
        _indexes: updateIndexes(
          config,
          {
            _ordering: newOrdering,
            _msgEvents: newEvents,
            _indexes: stream._indexes,
            _hash: stream._hash,
          },
          msgEvent
        )._indexes,
        _hash: hash(newOrdering),
      };
    },

    async mergeLeft(config, left, right) {
      let stream = await this.init(config);

      for (const msgEventId of left._ordering) {
        const msgEvent = left._msgEvents[msgEventId]!;
        stream = await this.append(config, stream, msgEvent);
      }

      for (const msgEventId of right._ordering) {
        const msgEvent = right._msgEvents[msgEventId]!;
        stream = await this.append(config, stream, msgEvent);
      }

      return stream;
    },

    async has(instance, msgEventId) {
      return msgEventId in instance._msgEvents;
    },

    async equals(left, right) {
      return left._hash === right._hash;
    },

    async subset(config, instance, indexName, targetIndexVal) {
      let streamNew = await this.init(config);

      const index: EventStreamIndex<TEventId> = instance._indexes[indexName]?.[
        targetIndexVal
      ] ?? {
        _msgEvents: {},
        _ordering: [],
      };

      for (const msgEventId of index._ordering) {
        const msgEvent = instance._msgEvents[msgEventId as TEventId];
        if (msgEvent) {
          streamNew = await this.append(config, streamNew, msgEvent);
        }
      }

      return streamNew;
    },

    async startingAt(config, instance, msgEventId) {
      const orderingIndex = instance._ordering.indexOf(msgEventId);

      if (orderingIndex === undefined) {
        return instance;
      }

      const newOrdering = instance._ordering.slice(orderingIndex);

      const newEvents: Model["_msgEvents"] = {};
      let newIndexes: Model["_indexes"] = {};

      for (const msgEventId of newOrdering) {
        newEvents[msgEventId] = instance._msgEvents[msgEventId];
        const updated = updateIndexes(
          config,
          {
            _msgEvents: newEvents,
            _indexes: newIndexes,
            _ordering: newOrdering,
            _hash: 0,
          },
          instance._msgEvents[msgEventId]!
        );
        newIndexes = updated._indexes;
      }

      return {
        _msgEvents: newEvents,
        _hash: hash(newOrdering),
        _indexes: newIndexes,
        _ordering: newOrdering,
      };
    },

    async endingAt(config, instance, msgEventId) {
      const orderingIndex = instance._ordering.indexOf(msgEventId);

      if (orderingIndex === undefined) {
        return instance;
      }

      const newOrdering = instance._ordering.slice(0, orderingIndex + 1);

      const newEvents: Model["_msgEvents"] = {};
      let newIndexes: Model["_indexes"] = {};

      for (const msgEventId of newOrdering) {
        newEvents[msgEventId] = instance._msgEvents[msgEventId];
        const updated = updateIndexes(
          config,
          {
            _msgEvents: newEvents,
            _indexes: newIndexes,
            _ordering: newOrdering,
            _hash: 0,
          },
          instance._msgEvents[msgEventId]!
        );
        newIndexes = updated._indexes;
      }

      return {
        _msgEvents: newEvents,
        _hash: hash(newOrdering),
        _indexes: newIndexes,
        _ordering: newOrdering,
      };
    },

    toIterable(instance) {
      return {
        [Symbol.asyncIterator]() {
          let currentIndex = 0;
          return {
            async next() {
              if (currentIndex >= instance._ordering.length) {
                return { done: true, value: undefined };
              }

              const msgEventId = instance._ordering[currentIndex]!;

              const msgEvent = instance._msgEvents[msgEventId]!;

              currentIndex++;

              return { done: false, value: msgEvent };
            },

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

    async fromArray(config, msgEvents) {
      let instance = await this.init(config);

      for (const msgEvent of msgEvents) {
        instance = await this.append(config, instance, msgEvent);
      }

      return instance;
    },

    async toArray(instance) {
      const msgEvents: TEvent[] = [];

      for (const msgEventId of instance._ordering) {
        msgEvents.push(instance._msgEvents[msgEventId]!);
      }

      return msgEvents;
    },
  };
};

const updateIndexes = <
  TEventId extends string,
  TEvent,
  TIndexName extends string
>(
  config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
  stream: Instance<TEventId, TEvent, TIndexName>,
  msgEvent: TEvent
): Instance<TEventId, TEvent, TIndexName> => {
  const indexesNew = { ...stream._indexes };

  for (let indexName in config.indexes) {
    const indexKey = config.indexes[indexName](msgEvent);
    const index = indexesNew[indexName] || {};
    const indexEvents = index[indexKey] || { _ordering: [], _msgEvents: {} };

    let inserted = false;
    const newOrdering = [];
    for (let i = 0; i < indexEvents._ordering.length; i++) {
      const msgEvent = stream._msgEvents?.[indexEvents?._ordering?.[i]!]!;
      if (
        !inserted &&
        (config.toOrdering(msgEvent) ?? -Infinity) > config.toOrdering(msgEvent)
      ) {
        newOrdering.push(config.toId(msgEvent));
        inserted = true;
      }
      newOrdering.push(indexEvents._ordering[i]!);
    }
    if (!inserted) {
      newOrdering.push(config.toId(msgEvent));
    }

    indexEvents._ordering = newOrdering;
    indexEvents._msgEvents = {
      ...indexEvents._msgEvents,
      [config.toId(msgEvent)]: config.toId(msgEvent),
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
