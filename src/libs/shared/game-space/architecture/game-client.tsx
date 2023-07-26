import { Cmd, Sub } from "@gamezilla/core";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { VDom } from "@gamezilla/ui";
import { GameSpaceClientCtx, GameSpaceViewCtx } from "../game-space-client";
import { GameSpaceMsg } from "../game-space-core";

export type GameClient<Model, ServerModel, Msg, ToClient, ToServer> = {
  init: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ClientAppMsg[];
  };

  update: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: Msg;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ClientAppMsg[];
  };

  updateFromServer: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: ToClient;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ClientAppMsg[];
  };

  updateFromGameSpace: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: GameSpaceMsg;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ClientAppMsg[];
  };

  syncWithServer: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    server: ServerModel;
    client?: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ClientAppMsg[];
  };

  subscriptions: (input: {
    intervalId: string;
    ctx: GameSpaceClientCtx;
    model: Model;
  }) => Sub<Msg>;

  View: (input: {
    ctx: GameSpaceViewCtx;
    dispatch: (msg: Msg) => void;
    model: Model;
  }) => VDom;
};

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <T extends string, Model, ServerModel, Msg, ToClient, ToServer>(
  tag: T,
  client: GameClient<Model, ServerModel, Msg, ToClient, ToServer>
): GameClient<
  { t: T; c: Model },
  { t: T; c: ServerModel },
  { t: T; c: Msg },
  { t: T; c: ToClient },
  { t: T; c: ToServer }
> => {
  return {
    init: (input) => {
      const initial = client.init({
        ...input,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: initial.model },
        cmd: Cmd.tag_(tag, initial.cmd),
        msgs: initial.msgs,
      };
    },
    update: (input) => {
      const updated = client.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.tag_(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    updateFromServer: (input) => {
      const updated = client.updateFromServer({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.tag_(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    updateFromGameSpace: (input) => {
      const updated = client.updateFromGameSpace({
        ...input,
        msg: input.msg,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.tag_(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    syncWithServer: (input) => {
      const updated = client.syncWithServer({
        ...input,
        server: input.server.c,
        client: input.client?.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.tag_(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    subscriptions: (input) => {
      return Sub.tag_(
        tag,
        client.subscriptions({
          ...input,
          model: input.model.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model.c}
        />
      );
    },
  };
};

export const GameClient = {
  tag,
};
