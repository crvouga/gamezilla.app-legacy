import { Eff, Sub, andThen, p } from "gamezilla/@SHARED/core";
import { SpaceServerEvt, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
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

const updateBotMove: updateFromClient = ({ model }) => {
  const handled = handleBotMove(model);

  if (handled.t === "err") {
    return {
      model,
      eff: Eff.None,
    };
  }

  const modelNew = handled.value;

  return {
    model: modelNew,
  };
};

const updateFromClient_: updateFromClient = ({ ctx, msg, model }) => {
  switch (msg.t) {
    default: {
      const res: Res = { ...msg, result: handle({ ctx, msg, model }) };
      if (res.result.t === "err") {
        return { model, eff: Eff.None };
      }
      return { model: res.result.value, eff: Eff.None };
    }
  }
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvt;
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
