import { EventMeta } from "./event";
import { EventId } from "./event-id";

export type EventStream<T> = {
  //
  events: {
    [eventId: EventId]: T & EventMeta;
  };
  indexes: {
    [indexName: string]: {
      [indexKey: string]: {
        [eventId: EventId]: EventId;
      };
    };
  };
};

export type EventStreamConfig<T, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: T & EventMeta) => string;
  };
};

const initConfig = <T, TIndexName extends string>(
  indexes: EventStreamConfig<T, TIndexName>["indexes"]
): EventStreamConfig<T, TIndexName> => {
  return {
    indexes,
  };
};

const init = <T>(): EventStream<T> => {
  return {
    events: {},
    indexes: {},
  };
};

const append = <T>(
  stream: EventStream<T>,
  event: T & EventMeta
): EventStream<T> => {
  return stream;
};

const merge = <T>(
  left: EventStream<T>,
  right: EventStream<T>
): EventStream<T> => {
  return left;
};

const subset = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T>,
  indexName: TIndexName
): EventStream<T> => {
  return stream;
};

const resetIndexes = <T, TIndexName extends string>(
  config: EventStreamConfig<T, TIndexName>,
  stream: EventStream<T>,
  indexName: TIndexName
): EventStream<T> => {
  return stream;
};

export const EventStream = {
  subset,
  resetIndexes,
  append,
  merge,
  init,
  initConfig,
};
