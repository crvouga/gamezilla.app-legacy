import { Cmd, Sub } from '@gamezilla/shared/core';
import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/frontend';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { FlowGridUI } from '../flow-grid';
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
} from './mode-builder.types';

type Model = ClientModel;

type Msg = ClientMsg;

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

export const mergeWithBackend = ({
  clientModel,
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: SharedModel;
}) => {
  return {
    ...clientModel,
    ...serverModel,
  };
};

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
// View
//
//

export const View = ({
  model,
  ctx,
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
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
        actions={[['Quit', <IconArrowLeftOnRect />, ctx.onQuit]]}
      />
    </div>
  );
};
