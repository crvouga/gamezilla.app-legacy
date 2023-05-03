import { Cmd, Sub } from '@gamezilla/core';
import { RoomViewCtx, UserId } from '@gamezilla/shared';
import { FrontendModel, FrontendMsg, SharedModel } from './flow.types';

type Model = FrontendModel;

export const init = ({ playerId }: { playerId?: UserId }): Model => {
  return {
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
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
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

export const View = ({ model, ctx }: { model: Model; ctx: RoomViewCtx }) => {
  return (
    <div className="w-full h-full">
      <pre>{JSON.stringify(model, null, 2)}</pre>
      <pre>{JSON.stringify(ctx, null, 2)}</pre>
    </div>
  );
};
