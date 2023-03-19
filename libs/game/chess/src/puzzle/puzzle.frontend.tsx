import { Cmd, Sub, Time } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import {
  ActionButton,
  Box,
  Chip,
  CircularProgress,
  FillBox,
  Header,
  Icon,
} from '@gamezilla/shared/ui';
import { Paper } from '@mui/material';
import * as ChessBoard from '../chess/chess-board';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initShared,
  Puzzle,
  ToBackend,
  toCurrentBoard,
  ToFrontend,
  toOpponentMoves,
} from './puzzle.types';

//
//
// Model
//
//

export type Model = FrontendModel;

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
}): { model: Model; cmd: Cmd<Msg> } => {
  return {
    model: initShared,
    cmd: sendToBackend(['initialize']),
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
    case 'animate': {
      return { model };
    }
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
  ctx,
}: {
  ctx: GameRoomCtx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'initialize': {
      if (msg[1].type === 'Err') {
        return { model };
      }

      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      });

      return {
        model: { ...merged, initializedAt: ctx.now },
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
// Subscriptions
//
//

export const subscriptions = ({
  model,
  now,
  intervalId,
}: {
  model: Model;
  now: number;
  intervalId: string;
}): Sub<Msg> => {
  if (isAnimating({ now, model })) {
    return Time.every(intervalId, 1000, () => ['animate']);
  }
  return Sub.None;
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
  $send,
}: {
  ctx: GameRoomCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  const activePuzzle = model.activePuzzle;
  if (!activePuzzle) {
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
  const visualBoard = toVisualBoard({
    activePuzzle,
    now: ctx.now,
    model,
  });
  return (
    <FillBox>
      <Header title={'Puzzle'} />

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, px: 2, overflowX: 'scroll' }}>
          {activePuzzle.themes.map((theme) => {
            return <Chip key={theme} label={camelCaseToCapitalized(theme)} />;
          })}
        </Box>
      </Box>
      <ChessBoard.View
        model={visualBoard}
        boardOrientation="w"
        onPieceDrop={(moveInput) => {
          $send(['input-move', { moveInput }]);

          return false;
        }}
      />
      <Box sx={{ flex: 1 }}></Box>
      <Paper
        sx={{
          display: 'flex',
        }}
      >
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
          onClick={() => {
            //
          }}
        />
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="lightbulb" />}
          label="Hint"
          onClick={() => {
            //
          }}
        />
        <ActionButton
          disabled={ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="chevron-right" />}
          label="Skip"
          onClick={() => {
            //
          }}
        />
      </Paper>
    </FillBox>
  );
};

const toVisualBoard = ({
  activePuzzle,
  model,
  now,
}: {
  activePuzzle: Puzzle;
  now: number;
  model: Model;
}): ChessBoard.Model => {
  if (
    model.playerMoves.length === 0 &&
    now - (model.initializedAt ?? now) > 1000
  ) {
    console.log("I'm here");
    const firstMove = activePuzzle.moves[0];
    const board = ChessBoard.initFromFen({ fen: activePuzzle.fen });
    const moved = ChessBoard.move(firstMove, board);
    if (moved.type === 'Err') {
      return board;
    }
    return moved.value;
  }

  const opponentMoves = toOpponentMoves(activePuzzle);
  const allMoves = interleave(opponentMoves, model.playerMoves);

  const currentBoard = allMoves.reduce((board, move) => {
    const moved = ChessBoard.move(move, board);
    if (moved.type === 'Err') {
      return board;
    }
    return moved.value;
  }, ChessBoard.initFromFen({ fen: activePuzzle.fen }));

  return currentBoard;
};

const isAnimating = ({
  model,
  now,
}: {
  now: number;
  model: Model;
}): boolean => {
  const activePuzzle = model.activePuzzle;
  if (!activePuzzle) {
    return false;
  }

  const visualBoard = toVisualBoard({
    activePuzzle,
    now,
    model,
  });

  const currentBoard = toCurrentBoard({
    activePuzzle,
    model,
  });

  return visualBoard.fen !== currentBoard.fen;
};

const interleave = <T,>(a: T[], b: T[]): T[] => {
  const [head, ...tail] = a;
  if (!head) {
    return b;
  }
  return [head, ...interleave(b, tail)];
};

const camelCaseToCapitalized = (s: string) => {
  return s
    .split(/(?=[A-Z0-9])/)
    .map((w) => (w[0]?.toUpperCase() ?? '') + w.slice(1))
    .join(' ');
};
