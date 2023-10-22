import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameServer, sendToSpace } from "gamezilla/app/space/@SHARED";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCore,
  updateCore,
} from "./puzzle-builder.core";
import { sendBack } from "gamezilla/app/@SHARED/server";

type Server = SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  null,
  null
>;

const init: Server["init"] = () => {
  return {
    model: initCore,
  };
};

const update: Server["update"] = (input) => {
  return input;
};

const updateFromClient: Server["updateFromClient"] = (input) => {
  const { ctx, msg, model } = input;

  switch (msg.t) {
    default: {
      const updated = updateCore({
        ctx,
        msg,
        model,
      });

      if (updated.t === "err") {
        return {
          model,
          cmd: [sendBack(ctx, { ...msg, result: updated })],
        };
      }

      return {
        model: updated.value,
        cmd: [sendToSpace({ ...msg, result: updated })],
      };
    }
  }
};

const updateFromEvt: Server["updateFromEvt"] = (input) => {
  return input;
};

const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};

export const PuzzleBuilderServer: Server = {
  init,
  update,
  updateFromClient,
  updateFromEvt,
  subscriptions,
};
