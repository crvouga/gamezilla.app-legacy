import { UserId } from '@gamezilla/shared/app';
import { Cmd, Sub } from '@gamezilla/shared/core';
import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/frontend';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import {
  FrontendModel,
  FrontendMsg,
  ServerModel,
  ToFrontend,
} from './flow.types';

type Model = FrontendModel;

export const init = ({}: { playerId?: UserId }): Model => {
  return {
    t: 'none',
  };
};

type Msg = FrontendMsg;

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
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const mergeWithBackend = ({
  frontendModel,
  serverModel,
}: {
  frontendModel: FrontendModel;
  serverModel: ServerModel;
}) => {
  return {
    ...frontendModel,
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
