import { GameLayout, ViewBottomButtonBar } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceClientEvent } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  VDom,
  cn
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { Flow, FlowGridUI, FlowGridUIPlay, FlowUI } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { ViewProfileCard } from "../../@SHARED/ui";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
  toCurrentPlacingGroupId,
} from "./puzzle-builder.core";

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
  InCmd: null;
  OutEvent: null;
}>;

const init: Module["init"] = null;

const update: Module["update"] = (input) => {
  const { model, msg } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    default: {
      const gameEvent = withId(msg);
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

const View: Module["View"] = (input) => {
  const { gameState, dispatch, ctx } = input;

  const isSpectating = ctx.currentUserId !== ctx.space.hostId;

  if (isSpectating) {
    return <ViewSpectaing {...input} />;
  }

  switch (gameState.mode.t) {
    case "edit": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPenToSquare {...props} />}
            label="Edit Mode"
            color="yellow"
          />

          <div className="flex flex-1 flex-col items-center justify-end">
            <div className="flex w-full items-center justify-center gap-1 pb-2">
              Placing
              <ViewTerminal
                groupId={toCurrentPlacingGroupId(gameState)}
                className="h-6 w-6"
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center overflow-y-scroll">
            <FlowGridUI.View
              model={gameState.grid}
              onPressDown={(nodeId) => {
                dispatch({
                  t: "user-pressed-down-node",
                  nodeId,
                });
              }}
            />
          </div>

          <div className="flex-1"></div>

          {!isSpectating && (
            <ViewBottomButtonBar
              actions={[
                {
                  label: "Exit Builder",
                  icon: <IconArrowLeftOnRect className="h-6 w-6" />,
                  onClick: ctx.onQuit,
                },
                {
                  label: "Play Mode",
                  icon: <IconPlay className="h-6 w-6" />,
                  onClick: () =>
                    dispatch({
                      t: "user-changed-to-play-mode",
                      userId: ctx.currentUserId,
                    }),
                },
              ]}
            />
          )}
        </div>
      );
    }

    case "play": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPlay {...props} />}
            label="Play Mode"
            color="blue"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
            <FlowGridUIPlay.View
              model={{ ...gameState.play, grid: gameState.grid }}
              dispatch={(m) => dispatch({ t: "play-ui", c: m })}
            />
          </div>
          {!isSpectating && (
            <ViewBottomButtonBar
              actions={[
                {
                  label: "Exit Builder",
                  icon: <IconArrowLeftOnRect className="h-6 w-6" />,
                  onClick: ctx.onQuit,
                },
                {
                  label: "Edit Mode",
                  icon: <IconPenToSquare className="h-6 w-6" />,
                  onClick: () =>
                    dispatch({
                      t: "user-changed-to-edit-mode",
                      userId: ctx.currentUserId,
                    }),
                },
              ]}
            />
          )}
        </div>
      );
    }
  }
};

const ViewSpectaing: Module["View"] = ({ gameState, dispatch, ctx }) => {
  return (
    <GameLayout isSpectating>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
        <ViewProfileCard
          profile={ctx.profiles[ctx.space.hostId]}
          subtitle="Editor"
        />
        <FlowGridUI.View
          model={gameState.grid}
          onPressDown={(nodeId) => {
            dispatch({
              t: "user-pressed-down-node",
              nodeId,
            });
          }}
        />
      </div>
    </GameLayout>
  );
};

const ViewTerminal = ({
  groupId,
  className,
}: {
  className: string;
  groupId: Flow.GroupId;
}) => {
  const color = FlowUI.Color.groupIdToHex(groupId);
  return (
    <svg className={className} viewBox="-1 -1 2 2">
      <circle cx="0" cy="0" r="0.8" fill={color} />
    </svg>
  );
};

const ViewModeBar = (props: {
  icon: (props: { className: string }) => VDom;
  label: string;
  color: "blue" | "yellow";
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 p-1 text-base text-white",
        props.color === "blue" ? "bg-blue-500" : "bg-amber-500"
      )}
    >
      {props.icon({ className: "h-4 w-4" })}
      {props.label}
    </div>
  );
};

const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return <div></div>;
};

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

export const PuzzleBuilderClient: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
