import { Cmd } from "@gamezilla/core";
import { ServerGameSpaceMsg } from "@gamezilla/shared/game-space";
import { VDom } from "@gamezilla/ui";
import {
  ClientAppMsg,
  ClientGameSpaceCtx,
  ClientGameSpaceMsg,
  ClientGameSpaceViewCtx,
} from "../client";
import { ServerAppMsg, SpaceServerCtx } from "../server";
import { GameSpaceId, UserId } from "./data";

export type GameSpace = {
  visibility?: "public" | "private";
  status?: "started" | "ended";
  gameSpaceId: GameSpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
};

type GameClientUpdate<Model, Msg> = {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
};

export type GameClient<Name extends string, Model, Msg, ToClient, ToServer> = {
  name: Name;

  init: (input: {
    ctx: ClientGameSpaceCtx;
    sendToServer: (m: ToServer) => Cmd;
  }) => GameClientUpdate<Model, Msg>;

  update: (input: {
    ctx: ClientGameSpaceCtx;
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
    ctx: ClientGameSpaceCtx;
    sendToServer: (m: ToServer) => Cmd;
    msg: ClientGameSpaceMsg;
    model: Model;
  }) => GameClientUpdate<Model, Msg>;

  subscriptions: (input: { ctx: ClientGameSpaceCtx; model: Model }) => Cmd<Msg>;

  View: (input: {
    ctx: ClientGameSpaceViewCtx;
    dispatch: (msg: Msg) => void;
    model: Model;
  }) => VDom;
};

type GameServerUpdate<Model, Msg> = {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
};

export type GameServer<Name extends string, Model, Msg, ToClient, ToServer> = {
  name: Name;

  init: (input: {
    ctx: SpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
  }) => GameServerUpdate<Model, Msg>;

  update: (input: {
    ctx: SpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: Msg;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  updateFromClient: (input: {
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: ToServer;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  updateFromGameSpace: (input: {
    ctx: SpaceServerCtx;
    sendToClient: (m: ToClient) => Cmd;
    sendToSpace: (m: ToClient) => Cmd;
    msg: ServerGameSpaceMsg;
    model: Model;
  }) => GameServerUpdate<Model, Msg>;

  subscriptions: (input: { ctx: SpaceServerCtx; model: Model }) => Cmd<Msg>;
};
