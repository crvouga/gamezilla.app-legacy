import { Cmd, Sub } from "@gamezilla/core";
import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { ServerAppMsg } from "@gamezilla/shared/server";
import { VDom } from "@gamezilla/ui";
import { GameSpaceClientCtx, GameSpaceViewCtx } from "./game-space-client";
import { GameSpaceServerCtx } from "./game-space-server";

//
//
//
//
//
//

export type GameSpace = {
  visibility?: "public" | "private";
  status?: "started" | "ended";
  gameSpaceId: GameSpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
};

//
//
//
//
//
//
//

export type GameSpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

//
//
//
//
//
//
//

type GameClientUpdate<Model, Msg> = {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
};

export type GameClient<Model, ServerModel, Msg, ToClient, ToServer> = {
  init: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
  }) => GameClientUpdate<Model, Msg>;

  update: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: Msg;
    model: Model;
  }) => GameClientUpdate<Model, Msg>;

  updateFromServer: (input: {
    sendToServer: (m: ToServer) => Cmd;
    msg: ToClient;
    model: Model;
  }) => GameClientUpdate<Model, Msg>;

  updateFromGameSpace: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: GameSpaceMsg;
    model: Model;
  }) => GameClientUpdate<Model, Msg>;

  syncWithServer: (input: {
    ctx: GameSpaceClientCtx;
    sendToServer: (m: ToServer) => Cmd;
    server: ServerModel;
    client?: Model;
  }) => GameClientUpdate<Model, Msg>;

  subscriptions: (input: { ctx: GameSpaceClientCtx; model: Model }) => Sub<Msg>;

  View: (input: {
    ctx: GameSpaceViewCtx;
    dispatch: (msg: Msg) => void;
    model: Model;
  }) => VDom;
};

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
