import { Eff, Sub, andThen, p } from "gamezilla/@SHARED/core";
import { SpaceEvt, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  handleBotMove,
  initShared,
} from "./vs-bot.core";

//
//
//
// model
//
//
//

export type Model = ServerModel;

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
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
    case "none": {
      return { model };
    }
  }
};

type updateFromClient = (input: {
  ctx: SpaceReqCtx;
  sendToClient: (m: ToClient) => Eff;
  broadcast: (m: ToClient) => Eff;
  msg: ToServer;
  model: Model;
}) => {
  model: Model;
  eff?: Eff<Msg>;
};

export const updateFromClient: updateFromClient = (input) => {
  return p(
    input,
    andThen((model) => updateFromClient_({ ...input, model })),
    andThen((model) => updateBotMove({ ...input, model }))
  );
};

const updateBotMove: updateFromClient = ({ broadcast, model }) => {
  const handled = handleBotMove(model);

  if (handled.t === "err") {
    return {
      model,
      eff: broadcast({ t: "bot-moved", result: handled }),
    };
  }

  const modelNew = handled.value;

  return {
    model: modelNew,
    // eff: p(
    //   Time.delay(2000),
    //   Eff.perform(() => null),
    //   Eff.chain(() => broadcast({ t: 'bot-moved', result: Ok(modelNew) }))
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
      if (res.result.t === "err") {
        return { model, eff: sendToClient(res) };
      }
      return { model: res.result.value, eff: broadcast(res) };
    }
  }
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "user-joined") {
    return {
      model: init({ userId: model.userId }),
    };
  }

  return { model };
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
