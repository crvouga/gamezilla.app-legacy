import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ServerCmd, ServerEvt } from "gamezilla/app/@SHARED/server";
import {
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
  SpaceServerCtx,
} from "../space";

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
  init: (input: { ctx: SpaceServerCtx }) => {
    model: Model;
    eff?: Eff<Msg>;
    evt?: ServerEvt[];
  };

  /**
   * This handles updates from the server
   */
  update: (input: { ctx: SpaceServerCtx; msg: Msg; model: Model }) => {
    model: Model;
    eff?: Eff<Msg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  };

  /**
   * This handles updates from the client.
   */
  updateFromClient: (input: {
    ctx: SpaceReqCtx;
    msg: ToServer;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  };

  /**
   * This handles updates from the game space itself.
   */
  updateFromEvt: (input: {
    ctx: SpaceServerCtx;
    msg: SpaceEvt;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  };

  /**
   *
   * @param intervalId
   * @param model
   * @returns
   */
  subscriptions: (intervalId: string, model: Model) => Sub<Msg>;
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
      const initial = server.init(input);
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        evt: initial.evt,
      };
    },
    update: (input) => {
      const updated = server.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromClient: (input) => {
      const updated = server.updateFromClient({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromEvt: (input) => {
      const updated = server.updateFromEvt({
        ...input,
        msg: input.msg,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
      };
    },
    subscriptions: (intervalId, model) => {
      return Sub.tag(tag, server.subscriptions(intervalId, model.c));
    },
  };
};

export const GameServer = {
  tag,
};
