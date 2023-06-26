import {
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
} from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from "@gamezilla/shared/ui";
import { Color, groupIdToColor } from "../flow";
import { FlowGridPlayUI, FlowGridUI } from "../flow-grid";
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
  $send,
  onExit,
}: {
  model: Model;
  $send: (m: Msg) => void;
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
            $send={() => {
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
                $send({ t: "input-mode", mode: "edit" });
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
            terminals: model.draftTerminals,
          }}
          onPressDown={(nodeId) => {
            $send({
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
              fill={Color.toHex(groupIdToColor[model.focusedGroupId])}
            />
          </svg>
          <p>{capitalize(groupIdToColor[model.focusedGroupId])}</p>
          {/* {Flow.groupIdOrder.map((groupId) => {
            return (
              <button
                key={groupId}
                id={toActiveGroupInputHtmlId(groupId)}
                className={cn(
                  'snap-mandatory flex items-center justify-center gap-1 flex-col',
                  model.focusedGroupId === groupId
                    ? 'text-lg'
                    : 'opacity-50 text-sm'
                )}
                onClick={() => $send({ t: 'input-active-group', groupId })}
              >
                <svg viewBox="-1 -1 2 2" className={cn('w-16 h-16')}>
                  <circle
                    cx={0}
                    cy={0}
                    r={model.focusedGroupId === groupId ? 0.9 : 0.6}
                    fill={Color.toHex(groupIdToColor[groupId])}
                  />
                </svg>
                <p>{capitalize(Color.groupIdToColor[groupId])}</p>
              </button>
            );
          })} */}
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
              $send({ t: "input-mode", mode: "play" });
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
