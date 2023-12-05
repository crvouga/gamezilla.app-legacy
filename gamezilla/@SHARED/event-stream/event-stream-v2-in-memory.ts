import { IEventStream } from "./event-stream-v2";

export type EventStreamInMemoryInstance = {
  startingAt: number;
};

export const EventStreamInMemory = <TEvent, TIndexName extends string>(): IEventStream<
  TEvent,
  TIndexName,
  string,
  EventStreamInMemoryInstance
> => {
  return {
    async append(instance) {
      return instance;
    },
    async mergeLeft(_config, left, _right) {
      return left;
    },
    async has(_instance, _eventId) {
      return false;
    },
    async subset(_config, _instance, _indexName) {
      return this.startingAt(0);
    },
    async startingAt(timestamp) {
      return { startingAt: timestamp };
    },
    toIterable(_instance) {
      return {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              return { done: true, value: undefined };
            },
            async return() {
              return { done: true, value: undefined };
            },
            async throw(e) {
              throw e;
            },
          };
        },
      };
    },
  };
};

