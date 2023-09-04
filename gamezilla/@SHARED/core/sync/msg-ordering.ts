//
//
//
//
//

export type Leader<State, Event, Command> = {
  runningOrderId: number;
  acc: State;
  sent: ToFollower<Event>[];
  received: ToLeader<Command>[];
};

export type Follower<State, Event, Command> = {
  acc: State;
  sent: ToLeader<Command>[];
  sentAck: ToFollower<Command>[];
  received: ToFollower<Event>[];
};

export type ToFollower<Msg> = Msg & {
  msgId: string;
  orderId: number;
};

export type ToLeader<Msg> = Msg & {
  msgId: string;
};

//
//
//
//
//

export const initLeader = <State, Event, Command>(
  acc: State
): Leader<State, Event, Command> => {
  return {
    runningOrderId: 0,
    acc,
    received: [],
    sent: [],
  };
};

export const initFollower = <State, Event, Command>(
  acc: State
): Follower<State, Event, Command> => {
  return {
    acc,
    sentAck: [],
    received: [],
    sent: [],
  };
};

//
//
//
//
//

export const updateLeader = <State, Event, Command>(
  reducer: (state: State, msg: Event) => State,
  model: Leader<State, Event, Command>,
  msg: Event
): {
  model: Leader<State, Event, Command>;
  toFollower: ToFollower<Event>;
} => {
  const toFollower: ToFollower<Event> = {
    ...msg,
    orderId: model.runningOrderId,
    msgId: Math.random().toString(),
  };

  const modelNew: Leader<State, Event, Command> = {
    ...model,
    runningOrderId: model.runningOrderId + 1,
  };

  return { model: modelNew, toFollower };
};

export const updateFromFollower = <State, Event, Command>(
  reducer: (state: State, msg: Event) => State,
  model: Leader<State, Event, Command>,
  msg: ToLeader<Event>
): Leader<State, Event, Command> => {
  return model;
};

//
//
//
//
//
