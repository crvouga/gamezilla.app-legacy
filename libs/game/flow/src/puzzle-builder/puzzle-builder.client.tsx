import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/client';
import { Cmd } from '@gamezilla/shared/core';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { Color, Flow, groupIdToColor } from '../flow';
import { FlowGridUI } from '../flow-grid';
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  initShared,
} from './puzzle-builder.shared';

type Model = ClientModel;

type Msg = ClientMsg;

export const init: Model = {
  ...initShared,
  t: 'idle',
};

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'flow-grid-ui') {
    return {
      model: { ...model },
    };
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
        <FlowGridUI.View
          model={model}
          $send={(c) => $send({ t: 'flow-grid-ui', c })}
        />
        <ViewColorSelector />
      </div>
      <ViewBottomButtonBar
        actions={[
          { label: 'Exit', icon: <IconArrowLeftOnRect />, onClick: onExit },
        ]}
      />
    </div>
  );
};

const ViewColorSelector = () => {
  return (
    <div className="flex items-center gap-3 px-4 snap-x w-full overflow-x-auto">
      {Flow.groupIdOrder.map((groupId) => {
        return (
          <div key={groupId} className="snap-mandatory">
            <svg viewBox="-1 -1 2 2" className="w-14 h-14">
              <circle
                cx={0}
                cy={0}
                r={1}
                fill={Color.toHex(groupIdToColor[groupId])}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
