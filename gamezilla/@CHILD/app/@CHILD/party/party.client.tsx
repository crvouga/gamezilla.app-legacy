import { AppRoute, ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Eff,
  RemoteResult,
  Sub,
  exhaustive,
  isErr,
  p,
} from "gamezilla/@SHARED/core";
import { Mic } from "./mic";
import { ClientModel, ClientMsg, ToClient } from "./party.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (): [Model, Eff<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      //
      requests: {},
      volume: 0,
    },
    Eff.None,
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

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "clicked-banner": {
      return [model, Eff.None];
    }

    case "MicSound": {
      return [{ ...model, volume: msg[1].volume }, Eff.None];
    }

    case "MicUnload":
    case "MicLoad": {
      return [model, Eff.None];
    }

    case "party-get":
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyLeave":
    case "PartyJoin": {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg[0]]: RemoteResult.loading },
        },
        Eff.None,
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
): [Model, Eff<Msg>] => {
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

      if (isErr(msg[2])) {
        return [{ ...model, requests: requestsNew }, Eff.None];
      }

      const modelNext: Model = {
        ...model,
        requests: requestsNew,
        ...msg[2].value,
      };

      const eff = toLifecycleEff({
        currentUserId,
        modelNext: modelNext,
        modelPrev: model,
      });

      return [modelNext, eff];
    }
    default: {
      return exhaustive(msg[0]);
    }
  }
};

const toLifecycleEff = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId;
  modelPrev: Model;
  modelNext: Model;
}): Eff<Msg> => {
  const userPrev = modelPrev.users[currentUserId];
  const userNext = modelNext.users[currentUserId];

  // did user just leave party?
  if (userPrev && !userNext) {
    return p(
      Mic.unload,
      Eff.perform((result) => ["MicUnload", result])
    );
  }

  // did user just join party?
  if (!userPrev && userNext) {
    return p(
      Mic.load,
      Eff.perform((result) => ["MicLoad", result])
    );
  }

  return Eff.None;
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
  ctx: ClientCtx;
  route: AppRoute;
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
