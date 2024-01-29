import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import { GameClientModule } from "../../@SHARED/architecture/game-client-v2";
import { ConnectFour } from "./@CHILD/connect-four/connect-four.client";
import { Flow } from "./@CHILD/flow/flow.client";
import {
  ClientModel,
  ClientMsg,
  GameMsg,
  GameName,
  GameModel,
  ToClient,
  ToServer,
} from "./game.core";

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameModel: GameModel;
  GameMsg: GameMsg;
  Ctx: SpaceClientCtx;
  InCmd: null;
  InEvent: SpaceClientEvent;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvent: null;
}>;

//
//
//
// Model
//
//
//

const init = (gameName: GameName): Module["init"] => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.init,
      };
    }

    case "flow": {
      return {
        t: "flow",
        c: Flow.init,
      };
    }
  }
};

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  const { ctx, msg, msgFromServer, msgCmd, msgEvent, msgGame, modelGame } =
    input;

  switch (modelGame.t) {
    case "connect-four": {
      const updated = ConnectFour.update({
        ctx,
        modelGame: modelGame.c,
        model:
          input.model?.t === "connect-four" ? input.model.c : ConnectFour.init,
        msgCmd: msgCmd,
        msgEvent: msgEvent,
        msgFromServer:
          msgFromServer?.t === "connect-four" ? msgFromServer.c : null,
        msgGame:
          msgGame?.t === "connect-four" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "connect-four" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "connect-four",
        (msgCmd) => ClientCmd.tag("connect-four", msgCmd),
        updated
      );

      return tagged;
    }

    case "flow": {
      const updated = Flow.update({
        ctx: ctx,
        modelGame: modelGame.c,
        model: input.model?.t === "flow" ? input.model.c : Flow.init,
        msgCmd: msgCmd,
        msgEvent: msgEvent,
        msgFromServer: msgFromServer?.t === "flow" ? msgFromServer.c : null,
        msgGame: msgGame?.t === "flow" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "flow" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "flow",
        (msgCmd) => ClientCmd.tag("flow", msgCmd),
        updated
      );

      return tagged;
    }
  }
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = (input): Sub<ClientMsg> => {
  const { modelGame, model } = input;

  switch (modelGame.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        ConnectFour.subscriptions({
          ctx: input.ctx,
          modelGame: modelGame.c,
          model: model.t === "connect-four" ? model.c : ConnectFour.init,
        })
      );
    }

    case "flow": {
      return Sub.tag(
        "flow",
        Flow.subscriptions({
          ctx: input.ctx,
          modelGame: modelGame.c,
          model: model.t === "flow" ? model.c : Flow.init,
        })
      );
    }
  }
};

//
//
//
// View
//
//
//

const View: Module["View"] = (input) => {
  const { model, ctx, modelGame, dispatch } = input;

  switch (modelGame.t) {
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
          modelGame={modelGame.c}
          model={model?.t === "connect-four" ? model.c : ConnectFour.init}
        />
      );
    }

    case "flow": {
      return (
        <Flow.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "flow", c })}
          modelGame={modelGame.c}
          model={model.t === "flow" ? model.c : Flow.init}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { msgGame, modelGame, ctx, dispatch } = input;

  switch (modelGame.t) {
    case "connect-four": {
      switch (msgGame.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              msgGame={msgGame.c}
              modelGame={modelGame.c}
              dispatch={(c) => dispatch({ t: "connect-four", c })}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    default: {
      return null;
    }
  }
};

export const Game = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
};
