import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceClientEvent } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Button, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { GameLayout } from "../../../../@SHARED/game";
import { FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { samples } from "../../@SHARED/flow/flow-grid/flow-grid-samples";
import { ViewProfileCard } from "../../@SHARED/ui";
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
  InEvent: SpaceClientEvent;
  OutEvent: null;
  InCmd: null;
}>;

const grid = samples["8x8"][0];
const init: Module["init"] = {
  gridPlay: FlowGridUIPlay.init({ grid }),
  grid,
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
    case "grid": {
      const gridPlayNew = FlowGridUIPlay.update({
        msg: msg.c,
        model: model.gridPlay,
        grid: model.grid,
      });
      return {
        model: {
          gridPlay: gridPlayNew,
          grid: model.grid,
        },
      };
    }

    case "msgEvent": {
      const msgGameEvent = withId(msg.c);
      return {
        model,
        msgGameEvent: [msgGameEvent],
      };
    }
  }
};

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

const USE_GAME_STATE = true;

const View: Module["View"] = ({ model, modelGameState, dispatch, ctx }) => {
  const isPlaying = ctx.currentUserId === ctx.space.hostId;
  const isSpectating = !isPlaying;
  const host = ctx.profiles[ctx.space.hostId];
  return (
    <GameLayout isSpectating={isSpectating}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {isSpectating && host && (
          <ViewProfileCard profile={host} subtitle="Player" />
        )}
        {USE_GAME_STATE ? (
          <FlowGridUIPlay.View
            dispatch={(c) => dispatch({ t: "msgEvent", c: { t: "grid", c } })}
            model={modelGameState.gridPlay}
            disabled={isSpectating}
            grid={modelGameState.grid}
          />
        ) : (
          <FlowGridUIPlay.View
            dispatch={(c) => dispatch({ t: "grid", c })}
            model={model.gridPlay}
            grid={model.grid}
            disabled={isSpectating}
          />
        )}
      </div>
      {isPlaying && (
        <div className="w-full p-4">
          <Button
            className="w-full"
            onClick={ctx.onQuit}
            start={<IconArrowLeftOnRect className="h-6 w-6" />}
            text="Quit"
          />
        </div>
      )}
    </GameLayout>
  );
};

export const ViewFeedItem: Module["ViewFeedItem"] = ({ msgGameEvent }) => {
  switch (msgGameEvent.t) {
    case "grid": {
      switch (msgGameEvent.c.t) {
        case "dragged-over":
        case "left":
        case "pressed-down":
        case "pressed-up": {
          return null;
        }
        default: {
          return null;
        }
      }
    }
  }
};

export const PlayClient: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
