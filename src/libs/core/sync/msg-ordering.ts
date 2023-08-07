//
//
//
//
//

export type Leader<State, Msg> = {
  runningOrderId: number;
  acc: State;
  sent: ToFollower<Msg>[];
  received: ToLeader<Msg>[];
};

export type Follower<State, Msg> = {
  acc: State;
  sent: ToLeader<Msg>[];
  received: ToFollower<Msg>[];
};

export type ToFollower<Msg> = Msg & {
  msgId: string;
  orderId: number;
};

export type ToLeader<Msg> = Msg & {
  msgId: string;
};

export const isSyncing = <State, Msg>(model: Follower<State, Msg>): boolean => {
  return model.sent.length > 0;
};

//
//
//
//
//

export const initLeader = <State, Msg>(acc: State): Leader<State, Msg> => {
  return {
    runningOrderId: 0,
    acc,
    received: [],
    sent: [],
  };
};

export const initFollower = <State, Msg>(acc: State): Follower<State, Msg> => {
  return {
    acc,
    received: [],
    sent: [],
  };
};

export const reduce = <State, Msg>(
  reducer: (state: State, msg: Msg) => State,
  model: Leader<State, Msg>
): State => {
  return model.received.reduce(reducer, model.acc);
};

//
//
//
//
//

export const updateLeader = <State, Msg>(
  reducer: (state: State, msg: Msg) => State,
  model: Leader<State, Msg>,
  msg: Msg
): {
  model: Leader<State, Msg>;
  toFollower: ToFollower<Msg>;
} => {
  const toFollower: ToFollower<Msg> = {
    ...msg,
    orderId: model.runningOrderId,
    msgId: Math.random().toString(),
  };

  const modelNew: Leader<State, Msg> = {
    ...model,
    runningOrderId: model.runningOrderId + 1,
  };

  return { model: modelNew, toFollower };
};

export const updateFromFollower = <State, Msg>(
  reducer: (state: State, msg: Msg) => State,
  model: Leader<State, Msg>,
  msg: ToLeader<Msg>
): Leader<State, Msg> => {
  return model;
};

//
//
//
//
//

export const updateFollower = <State, Msg>(
  reducer: (state: State, msg: Msg) => State,
  model: Follower<State, Msg>,
  msg: ToFollower<Msg>
): Follower<State, Msg> => {
  return model;
};

export const updateFromLeader = <State, Msg>(
  reducer: (state: State, msg: Msg) => State,
  model: Follower<State, Msg>,
  msg: ToFollower<Msg>
): Follower<State, Msg> => {
  return model;
};
