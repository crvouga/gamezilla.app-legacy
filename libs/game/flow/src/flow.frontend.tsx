import { Cmd, Sub } from '@gamezilla/shared/core';
import { RoomViewCtx, ViewBottomButtonBar } from '@gamezilla/shared/frontend';
import { UserId } from '@gamezilla/shared/app';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { FlowGridUI } from './flow-grid';
import {
  FrontendModel,
  FrontendMsg,
  SharedModel,
  ToFrontend,
  initShared,
} from './flow.types';

type Model = FrontendModel;

export const init = ({ playerId }: { playerId?: UserId }): Model => {
  return {
    ...initShared,
    playerId,
  };
};

type Msg = FrontendMsg;

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
    const updated = FlowGridUI.update({
      msg: msg.c,
      model: model.gridUI,
    });
    return {
      model: { ...model, gridUI: updated.model },
    };
  }
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
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: SharedModel;
}) => {
  return {
    ...frontendModel,
    ...backendModel,
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
