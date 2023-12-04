import { EventMeta } from "./event";

export type EventStreamInstance<_T> = {};

export type EventStreamConfig<TEvent, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: TEvent & EventMeta) => string;
  };
};

export type IEventStream<TEvent, TIndexName extends string> = {
  append: (
    instance: EventStreamInstance<TEvent>,
    event: TEvent & EventMeta
  ) => Promise<EventStreamInstance<TEvent>>;
  mergeLeft: (
    config: EventStreamConfig<TEvent, TIndexName>,
    left: EventStreamInstance<TEvent>,
    right: EventStreamInstance<TEvent>
  ) => Promise<EventStreamInstance<TEvent>>;
  subset: (
    config: EventStreamConfig<TEvent, TIndexName>,
    instance: EventStreamInstance<TEvent>,
    indexName: TIndexName,
    targetIndexVal: string
  ) => Promise<EventStreamInstance<TEvent>>;
};
