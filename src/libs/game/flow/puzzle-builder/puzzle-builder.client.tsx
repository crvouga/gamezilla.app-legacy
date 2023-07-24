import { Cmd } from "@gamezilla/core";
import {
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
} from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "@gamezilla/ui";
import { FlowGridPlayUI, FlowGridUI } from "../flow-grid";
import { Color, pathIdToColor } from "../flow-ui";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./puzzle-builder.shared";

type Model = ClientModel;

type Msg = ClientMsg;

export const init: Model = initShared;

export const update = ({
  msg,
  model,
  ctx,
  sendToServer,
}: {
  msg: Msg;
  model: Model;
  ctx: SpaceCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const handled = handle({ ctx, msg, model });

  const modelNew = handled.t === "ok" ? { ...model, ...handled.value } : model;

  return { model: modelNew, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const syncWithServer = ({
  client,
  server,
}: {
  client?: ClientModel;
  server: SharedModel;
}) => {
  const client_ = client ?? init;
  return { ...client_, ...server };
};

//
//
// View
//
//

export const View = ({
  model,
  dispatch,
  onExit,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
  onExit: () => void;
  ctx: SpaceViewCtx;
}) => {
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
              onClick: onExit,
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
            onClick: onExit,
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
