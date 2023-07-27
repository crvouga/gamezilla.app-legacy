import { Cmd, Sub } from "@gamezilla/core";
import { GameClient, ViewBottomButtonBar } from "@gamezilla/shared/game-space";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "@gamezilla/ui";
import { FlowGridPlayUI, FlowGridUI } from "../flow-grid";
import { FlowViewCtx } from "../flow-shared";
import { Color, pathIdToColor } from "../flow-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./puzzle-builder.core";

type Client = GameClient<
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
  return { model: initShared };
};

const update: Client["update"] = (input) => {
  const handled = handle(input);

  const modelNew =
    handled.t === "ok" ? { ...input.model, ...handled.value } : input.model;

  return { model: modelNew, cmd: input.sendToServer(input.msg) };
};

const updateFromServer: Client["updateFromServer"] = (
  input
): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return input;
};

const updateFromGameSpace: Client["updateFromGameSpace"] = (input) => {
  return input;
};

const syncWithServer: Client["syncWithServer"] = ({ client, server }) => {
  const client_ = client ?? initShared;
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
          <IconPlay />
          Play Mode
        </div>
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
          <FlowGridPlayUI.View
            model={model}
            dispatch={() => {
              //
            }}
          />
        </div>
        <ViewBottomButtonBar
          actions={[
            {
              label: "Exit Builder",
              icon: <IconArrowLeftOnRect />,
              onClick: ctx.onExit,
            },
            {
              label: "Edit Mode",
              icon: <IconPenToSquare />,
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
        <IconPenToSquare />
        Edit Mode
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
        <FlowGridUI.View
          model={{
            ...model.grid,
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
              fill={Color.toHex(pathIdToColor[model.activePathId])}
            />
          </svg>
          <p>{capitalize(pathIdToColor[model.activePathId])}</p>
        </div>
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            label: "Exit Builder",
            icon: <IconArrowLeftOnRect />,
            onClick: ctx.onExit,
          },
          {
            label: "Play Mode",
            icon: <IconPlay />,
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
  updateFromGameSpace,
  syncWithServer,
  subscriptions,
  View,
};
