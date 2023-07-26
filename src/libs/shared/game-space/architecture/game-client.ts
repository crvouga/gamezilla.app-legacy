import { Cmd, Sub } from "@gamezilla/core";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { VDom } from "@gamezilla/ui";
import { GameSpaceClientCtx, GameSpaceViewCtx } from "../game-space-client";
import { GameSpaceMsg } from "../game-space-core";

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
