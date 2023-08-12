import { Cmd, Sub } from "gamezilla/@/core";
import { ServerAppMsg } from "gamezilla/app/@/server";
import { SpaceMsg, SpaceReqCtx, SpaceServerCtx } from "../space";
//
//
//
//
//
//
//

/**
 * This is the interface for a game server.
 */
export type GameServer<Model, Msg, ToClient, ToServer> = {
  /**
   * This returns the initial state
   */
  init: (input: {
    ctx: SpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ServerAppMsg[];
  };

  /**
   * This handles updates from the server
   */
  update: (input: {
    ctx: SpaceServerCtx;
    sendToSpace: (m: ToClient) => Cmd;
    msg: Msg;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ServerAppMsg[];
  };

  /**
   * This handles updates from the client.
   */
  updateFromClient: (input: {
    ctx: SpaceReqCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: ToServer;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ServerAppMsg[];
  };

  /**
   * This handles updates from the game space itself.
   */
  updateFromParent: (input: {
    ctx: SpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: SpaceMsg;
    model: Model;
  }) => {
    model: Model;
    cmd?: Cmd<Msg>;
    msgs?: ServerAppMsg[];
  };

  subscriptions: (input: {
    ctx: SpaceServerCtx;
    intervalId: string;
    model: Model;
  }) => Sub<Msg>;
};

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <T extends string, Model, Msg, ToClient, ToServer>(
  tag: T,
  server: GameServer<Model, Msg, ToClient, ToServer>
): GameServer<
  { t: T; c: Model },
  { t: T; c: Msg },
  { t: T; c: ToClient },
  { t: T; c: ToServer }
> => {
  return {
    init: (input) => {
      const initial = server.init({
        ...input,
        sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: initial.model },
        cmd: Cmd.t(tag, initial.cmd),
        msgs: initial.msgs,
      };
    },
    update: (input) => {
      const updated = server.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.t(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    updateFromClient: (input) => {
      const updated = server.updateFromClient({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.t(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    updateFromParent: (input) => {
      const updated = server.updateFromParent({
        ...input,
        msg: input.msg,
        model: input.model.c,
        sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.t(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    subscriptions: (input) => {
      return Sub.tag(
        tag,
        server.subscriptions({
          ...input,
          model: input.model.c,
        })
      );
    },
  };
};

export const GameServer = {
  tag,
};
