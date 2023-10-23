import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  playSound,
  sendToServer,
} from "gamezilla/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla/app/@SHARED/ui";
import { GameClient } from "gamezilla/app/space/@SHARED";
import { ViewBottomButtonBar } from "gamezilla/app/space/game/@SHARED";
import { FlowGridUIPlay, FlowGridUI, FlowUI } from "../@SHARED/flow";
import { FlowViewCtx } from "../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  initCore,
  updateCore,
} from "./puzzle-builder.core";

type Client = GameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  null,
  null,
  FlowViewCtx
>;

const init: Client["init"] = () => {
  return { model: initCore };
};

const update: Client["update"] = (input) => {
  const { msg, model } = input;

  switch (msg.t) {
    case "play-ui": {
      const updated = FlowGridUIPlay.update({
        model: model.playUI,
        msg: msg.c,
      });
      return { model: { ...model, playUI: updated.model } };
    }

    default: {
      const updated = updateCore({ ...input, msg });

      const modelNew: ClientModel =
        updated.t === "ok" ? { ...model, ...updated.value } : input.model;

      return { model: modelNew, cmd: [sendToServer(msg)] };
    }
  }
};

const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, msg, model } = input;

  switch (msg.t) {
    default: {
      const { result } = msg;
      if (result.t === "err") {
        return { model };
      }

      return chain(model, (model) => {
        if (msg.t === "input-mode") {
          return { model, cmd: [playSound(APP_SOUND.tap)] };
        }
        return { model };
      });
    }
  }
};

const updateFromEvent: Client["updateFromEvent"] = (input) => {
  return input;
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const updateFromGame: Client["updateFromGame"] = (input) => {
  return init(input);
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
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
                onClick: ctx.onExit,
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
                onClick: ctx.onExit,
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

const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

export const PuzzleBuilderClient: Client = {
  init,
  update,
  updateFromServer,
  updateFromEvent,
  subscriptions,
  updateFromGame,
  View,
};
