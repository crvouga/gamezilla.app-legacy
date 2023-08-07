export type Master<CoreModel, CoreMsg> = {
  lastOrder: number;
  acc: CoreModel;
  msgs: Msg<CoreMsg>[];
  sent?: Msg<CoreMsg>[];
  received?: Msg<CoreMsg>[];
};

export type Relay<CoreModel, CoreMsg> = {
  acc: CoreModel;
  msgs: Msg<CoreMsg>[];
};

export type Slave<CoreModel, CoreMsg> = {
  acc: CoreModel;
  msgs: Msg<CoreMsg>[];
  sent?: Msg<CoreMsg>[];
  received?: Msg<CoreMsg>[];
};

export const initMaster = <CoreModel, CoreMsg>(
  acc: CoreModel
): Master<CoreModel, CoreMsg> => ({
  lastOrder: 0,
  acc,
  msgs: [],
});

export const initSlave = <CoreModel, CoreMsg>(
  acc: CoreModel
): Slave<CoreModel, CoreMsg> => ({
  acc,
  msgs: [],
});

export type Msg<CoreMsg> = CoreMsg & { order: number };

export const commitMaster = <CoreModel, CoreMsg>(
  model: Master<CoreModel, CoreMsg>,
  msg: CoreMsg,
  updateCore: (model: CoreModel, msg: CoreMsg) => CoreModel
): {
  model: Master<CoreModel, CoreMsg>;
  msg: Msg<CoreMsg>;
} => {
  const order = model.lastOrder + 1;
  const msgNew: Msg<CoreMsg> = { ...msg, order };
  const msgsNew: Msg<CoreMsg>[] = [...model.msgs, msgNew];

  const accNew = msgsNew
    .slice(0, 3)
    .reduce((acc, msg) => updateCore(acc, msg), model.acc);

  return {
    model: {
      lastOrder: order,
      acc: accNew,
      msgs: msgsNew,
    },
    msg: msgNew,
  };
};

export const commitSlave = <CoreModel, CoreMsg>(
  model: Slave<CoreModel, CoreMsg>,
  msg: Msg<CoreMsg>,
  updateCore: (model: CoreModel, msg: CoreMsg) => CoreModel
): Slave<CoreModel, CoreMsg> => {
  const msgs = [...model.msgs, msg];
  const sorted = msgs.sort((a, b) => a.order - b.order);
  const acc = sorted.reduce((acc, msg) => updateCore(acc, msg), model.acc);
  return { acc, msgs };
};

export const updateSlave = <CoreModel, CoreMsg>(
  model: Slave<CoreModel, CoreMsg>,
  msg: Msg<CoreMsg>,
  updateCore: (model: CoreModel, msg: CoreMsg) => CoreModel
): Slave<CoreModel, CoreMsg> => {
  const msgs = [...model.msgs, msg];
  const sorted = msgs.sort((a, b) => a.order - b.order);
  const acc = sorted.reduce((acc, msg) => updateCore(acc, msg), model.acc);
  return { acc, msgs };
};
