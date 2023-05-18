import { RoomRequestCtx } from '@gamezilla/shared/backend';
import { Cmd, Sub, andThen, p } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import {
  BackendModel,
  ServerMsg,
  Res,
  ToBackend,
  ToFrontend,
  handle,
  handleBotMove,
  initShared,
} from './vs-bot.types';

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'none': {
      return { model };
    }
  }
};

type updateFromClient = (input: {
  ctx: RoomRequestCtx;
  sendToClient: (m: ToFrontend) => Cmd;
  broadcast: (m: ToFrontend) => Cmd;
  msg: ToBackend;
  model: Model;
}) => {
  model: Model;
  cmd?: Cmd<Msg>;
};

export const updateFromClient: updateFromClient = (input) => {
  return p(
    input,
    andThen(({ model }) => updateFromClient_({ ...input, model })),
    andThen(({ model }) => updateBotMove({ ...input, model }))
  );
};

const updateBotMove: updateFromClient = ({ broadcast, model }) => {
  const handled = handleBotMove(model);

  if (handled.type === 'Err') {
    return {
      model,
      cmd: broadcast({ t: 'bot-moved', result: handled }),
    };
  }

  const modelNew = handled.value;

  return {
    model: modelNew,
    // cmd: p(
    //   Time.delay(2000),
    //   Cmd.perform(() => null),
    //   Cmd.chain(() => broadcast({ t: 'bot-moved', result: Ok(modelNew) }))
    // ),
  };
};

const updateFromClient_: updateFromClient = ({
  ctx,
  sendToClient,
  broadcast,
  msg,
  model,
}) => {
  switch (msg.t) {
    default: {
      const res: Res = { ...msg, result: handle({ ctx, msg, model }) };
      if (res.result.type === 'Err') {
        return { model, cmd: sendToClient(res) };
      }
      return { model: res.result.value, cmd: broadcast(res) };
    }
  }
};

export const updateFromRoom = ({
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'user-left': {
      return {
        model: init({ userId: model.userId }),
      };
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
