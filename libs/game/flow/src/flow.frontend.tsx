import { Cmd, Sub } from '@gamezilla/core';
import { RoomViewCtx, UserId, ViewBottomButtonBar } from '@gamezilla/shared';
import { IconArrowLeftOnRect } from '@gamezilla/shared/ui';
import { FlowUI } from './flow';
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
  if (msg.t === 'flow-view') {
    const updated = FlowUI.update({
      msg: msg.c,
      model: model.flowView,
    });
    return {
      model: { ...model, flowView: updated.model },
    };
  }
  return { model };
};

export const updateFromBackend = ({
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
        <FlowUI.View
          model={model.flowView}
          $send={(c) => $send({ t: 'flow-view', c })}
        />
      </div>
      <ViewBottomButtonBar
        actions={[['Quit', <IconArrowLeftOnRect />, ctx.onQuit]]}
      />
    </div>
  );
};
