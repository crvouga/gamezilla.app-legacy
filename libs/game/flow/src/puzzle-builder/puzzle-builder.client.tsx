import {
  RoomCtx,
  RoomViewCtx,
  ViewBottomButtonBar,
} from '@gamezilla/shared/client';
import { Browser, Cmd, p } from '@gamezilla/shared/core';
import { IconArrowLeftOnRect, cn } from '@gamezilla/shared/ui';
import { Color, Flow, groupIdToColor } from '../flow';
import { FlowGridUI } from '../flow-grid';
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from './puzzle-builder.shared';
import { GroupId } from '../flow/flow';

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
  const updated = update_(input);

  if (updated.model.focusedGroupId !== input.model.focusedGroupId) {
    const htmlId = toActiveGroupInputHtmlId(input.model.focusedGroupId);
    return {
      model: updated.model,
      cmd: p(
        Browser.scrollIntoView(htmlId),
        Cmd.perform((result) => ({ t: 'scroll-done', result }))
      ),
    };
  }

  return updated;
};

const update_ = ({
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
  if (msg.t === 'pressed-down-node') {
    console.log('TOGGLE', msg.t);
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

  if (msg.t === 'inputted-active-group') {
    const handled = handle({ ctx, msg, model });
    if (handled.type === 'Err') {
      return { model, cmd: sendToServer(msg) };
    }
    return { model: { ...model, ...handled.value }, cmd: sendToServer(msg) };
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
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex-1 gap-3 flex flex-col items-center justify-center">
        <FlowGridUI.View model={model} $send={$send} />

        <div className="flex items-center gap-3 px-4 snap-x w-full overflow-x-auto">
          {Flow.groupIdOrder.map((groupId) => {
            return (
              <button
                key={groupId}
                id={toActiveGroupInputHtmlId(groupId)}
                className={cn(
                  'snap-mandatory flex items-center justify-center gap-1 flex-col',
                  model.focusedGroupId === groupId ? '' : 'opacity-50'
                )}
                onClick={() => $send({ t: 'inputted-active-group', groupId })}
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
          { label: 'Exit', icon: <IconArrowLeftOnRect />, onClick: onExit },
        ]}
      />
    </div>
  );
};

const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};
