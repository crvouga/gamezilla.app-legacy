export type EventStreamConfig<
  TEventId extends string,
  TEvent,
  TIndexName extends string
> = {
  toId: (event: TEvent) => TEventId;
  toOrdering: (event: TEvent) => number;
  indexes: {
    [indexName in TIndexName]: (event: TEvent) => string;
  };
};

export type IEventStream<
  TEventId extends string,
  TEvent,
  TIndexName extends string,
  TInstance
> = {
  config: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>
  ) => EventStreamConfig<TEventId, TEvent, TIndexName>
  init: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>
  ) => Promise<TInstance>;
  fromArray: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>,
    events: TEvent[]
  ) => Promise<TInstance>;
  toArray: (
    instance: TInstance,
  ) => Promise<TEvent[]>;
  equals: (left: TInstance, right: TInstance) => Promise<boolean>;
  startingAt: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    eventId: TEventId
  ) => Promise<TInstance>;
  append: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    event: TEvent
  ) => Promise<TInstance>;
  mergeLeft: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>,
    left: TInstance,
    right: TInstance
  ) => Promise<TInstance>;
  subset: (
    config: EventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    indexName: TIndexName,
    targetIndexVal: string
  ) => Promise<TInstance>;
  toIterable: (instance: TInstance) => AsyncIterable<TEvent>;
  has: (instance: TInstance, eventId: TEventId) => Promise<boolean>;
};
