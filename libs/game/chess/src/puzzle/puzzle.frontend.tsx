import { Cmd, Sub, Time } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import {
  ActionButton,
  Box,
  CircularProgress,
  Divider,
  Fade,
  FillBox,
  Icon,
  Typography,
} from '@gamezilla/shared/ui';
import { Paper } from '@mui/material';
import { useMemo } from 'react';
import * as ChessBoard from '../chess/chess-board';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  handle,
  initShared,
  ToBackend,
  ToFrontend,
  toPlayerColor,
  toStatus,
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
  ctx,
}: {
  msg: Msg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
  ctx: GameRoomCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'animate': {
      return { model };
    }

    case 'input-move': {
      const handled = handle({ msg, model, ctx });
      const modelNew = handled.type === 'Err' ? model : handled.value;
      return {
        model: modelNew,
        cmd: sendToBackend(msg),
      };
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

    case 'input-move': {
      if (msg[1].type === 'Err') {
        return { model };
      }
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      });
      return { model: merged };
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
    return Time.every(intervalId, 100, () => ['animate']);
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
  const activePuzzle = model.puzzle;

  const status = toStatus(model);

  const visualBoard = useMemo<ChessBoard.Model>(() => {
    return toVisualBoard({
      now: ctx.now,
      model,
    });
  }, [ctx.now, model]);

  console.log('status', status);

  return (
    <FillBox>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
      >
        {status.type !== 'loading' && (
          <Box
            sx={{
              width: '1rem',
              height: '1rem',
              background:
                toPlayerColor(status.puzzle) === 'b' ? '#000' : '#fff',
              border: `1px solid ${
                toPlayerColor(status.puzzle) === 'b' ? '#ababab' : '#000'
              }`,
              mr: 1,
            }}
          />
        )}
        <Typography>
          {status.type !== 'loading'
            ? `${ChessBoard.colorToString(
                toPlayerColor(status.puzzle)
              )} to move`
            : '...'}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1 }}></Box>
      <Box sx={{ position: 'relative' }}>
        <ChessBoard.View
          model={visualBoard}
          isDraggablePiece={({ piece }) => {
            if (!activePuzzle) {
              return false;
            }
            const color = ChessBoard.toColor(piece);
            return (
              color === toPlayerColor(activePuzzle) &&
              ctx.hostId === ctx.currentUserId
            );
          }}
          boardOrientation={activePuzzle ? toPlayerColor(activePuzzle) : 'w'}
          onPieceDrop={(moveInput) => {
            if (!activePuzzle) {
              return false;
            }
            $send(['input-move', { moveInput }]);

            return false;
          }}
        />
        <Fade in={!activePuzzle}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <CircularProgress color="inherit" />
          </Box>
        </Fade>
      </Box>

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
          disabled={!activePuzzle && ctx.hostId !== ctx.currentUserId}
          icon={<Icon name="lightbulb" />}
          label="Hint"
          onClick={() => {
            //
          }}
        />
        <ActionButton
          disabled={!activePuzzle && ctx.hostId !== ctx.currentUserId}
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
  model,
}: {
  now: number;
  model: Model;
}): ChessBoard.Model => {
  const status = toStatus(model);

  if (status.type === 'loading') {
    return { fen: '', pgn: '' };
  }

  // if (model.moves.length === 0) {
  //   const showFirstMove = now - (model.initializedAt ?? now) > 1000 / 3;

  //   if (showFirstMove) {
  //     const firstMove = status.puzzle.opponentMoves[0];
  //     const board = ChessBoard.initFromFen(status.puzzle);
  //     const moved = ChessBoard.move(firstMove, board);
  //     if (moved.type === 'Err') {
  //       return board;
  //     }
  //     return moved.value;
  //   }

  //   return ChessBoard.initFromFen(status.puzzle);
  // }

  return status.board;
};

const isAnimating = ({
  model,
  now,
}: {
  now: number;
  model: Model;
}): boolean => {
  if (!model.puzzle) {
    return false;
  }
  const visualBoard = toVisualBoard({
    now,
    model,
  });

  const status = toStatus(model);

  const currentBoard: ChessBoard.Model =
    status.type === 'loading' ? { fen: '', pgn: '' } : status.board;

  return visualBoard.fen !== currentBoard.fen;
};

const interleave = <T,>(a: T[], b: T[]): T[] => {
  const [head, ...tail] = a;
  if (!head) {
    return b;
  }
  return [head, ...interleave(b, tail)];
};

// const camelCaseToCapitalized = (s: string) => {
//   return s
//     .split(/(?=[A-Z0-9])/)
//     .map((w) => (w[0]?.toUpperCase() ?? '') + w.slice(1))
//     .join(' ');
// };
