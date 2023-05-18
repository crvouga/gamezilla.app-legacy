import { UserId } from '@gamezilla/shared/app';
import { Cmd, Sub } from '@gamezilla/shared/core';
import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/frontend';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { ClientModel, ClientMsg, ServerModel, ToClient } from './flow.types';

type Model = ClientModel;

export const init = ({}: { playerId?: UserId }): Model => {
  return {
    t: 'none',
  };
};

type Msg = ClientMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
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
  clientModel,
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
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
  ctx,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: RoomViewCtx;
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* <FlowGridUI.View
          model={model.t}
          $send={(c) => $send({ t: 'flow-grid-ui', c })}
        /> */}
      </div>
      <ViewBottomButtonBar
        actions={[['Quit', <IconArrowLeftOnRect />, ctx.onQuit]]}
      />
    </div>
  );
};
