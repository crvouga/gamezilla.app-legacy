import { Cmd } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import {
  ActionButton,
  Box,
  CircularProgress,
  FillBox,
  Header,
  Icon,
} from '@gamezilla/shared/ui';
import * as ChessBoard from '../chess/chess-board';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initShared,
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
  return {
    model: {
      ...initShared,
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
    case 'query': {
      if (msg[2].type === 'Err') {
        return { model };
      }

      const byId = msg[2].value.reduce<Model['puzzles']>((acc, puzzle) => {
        return {
          ...acc,
          [puzzle.puzzleId]: puzzle,
        };
      }, model.puzzles);

      return {
        model: {
          ...model,
          puzzles: byId,
        },
      };
    }
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
  const puzzle = Object.values(model.puzzles)[0];
  if (!puzzle) {
    return (
      <FillBox>
        <Header title={'Puzzle'} />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
        <Box sx={{ px: 2, display: 'flex' }}>
          <ActionButton
            disabled={ctx.hostId !== ctx.currentUserId}
            icon={<Icon name="exit" />}
            label="Exit"
            onClick={onClose}
          />
          <ActionButton
            disabled
            icon={<Icon name="tune" />}
            label="Tune"
            onClick={onClose}
          />
          <ActionButton
            disabled
            icon={<Icon name="chevron-right" />}
            label="Skip"
            onClick={onClose}
          />
        </Box>
      </FillBox>
    );
  }
  return (
    <FillBox>
      <Header title={'Puzzle'} />
      <ChessBoard.View
        model={ChessBoard.initFromFen({ fen: puzzle.fen })}
        boardOrientation="w"
      />
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
          icon={<Icon name="tune" />}
          label="Tune"
          onClick={onClose}
        />
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="chevron-right" />}
          label="Skip"
          onClick={onClose}
        />
      </Box>
    </FillBox>
  );
};
