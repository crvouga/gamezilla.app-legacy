export type IEventStreamConfig<
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

export type IEventStreamInstance<
  _TEventId extends string,
  _TEvent,
  _TIndexName extends string
> = {
  _type: 'IEventStreamInstance'
};

export type IEventStream<
  TEventId extends string,
  TEvent,
  TIndexName extends string,
  TInstance
> = {
  toHash: (instance: TInstance) => string | number;
  config: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>
  ) => IEventStreamConfig<TEventId, TEvent, TIndexName>;
  init: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>
  ) => Promise<TInstance>;
  fromArray: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    events: TEvent[]
  ) => Promise<TInstance>;
  toArray: (instance: TInstance) => Promise<TEvent[]>;
  equals: (left: TInstance, right: TInstance) => Promise<boolean>;
  get: (instance: TInstance, eventId: TEventId) => Promise<TEvent | null>;
  startingAt: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    eventId: TEventId
  ) => Promise<TInstance>;
  endingAt: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    eventId: TEventId
  ) => Promise<TInstance>;
  append: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    event: TEvent
  ) => Promise<TInstance>;
  latest: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance
  ) => Promise<TEvent | null>;
  mergeLeft: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    left: TInstance,
    right: TInstance
  ) => Promise<TInstance>;
  subset: (
    config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
    instance: TInstance,
    indexName: TIndexName,
    targetIndexVal: string
  ) => Promise<TInstance>;
  toIterable: (instance: TInstance) => AsyncIterable<TEvent>;
  has: (instance: TInstance, eventId: TEventId) => Promise<boolean>;
};

export type EventStreamInferInstance<
  T extends IEventStream<any, any, any, any>
> = T extends IEventStream<any, any, any, infer TInstance> ? TInstance : never;
