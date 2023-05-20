import {
  RoomCtx,
  RoomViewCtx,
  ViewBottomButtonBar,
} from '@gamezilla/shared/client';
import { Cmd, andThen, p } from '@gamezilla/shared/core';
import {
  IconArrowLeftOnRect,
  IconPenToSquare,
  IconPlay,
  cn,
} from '@gamezilla/shared/ui';
import { Color, Flow, groupIdToColor } from '../flow';
import { FlowGridUI } from '../flow-grid';
import { GroupId } from '../flow/flow';
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from './puzzle-builder.shared';

type Model = ClientModel;

type Msg = ClientMsg;

export const init: Model = {
  ...initShared,
  t: 'idle',
};

const toActiveGroupInputHtmlId = (id: GroupId) => `group-${id}`;

export const update = (input: {
  msg: Msg;
  model: Model;
  ctx: RoomCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen(({ model }) => updateRequest({ ...input, model })),
    andThen(({ model }) => updateUI({ ...input, model }))
  );
};

const updateUI = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
  ctx: RoomCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.mode === 'edit-groups') {
    if (msg.t === 'pressed-down-node') {
      const toggledGrid = Flow.toggleNodeGroup(
        model.grid,
        msg.nodeId,
        model.focusedGroupId
      );

      return {
        model: {
          ...model,
          grid: toggledGrid,
        },
      };
    }
  }

  if (model.mode === 'play') {
    return { model };
  }

  return { model };
};

const updateRequest = ({
  msg,
  model,
  ctx,
  sendToServer,
}: {
  msg: Msg;

  model: Model;
  ctx: RoomCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-active-group' || msg.t === 'input-mode') {
    const handled = handle({ ctx, msg, model });

    const modelNew =
      handled.type === 'Ok' ? { ...model, ...handled.value } : model;
    return { model: modelNew, cmd: sendToServer(msg) };
  }
  return { model };
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

export const mergeWithServer = ({
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
  ctx: RoomViewCtx;
}) => {
  if (model.mode === 'play') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full p-2 flex gap-2 items-center justify-center text-xl bg-blue-500 text-white">
          <IconPlay />
          Play Mode
        </div>
        <div className="w-full flex-1 gap-3 flex flex-col items-center justify-center">
          <div className="flex-1"></div>
          <div className="flex-1 w-full">
            <FlowGridUI.View model={model} $send={$send} />
          </div>
          <div className="flex-1"></div>
        </div>
        <ViewBottomButtonBar
          actions={[
            {
              label: 'Exit Builder',
              icon: <IconArrowLeftOnRect />,
              onClick: onExit,
            },
            {
              label: 'Edit Mode',
              icon: <IconPenToSquare />,
              onClick: () => {
                $send({ t: 'input-mode', mode: 'edit-groups' });
              },
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full p-2 flex gap-2 items-center justify-center text-xl bg-yellow-500 text-white">
        <IconPenToSquare />
        Edit Mode
      </div>
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="flex-1"></div>

        <div className="flex-1 w-full">
          <FlowGridUI.View model={model} $send={$send} />
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 snap-x w-full overflow-x-auto">
          {Flow.groupIdOrder.map((groupId) => {
            return (
              <button
                key={groupId}
                id={toActiveGroupInputHtmlId(groupId)}
                className={cn(
                  'snap-mandatory flex items-center justify-center gap-1 flex-col',
                  model.focusedGroupId === groupId ? '' : 'opacity-50'
                )}
                onClick={() => $send({ t: 'input-active-group', groupId })}
              >
                <svg viewBox="-1 -1 2 2" className={cn('w-16 h-16')}>
                  <circle
                    cx={0}
                    cy={0}
                    r={model.focusedGroupId === groupId ? 1 : 0.7}
                    fill={Color.toHex(groupIdToColor[groupId])}
                  />
                </svg>
                <p>{capitalize(Color.groupIdToColor[groupId])}</p>
              </button>
            );
          })}
        </div>
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            label: 'Play Mode',
            icon: <IconPlay />,
            onClick: () => {
              $send({ t: 'input-mode', mode: 'play' });
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
