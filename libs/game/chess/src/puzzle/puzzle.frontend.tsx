import { Cmd } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import { ActionButton, Box, FillBox, Header, Icon } from '@gamezilla/shared/ui';
import * as ChessBoard from '../chess/chess-board';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './puzzle.types';

//
//
// Model
//
//

export type Model = FrontendModel;

export const init = (): { model: Model; cmd: Cmd<Msg> } => {
  console.log('init puzzle');
  return {
    model: {
      puzzles: {},
      board: ChessBoard.init(),
    },
    cmd: Cmd.None,
  };
};

//
//
// Update
//
//

type Msg = FrontendMsg;

export const update = ({
  msg,
  model,
  sendToBackend,
}: {
  msg: Msg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    default: {
      return {
        model,
        cmd: sendToBackend(msg),
      };
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    default: {
      return { model };
    }
  }
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: Model;
  backendModel: BackendModel;
}): Model => {
  return { ...frontendModel, ...backendModel };
};

//
//
// View
//
//

export const View = ({
  model,
  onClose,
  ctx,
}: {
  ctx: GameRoomCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  return (
    <FillBox>
      <Header title={'Puzzle'} />
      <ChessBoard.View model={model.board} boardOrientation="w" />
      <Box sx={{ flex: 1 }}></Box>
      <Box sx={{ px: 2, display: 'flex' }}>
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="exit" />}
          label="Exit"
          onClick={onClose}
        />
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="puzzle" />}
          label="Update"
          onClick={onClose}
        />
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="chevron-right" />}
          label="Next"
          onClick={onClose}
        />
      </Box>
    </FillBox>
  );
};
