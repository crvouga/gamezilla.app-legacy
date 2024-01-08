import { ViewBottomButtonBar } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { SpaceClientEvent } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowGridUI, FlowGridUIPlay, FlowUI } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  initCore,
} from "./puzzle-builder.core";

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
  Ctx: FlowClientCtx;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvent: SpaceClientEvent;
  InCmd: null;
  OutEvent: null;
}>;

const init: Module["init"] = initCore;

const update: Module["update"] = (input) => {
  const { model, msg } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "play-ui": {
      const updated = FlowGridUIPlay.update({
        model: model.playUI,
        msg: msg.c,
      });
      return { model: { ...model, playUI: updated } };
    }

    default: {
      return { model, cmd: [sendToServer(msg)] };
    }
  }
};

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

const View: Module["View"] = ({ model, dispatch, ctx }) => {
  switch (model.mode) {
    case "edit": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex w-full items-center justify-center gap-2 bg-yellow-500 p-2 text-xl text-white">
            <IconPenToSquare className="h-6 w-6" />
            Edit Mode
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
            <FlowGridUI.View
              model={model.editUI}
              onPressDown={(nodeId) => {
                dispatch({
                  t: "pressed-down-node",
                  nodeId,
                });
              }}
            />

            <div className="flex w-full snap-x flex-col items-center overflow-x-auto px-4">
              <svg viewBox="-1 -1 2 2" className={cn("h-12 w-12")}>
                <circle
                  cx={0}
                  cy={0}
                  r={1}
                  fill={FlowUI.Color.toHex(
                    FlowUI.Color.groupIdToColor[model.activeGroupId]
                  )}
                />
              </svg>
              <p>
                {capitalize(FlowUI.Color.groupIdToColor[model.activeGroupId])}
              </p>
            </div>
          </div>
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
                onClick: () => {
                  dispatch({ t: "input-mode", mode: "play" });
                },
              },
            ]}
          />
        </div>
      );
    }

    case "play": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex w-full items-center justify-center gap-2 bg-blue-500 p-2 text-xl text-white">
            <IconPlay className="h-6 w-6" />
            Play Mode
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
            <FlowGridUIPlay.View
              model={model.playUI}
              dispatch={(m) => dispatch({ t: "play-ui", c: m })}
            />
          </div>
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
                onClick: () => {
                  dispatch({ t: "input-mode", mode: "edit" });
                },
              },
            ]}
          />
        </div>
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return <div></div>;
};

const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

export const PuzzleBuilderClient: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
