import { Eff, Sub } from "gamezilla/@SHARED/core";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { ViewBottomButtonBar } from "gamezilla/app/space/game/@SHARED";
import { FlowGridPlayUI, FlowGridUI } from "../flow-grid";
import { FlowViewCtx } from "../flow-shared";
import { Color, groupIdToColor } from "../flow-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initCore,
} from "./puzzle-builder.core";

type Client = SpaceGameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer,
  FlowViewCtx
>;

type Model = ClientModel;

type Msg = ClientMsg;

const init: Client["init"] = () => {
  return { model: initCore };
};

const update: Client["update"] = (input) => {
  const { msg, model } = input;
  if (msg.t === "play-ui") {
    const updated = FlowGridPlayUI.update({ model: model.playUI, msg: msg.c });
    return {
      model: { ...model, playUI: updated.model },
      eff: Eff.t("play-ui", updated.eff),
    };
  }

  const handled = handle({ ...input, msg });

  const modelNew =
    handled.t === "ok" ? { ...model, ...handled.value } : input.model;

  return {
    model: modelNew,
    cmd: [{ t: "send-to-server", msg }],
  };
};

const updateFromServer: Client["updateFromServer"] = (
  input
): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  return input;
};

/**
 * @inheritdoc
 */
const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

const syncWithServer: Client["syncWithServer"] = ({ client, server }) => {
  const client_ = client ?? initCore;
  return { model: { ...client_, ...server } };
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
  if (model.mode === "play") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex w-full items-center justify-center gap-2 bg-blue-500 p-2 text-xl text-white">
          <IconPlay className="h-6 w-6" />
          Play Mode
        </div>
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
          <FlowGridPlayUI.View
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

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-center gap-2 bg-yellow-500 p-2 text-xl text-white">
        <IconPenToSquare className="h-6 w-6" />
        Edit Mode
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
        <FlowGridUI.View
          model={{
            ...model.editUI,
            draftTerminals: model.draftTerminals,
          }}
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
              fill={Color.toHex(groupIdToColor[model.activeGroupId])}
            />
          </svg>
          <p>{capitalize(groupIdToColor[model.activeGroupId])}</p>
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
};

const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

export const PuzzleBuilderClient: Client = {
  init,
  update,
  updateFromServer,
  updateFromEvt,
  syncWithServer,
  subscriptions,
  View,
};
