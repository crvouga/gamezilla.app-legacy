import { UserId } from "gamezilla/app/@";
import { ClientCtx, Route, ViewCtx } from "gamezilla/app/@";
import { Cmd, RemoteResult, Sub, exhaustive, p } from "gamezilla/@/core";
import { Mic } from "./mic";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./party.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = ({
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
}): [Model, Cmd<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      //
      requests: {},
      volume: 0,
    },
    sendToServer(["party-get", null]),
  ];
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = (
  { sendToServer }: { sendToServer: (msg: ToServer) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "clicked-banner": {
      return [model, Cmd.None];
    }

    case "MicSound": {
      return [{ ...model, volume: msg[1].volume }, Cmd.None];
    }

    case "MicUnload":
    case "MicLoad": {
      return [model, Cmd.None];
    }

    case "party-get":
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyLeave":
    case "PartyJoin": {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg[0]]: RemoteResult.Loading },
        },
        sendToServer(msg),
      ];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromServer = (
  { currentUserId }: { currentUserId: UserId },
  msg: ToClient,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "party-get":
    case "PartyDestroy":
    case "PartyCreate":
    case "PartyJoin":
    case "PartyLeave": {
      const requestsNew: Model["requests"] = {
        ...model.requests,
        [msg[0]]: RemoteResult.map(msg[2], () => null),
      };

      if (msg[2].t === "err") {
        return [{ ...model, requests: requestsNew }, Cmd.None];
      }

      const modelNext: Model = {
        ...model,
        requests: requestsNew,
        ...msg[2].value,
      };

      const cmd = toLifecycleCmd({
        currentUserId,
        modelNext: modelNext,
        modelPrev: model,
      });

      return [modelNext, cmd];
    }
    default: {
      return exhaustive(msg[0]);
    }
  }
};

const toLifecycleCmd = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId;
  modelPrev: Model;
  modelNext: Model;
}): Cmd<Msg> => {
  const userPrev = modelPrev.users[currentUserId];
  const userNext = modelNext.users[currentUserId];

  // did user just leave party?
  if (userPrev && !userNext) {
    return p(
      Mic.unload,
      Cmd.perform((result) => ["MicUnload", result])
    );
  }

  // did user just join party?
  if (!userPrev && userNext) {
    return p(
      Mic.load,
      Cmd.perform((result) => ["MicLoad", result])
    );
  }

  return Cmd.None;
};

export type Action = ["party", ["Msg", Msg]];

export const runAction = (
  wire: { sendToServer: (msg: ToServer) => Cmd },
  action: Action,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
      return update(wire, action[1][1], model);
    }
  }
};

//
//
//
// View
//
//
//

export const ViewPage = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ClientCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return <ViewNotInParty ctx={ctx} model={model} dispatch={dispatch} />;
  }

  const party = model.parties[user.partyId];

  if (!party) {
    return <ViewNotInParty ctx={ctx} model={model} dispatch={dispatch} />;
  }

  return <div></div>;
};

const ViewNotInParty = (_props: {
  ctx: ClientCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return <div></div>;
};

export const ViewBanner = ({
  model,
  ctx,
}: {
  ctx: ViewCtx;
  route: Route;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return null;
  }

  const party = model.parties[user.partyId];

  if (!party) {
    return null;
  }

  return <div></div>;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
