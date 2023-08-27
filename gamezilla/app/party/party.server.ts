import { Eff, exhaustive } from "gamezilla/@SHARED/core";
import { PartyId, UserId } from "gamezilla/app/@SHARED/data";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
} from "./party.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = {
  parties: {},
  users: {},
};

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "none": {
      return [model, Eff.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromClient = (
  msg: ToServer,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyJoin":
    case "party-get":
    case "PartyLeave": {
      const res: Res = [...msg, handle(msg, model)];
      if (res[2].t === "err") {
        return [model, Eff.None];
      }
      return [res[2].value, Eff.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const sendToParty = ({
  model,
  partyId,
  msg,
  sendToUser,
}: {
  model: Model;
  partyId: PartyId;
  msg: ToClient;
  sendToUser: (userIds: UserId[], msg: ToClient) => Eff;
}): Eff => {
  const userIds: UserId[] = [];

  for (const userId in model.users) {
    if (UserId.is(userId) && model.users[userId]?.partyId === partyId) {
      userIds.push(userId);
    }
  }

  return sendToUser(userIds, msg);
};
