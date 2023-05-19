import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/client';
import { Cmd } from '@gamezilla/shared/core';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
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
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <FlowGridUI.View
          model={model}
          $send={(c) => $send({ t: 'flow-grid-ui', c })}
        />
      </div>
      <ViewBottomButtonBar
        actions={[
          { label: 'Exit', icon: <IconArrowLeftOnRect />, onClick: onExit },
        ]}
      />
    </div>
  );
};
