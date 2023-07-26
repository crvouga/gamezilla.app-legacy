import { Cmd, Sub } from "@gamezilla/core";
import { ServerAppMsg } from "@gamezilla/shared/server";
import { GameSpaceMsg } from "../game-space-core";
import { GameSpaceServerCtx } from "../game-space-server";
//
//
//
//
//
//
//

type GameServerUpdate<Model, Msg> = {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
};

export type GameServer<Model, Msg, ToClient, ToServer> = {
  /**
   * This returns the initial state
   */
  init: (input: {
    ctx: GameSpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
  }) => GameServerUpdate<Model, Msg>;

  /**
   * This handles updates from the server
   */
  update: (input: {
    ctx: GameSpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: Msg;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  /**
   * This handles updates from the client.
   */
  updateFromClient: (input: {
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: ToServer;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  /**
   * This handles updates from the game space itself.
   */
  updateFromGameSpace: (input: {
    ctx: GameSpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: GameSpaceMsg;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  subscriptions: (input: { ctx: GameSpaceServerCtx; model: Model }) => Sub<Msg>;
};

export const tagServer = <T extends string, Model, Msg, ToClient, ToServer>(
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
        cmd: Cmd.tag_(tag, initial.cmd),
        msgs: initial.msgs,
      };
    },
    update: (input) => {
      const updated = server.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        cmd: Cmd.tag_(tag, updated.cmd),
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
        cmd: Cmd.tag_(tag, updated.cmd),
        msgs: updated.msgs,
      };
    },
    updateFromGameSpace: (input) => {
      const updated = server.updateFromGameSpace({
        ...input,
        msg: input.msg,
        model: input.model.c,
        sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
        sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
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
        server.subscriptions({
          ...input,
          model: input.model.c,
        })
      );
    },
  };
};

const tagInit =
  <T extends string, Model, Msg, ToClient, ToServer>(
    tag: T,
    init: GameServer<Model, Msg, ToClient, ToServer>["init"]
  ): GameServer<
    { t: T; c: Model },
    { t: T; c: Msg },
    { t: T; c: ToClient },
    { t: T; c: ToServer }
  >["init"] =>
  (input) => {
    const initial = init({
      ...input,
      sendToClient: (m) => input.sendToClient({ t: tag, c: m }),
      sendToSpace: (m) => input.sendToSpace({ t: tag, c: m }),
    });
    return {
      model: { t: tag, c: initial.model },
      cmd: Cmd.tag_(tag, initial.cmd),
      msgs: initial.msgs,
    };
  };

export const GameServer = {
  tagInit,
};
