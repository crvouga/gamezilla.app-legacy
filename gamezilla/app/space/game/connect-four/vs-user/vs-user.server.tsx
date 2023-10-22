import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import {
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
  sendToSpace,
} from "gamezilla/app/space/@SHARED";
import { appendEvt, withMeta } from "gamezilla/app/space/@SHARED/evt";
import {
  Evt,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
  toPlayerType,
} from "./vs-user.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initCore;

//
//
//
// Update
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
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case null: {
      return { model };
    }
  }
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  const modelNew: ServerModel = {
    events: appendEvt(model.events, msg),
    initialState: model.initialState,
  };

  return { model: modelNew, cmd: [sendToSpace(msg)] };
};

export const updateFromEvt = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "user-left": {
      const evt = withMeta<Evt>({ t: "user-left", userId: msg.userId });

      const modelNew: ServerModel = {
        ...model,
        events: appendEvt(model.events, withMeta(evt)),
      };

      return { model: modelNew, cmd: [sendToSpace(evt)] };
    }

    default: {
      return { model };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  return Sub.None;
};
