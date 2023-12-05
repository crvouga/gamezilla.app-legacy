import { EventMeta } from "./event";
import { EventId } from "./event-id";

export type EventStreamConfig<TEvent, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: TEvent & EventMeta) => string;
  };
};

export type IEventStream<TEvent, TIndexName extends string, EventStreamInstance> = {
  startingAt: (timestamp: number) => Promise<EventStreamInstance>;
  append: (
    instance: EventStreamInstance,
    event: TEvent & EventMeta
  ) => Promise<EventStreamInstance>;
  mergeLeft: (
    config: EventStreamConfig<TEvent, TIndexName>,
    left: EventStreamInstance,
    right: EventStreamInstance
  ) => Promise<EventStreamInstance>;
  subset: (
    config: EventStreamConfig<TEvent, TIndexName>,
    instance: EventStreamInstance,
    indexName: TIndexName
  ) => Promise<EventStreamInstance>;
  toIterable: (
    instance: EventStreamInstance
  ) => AsyncIterable<TEvent & EventMeta>;
  has: (
    instance: EventStreamInstance,
    eventId: EventId
  ) => Promise<boolean>;
};
