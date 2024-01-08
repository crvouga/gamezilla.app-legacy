import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceClientEvent } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Avatar,
  Button,
  IconArrowLeftOnRect,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { GameLayout } from "../../../../@SHARED/game";
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
  InEvent: SpaceClientEvent;
  OutEvent: null;
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
    case "grid": {
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

    case "event": {
      const gameEvent = withId(msg.c);
      return {
        model,
        gameEvent: [gameEvent],
      };
    }
  }
};

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

const USE_GAME_STATE = true;

const View: Module["View"] = ({ model, gameState, dispatch, ctx }) => {
  const isPlaying = ctx.currentUserId === ctx.space.hostId;
  const isSpectating = !isPlaying;
  const host = ctx.profiles[ctx.space.hostId];
  return (
    <GameLayout isSpectating={isSpectating}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {isSpectating && host && (
          <div className="flex w-full items-center gap-2 p-2">
            <Avatar className="h-12 w-12" src={host.avatarUrl} />
            <div className="flex-1 flex flex-col">
              <p>{host.username}</p>
              <p className="text-secondary text-sm">Playing</p>
            </div>
          </div>
        )}
        {USE_GAME_STATE ? (
          <FlowGridUIPlay.View
            dispatch={(c) => dispatch({ t: "event", c: { t: "grid", c } })}
            model={gameState.grid}
            disabled={isSpectating}
          />
        ) : (
          <FlowGridUIPlay.View
            dispatch={(c) => dispatch({ t: "grid", c })}
            model={model.grid}
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

export const ViewFeedItem: Module["ViewFeedItem"] = ({ gameEvent }) => {
  switch (gameEvent.t) {
    case "grid": {
      switch (gameEvent.c.t) {
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
