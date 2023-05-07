import { RoomRequestCtx } from '@gamezilla/shared/backend';
import { Cmd, Sub, andThen, p } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import {
  BackendModel,
  BackendMsg,
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

export type Msg = BackendMsg;

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

type UpdateFromFrontend = (input: {
  ctx: RoomRequestCtx;
  sendToClient: (m: ToFrontend) => Cmd;
  broadcast: (m: ToFrontend) => Cmd;
  msg: ToBackend;
  model: Model;
}) => {
  model: Model;
  cmd?: Cmd<Msg>;
};

export const updateFromFrontend: UpdateFromFrontend = (input) => {
  return p(
    input,
    andThen(({ model }) => updateFromFrontend_({ ...input, model })),
    andThen(({ model }) => updateBotMove({ ...input, model }))
  );
};

const updateBotMove: UpdateFromFrontend = ({ broadcast, model }) => {
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

const updateFromFrontend_: UpdateFromFrontend = ({
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
