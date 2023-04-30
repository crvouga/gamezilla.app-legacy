import { Cmd, Sub } from '@gamezilla/core';
import { RoomViewCtx } from '@gamezilla/shared';
import { UserId } from '@gamezilla/shared';
import { box, button, fillBox, text } from '@gamezilla/shared/ui';
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

export const view = ({
  model,
  gameRoomCtx,
}: {
  model: Model;
  gameRoomCtx: RoomViewCtx;
}) => {
  return fillBox({}, [
    text({}, `hello world ${model?.playerId ?? 'missing'}`),
    box({ sx: { flex: 1 } }, []),
    box(
      {
        sx: {
          padding: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      },
      [
        button(
          {
            variant: 'outlined',
            startIcon: 'exit',
            onPress: () => gameRoomCtx.onQuit(),
          },
          'Back'
        ),
      ]
    ),
  ]);
};
