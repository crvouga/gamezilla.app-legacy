import { ViewBottomButtonBar } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ClientCmd, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, chain } from "gamezilla/@SHARED/core";
import { FlowGridUI, FlowGridUIPlay, FlowUI } from "../../@SHARED/flow";
import { FlowViewCtx } from "../../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  initCore,
} from "./puzzle-builder.core";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
  ClientCtx: SpaceClientCtx;
  ViewCtx: FlowViewCtx;
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
}>;

const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model };
  }
  return { model: initCore };
};

const update: Client["update"] = (input) => {
  return chain(init(input), (model) => {
    const { msg } = input;

    if (!msg) {
      return { model };
    }

    switch (msg.t) {
      case "play-ui": {
        const updated = FlowGridUIPlay.update({
          model: model.playUI,
          msg: msg.c,
        });
        return { model: { ...model, playUI: updated.model } };
      }

      default: {
        return { model, cmd: [sendToServer(msg)] };
      }
    }
  });
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
  if (!model) {
    return <div></div>;
  }
  switch (model.mode) {
    case "edit": {
      return (
        <div class="flex h-full w-full flex-col items-center justify-center">
          <div class="flex w-full items-center justify-center gap-2 bg-yellow-500 p-2 text-xl text-white">
            <IconPenToSquare class="h-6 w-6" />
            Edit Mode
          </div>
          <div class="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
            <FlowGridUI.View
              model={model.editUI}
              onPressDown={(nodeId) => {
                dispatch({
                  t: "pressed-down-node",
                  nodeId,
                });
              }}
            />

            <div class="flex w-full snap-x flex-col items-center overflow-x-auto px-4">
              <svg viewBox="-1 -1 2 2" class={cn("h-12 w-12")}>
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
                icon: <IconArrowLeftOnRect class="h-6 w-6" />,
                onClick: ctx.onExit,
              },
              {
                label: "Play Mode",
                icon: <IconPlay class="h-6 w-6" />,
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
        <div class="flex h-full w-full flex-col items-center justify-center">
          <div class="flex w-full items-center justify-center gap-2 bg-blue-500 p-2 text-xl text-white">
            <IconPlay class="h-6 w-6" />
            Play Mode
          </div>
          <div class="flex w-full flex-1 flex-col items-center justify-center gap-3">
            <FlowGridUIPlay.View
              model={model.playUI}
              dispatch={(m) => dispatch({ t: "play-ui", c: m })}
            />
          </div>
          <ViewBottomButtonBar
            actions={[
              {
                label: "Exit Builder",
                icon: <IconArrowLeftOnRect class="h-6 w-6" />,
                onClick: ctx.onExit,
              },
              {
                label: "Edit Mode",
                icon: <IconPenToSquare class="h-6 w-6" />,
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

const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

export const PuzzleBuilderClient: Client = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem: () => null,
};
