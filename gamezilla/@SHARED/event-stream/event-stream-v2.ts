export type EventStreamConfig<TEvent, TIndexName extends string> = {
  indexes: {
    [indexName in TIndexName]: (event: TEvent) => string;
  };
};

export type IEventStream<
  TEvent,
  TIndexName extends string,
  TEventId extends string,
  EventStreamInstance
> = {
  startingAt: (timestamp: number) => Promise<EventStreamInstance>;
  append: (
    instance: EventStreamInstance,
    event: TEvent
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
  toIterable: (instance: EventStreamInstance) => AsyncIterable<TEvent>;
  has: (instance: EventStreamInstance, eventId: TEventId) => Promise<boolean>;
};
