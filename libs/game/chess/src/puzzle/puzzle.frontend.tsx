import { Cmd, Sub, Time } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import {
  ActionButton,
  Box,
  CircularProgress,
  Divider,
  FillBox,
  Icon,
  Typography,
  useTheme,
} from '@gamezilla/shared/ui';
import { Paper } from '@mui/material';
import { useMemo } from 'react';
import * as ChessBoard from '../chess/chess-board';
import {
  FrontendModel,
  FrontendMsg,
  handle,
  initShared,
  SharedModel,
  Status,
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

    default: {
      const handled = handle({ msg, model, ctx });
      const modelNew = handled.type === 'Err' ? model : handled.value;
      return {
        model: modelNew,
        cmd: sendToBackend(msg),
      };
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  ctx: GameRoomCtx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    default: {
      const result = msg[1];

      if (result.type === 'Err') {
        return { model };
      }

      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: result.value,
      });

      return { model: merged };
    }
  }
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: Model;
  backendModel: SharedModel;
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

  const status = useMemo(() => toStatus(model), [model]);

  const visualBoard = useMemo<ChessBoard.Model>(() => {
    return toVisualBoard({
      now: ctx.now,
      model,
    });
  }, [ctx.now, model]);

  return (
    <FillBox>
      <ViewStatusBar status={status} />

      <Divider />

      <Box sx={{ flex: 1 }}></Box>

      {status.type !== 'loading' ? (
        <ChessBoard.View
          key="chess"
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
          boardOrientation={toPlayerColor(status.puzzle)}
          onPieceDrop={(moveInput) => {
            $send(['input-move', { moveInput }]);

            return false;
          }}
        />
      ) : (
        <Box sx={{ position: 'relative' }}>
          <ChessBoard.View
            key="chess"
            model={{
              fen: '',
              pgn: '',
            }}
            boardOrientation="w"
          />
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
        </Box>
      )}

      <Box sx={{ flex: 1 }}></Box>

      <Divider />

      {ctx.currentUserId === ctx.hostId && (
        <Paper sx={{ display: 'flex' }}>
          <ViewActionButtons model={model} onClose={onClose} $send={$send} />
        </Paper>
      )}
    </FillBox>
  );
};

const ViewActionButtons = ({
  model,
  onClose,
  $send,
}: {
  model: Model;
  onClose: () => void;
  $send: (m: Msg) => void;
}) => {
  const status = toStatus(model);
  switch (status.type) {
    case 'loading': {
      return (
        <>
          <ActionButton
            icon={<Icon name="exit" />}
            label="Exit"
            onClick={onClose}
          />
          <ActionButton
            icon={<Icon name="tune" />}
            label="Tune"
            onClick={() => {
              //
            }}
          />
          <ActionButton
            disabled
            icon={<Icon name="lightbulb" />}
            label="Hint"
            onClick={() => {
              //
            }}
          />
        </>
      );
    }

    case 'incorrect': {
      return (
        <>
          <ActionButton
            icon={<Icon name="exit" />}
            label="Exit"
            onClick={onClose}
          />
          <ActionButton
            icon={<Icon name="tune" />}
            label="Tune"
            onClick={() => {
              //
            }}
          />
          <ActionButton
            icon={<Icon name="restart" />}
            label="Retry"
            onClick={() => {
              $send(['retry-puzzle']);
            }}
          />
          <ActionButton
            icon={<Icon name="chevron-right" />}
            label="Skip"
            onClick={() => {
              $send(['skip-puzzle']);
            }}
          />
        </>
      );
    }

    case 'solved': {
      return (
        <>
          <ActionButton
            icon={<Icon name="exit" />}
            label="Exit"
            onClick={onClose}
          />
          <ActionButton
            icon={<Icon name="tune" />}
            label="Tune"
            onClick={() => {
              //
            }}
          />
          <ActionButton
            color="success"
            icon={<Icon name="arrow-circle-right" />}
            label="Next"
            onClick={() => {
              $send(['next-puzzle']);
            }}
          />
        </>
      );
    }

    case 'solving': {
      return (
        <>
          <ActionButton
            icon={<Icon name="exit" />}
            label="Exit"
            onClick={onClose}
          />
          <ActionButton
            icon={<Icon name="tune" />}
            label="Tune"
            onClick={() => {
              //
            }}
          />
          <ActionButton
            icon={<Icon name="lightbulb" />}
            label="Hint"
            onClick={() => {
              //
            }}
          />
        </>
      );
    }
  }
};

const ViewStatusBar = ({ status }: { status: Status }) => {
  const theme = useTheme();

  switch (status.type) {
    case 'loading': {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
          <Typography variant="h6">...</Typography>
        </Box>
      );
    }

    case 'incorrect': {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            backgroundColor: theme.palette.error.main,
            color: '#fff',
          }}
        >
          <Icon name="close" />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Incorrect
          </Typography>
        </Box>
      );
    }

    case 'solved': {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            backgroundColor: theme.palette.success.main,
            color: '#fff',
          }}
        >
          <Icon name="check" />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Correct
          </Typography>
        </Box>
      );
    }

    case 'solving': {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
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
          <Typography variant="h6">
            {ChessBoard.colorToString(toPlayerColor(status.puzzle))} to move
          </Typography>
        </Box>
      );
    }
  }
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

// const camelCaseToCapitalized = (s: string) => {
//   return s
//     .split(/(?=[A-Z0-9])/)
//     .map((w) => (w[0]?.toUpperCase() ?? '') + w.slice(1))
//     .join(' ');
// };
