import { Cmd, Sub } from "@gamezilla/core";
import { VDom } from "@gamezilla/ui";

/**
 * Represents all the functions needed to run a game client side
 */
export type Client<Model, Msg, ToClient, ToServer, CtxMsg, CtxView, CtxUpdate> =
  {
    init: (input: { ctx: CtxUpdate; sendToServer: (m: ToServer) => Cmd }) => {
      model: Model;
      cmd?: Cmd<Msg>;
      msgs?: CtxMsg[];
    };

    update: (input: {
      ctx: CtxUpdate;
      sendToServer: (m: ToServer) => Cmd;
      msg: Msg;
      model: Model;
    }) => {
      model: Model;
      cmd?: Cmd<Msg>;
      msgs?: CtxMsg[];
    };

    updateFromServer: (input: {
      ctx: CtxUpdate;
      sendToServer: (m: ToServer) => Cmd;
      msg: ToClient;
      model: Model;
    }) => {
      model: Model;
      cmd?: Cmd<Msg>;
      msgs?: CtxMsg[];
    };

    updateFromParent: (input: {
      ctx: CtxUpdate;
      sendToServer: (m: ToServer) => Cmd;
      msg: CtxMsg;
      model: Model;
    }) => {
      model: Model;
      cmd?: Cmd<Msg>;
      msgs?: CtxMsg[];
    };

    subscriptions: (input: {
      intervalId: string;
      ctx: CtxUpdate;
      model: Model;
    }) => Sub<Msg>;

    View: (input: {
      ctx: CtxView;
      dispatch: (msg: Msg) => void;
      model: Model;
    }) => VDom;
  };

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <
  T extends string,
  Model,
  Msg,
  ToClient,
  ToServer,
  GlobalMsg,
  UpdateCtx,
  ViewCtx
>(
  tag: T,
  client: Client<Model, Msg, ToClient, ToServer, GlobalMsg, ViewCtx, UpdateCtx>
): Client<
  { t: T; c: Model },
  { t: T; c: Msg },
  { t: T; c: ToClient },
  { t: T; c: ToServer },
  GlobalMsg,
  ViewCtx,
  UpdateCtx
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
    updateFromParent: (input) => {
      const updated = client.updateFromParent({
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

const Client = {
  tag,
};
