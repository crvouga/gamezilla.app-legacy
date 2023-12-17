import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client-v2";
import { SpaceClientEvt } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Button, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./play.core";

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: GameEvent;
  GameState: GameState;
  Ctx: FlowClientCtx;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvt: SpaceClientEvt;
  OutEvt: null;
  InCmd: null;
}>;

const init: Module["init"] = {
  grid: FlowGridUIPlay.init(),
};

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromMsg({ ...input, model })
  );
};

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "grid-play": {
      const grid = FlowGridUIPlay.update({
        msg: msg.c,
        model: model.grid,
      });
      return {
        model: {
          grid,
        },
      };
    }
  }
};

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

const View: Module["View"] = ({ model, dispatch, ctx }) => {
  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <div class="flex flex-1 items-center justify-center">
        <FlowGridUIPlay.View
          dispatch={(c) => dispatch({ t: "grid-play", c })}
          model={model.grid}
        />
      </div>
      <div class="w-full p-4">
        <Button
          class="w-full"
          onClick={ctx.onExit}
          start={<IconArrowLeftOnRect class="h-6 w-6" />}
          text="Exit"
        />
      </div>
    </div>
  );
};

export const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return null;
};

export const PlayClient: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
