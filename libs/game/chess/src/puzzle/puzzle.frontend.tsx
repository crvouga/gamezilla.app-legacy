import { Cmd, Ease, eq, Posix, Sub } from '@gamezilla/core';
import { RoomCtx, ViewGameBox } from '@gamezilla/game-shared';
import {
  ActionButton,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Icon,
  Paper,
  Slider,
  Typography,
  useTheme,
} from '@gamezilla/shared/ui';
import { useMemo } from 'react';
import * as ChessBoard from '../chess/chess-board';
import {
  FrontendModel,
  FrontendMsg,
  handle,
  initShared,
  maxRating,
  minRating,
  PuzzleQuery,
  Req,
  SharedModel,
  Status,
  ToBackend,
  toCorrectMove,
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

const toDraftQuery = (model: Model): PuzzleQuery => {
  return model.draftQuery ?? model.query;
};

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: sendToBackend({ t: 'init' }),
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
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case 'animate': {
      return { model };
    }

    case 'opened-modal': {
      return { model: { ...model, openedModal: msg.modal } };
    }

    case 'closed-modal': {
      return { model: { ...model, openedModal: null } };
    }

    case 'input-draft-query': {
      return {
        model: { ...model, draftQuery: msg.query },
      };
    }

    case 'clicked-save': {
      return updateRequest({
        msg: { t: 'input-query', query: toDraftQuery(model) },
        model: { ...model, openedModal: null },
        sendToBackend,
        ctx,
      });
    }

    default: {
      return updateRequest({ msg, model, sendToBackend, ctx });
    }
  }
};

const updateRequest = ({
  msg,
  model,
  sendToBackend,
  ctx,
}: {
  msg: Req;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
  ctx: RoomCtx;
}) => {
  const handled = handle({ msg, model, ctx });
  const modelNew = mergeWithBackend({
    frontendModel: model,
    backendModel: handled.type === 'Err' ? model : handled.value,
  });
  return {
    model: modelNew,
    cmd: sendToBackend(msg),
  };
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  ctx: RoomCtx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'clock-tick': {
      return { model: { ...model, backendNow: msg.now } };
    }

    default: {
      const result = msg.result;

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

export const subscriptions = (_args: {
  model: Model;
  now: Posix;
  intervalId: string;
}): Sub<Msg> => {
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
  ctx: RoomCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  const status = useMemo(() => toStatus(model), [model]);

  const visualBoard = useMemo<ChessBoard.Model>(() => {
    return toVisualBoard({
      now: ctx.now,
      model,
    });
  }, [ctx.now, model]);

  const duration = useMemo(() => {
    return !model.startedAt
      ? null
      : status.type === 'loading'
      ? null
      : status.type === 'solving'
      ? Math.max(0, (model.backendNow ?? ctx.now) - model.startedAt)
      : status.endedAt - model.startedAt;
  }, [ctx.now, status, model]);

  return (
    <ViewGameBox isSpectating={ctx.currentUserId !== ctx.hostId}>
      <ViewStatusBar status={status} />

      <Divider />

      <Box sx={{ flex: 1 }}></Box>

      <Box
        sx={{
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          p: 2,
          b: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography color="text.secondary" sx={{ mr: 1 }}>
            Rating
          </Typography>
          <Typography>
            {status.type === 'loading' ? '...' : status.puzzle.rating}
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ flex: 1 }} align="center">
          {status.type === 'loading'
            ? ''
            : `${model.moves.length}  /  ${status.puzzle.correctMoves.length}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="clock" sx={{ mr: 1 }} />
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.25rem',
            }}
            color={'text.secondary'}
          >
            {duration ? formatDuration(duration) : '-:--'}
          </Typography>
        </Box>
      </Box>

      {status.type !== 'loading' ? (
        <ChessBoard.View
          key={model.puzzles[0]?.puzzleId}
          model={visualBoard}
          isDraggablePiece={({ piece }) => {
            if (status.type === 'solved') {
              return false;
            }
            const color = ChessBoard.toColor(piece);
            return (
              color === toPlayerColor(status.puzzle) &&
              ctx.hostId === ctx.currentUserId
            );
          }}
          customSquareStyles={toCustomSquareStyle(model)}
          boardOrientation={toPlayerColor(status.puzzle)}
          onPieceDrop={(moveInput) => {
            $send({ t: 'input-move', moveInput });

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

      <Box
        sx={{
          flex: 1,
        }}
      ></Box>

      <Divider />

      {ctx.currentUserId === ctx.hostId && (
        <Paper sx={{ display: 'flex' }}>
          <ViewActionButtons model={model} onClose={onClose} $send={$send} />
        </Paper>
      )}

      <Drawer
        open={model.openedModal === 'tune'}
        onClose={() => $send({ t: 'closed-modal' })}
        anchor="bottom"
        PaperProps={{
          sx: {
            p: 2,
            px: 3,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Typography variant="h4" sx={{ flex: 1 }}>
            Tune
          </Typography>
          <Box>
            <Button
              sx={{ mr: 2 }}
              size="small"
              variant="outlined"
              disabled={eq(model.query, model.draftQuery)}
              onClick={() =>
                $send({ t: 'input-draft-query', query: model.query })
              }
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => $send({ t: 'clicked-save' })}
              disabled={eq(model.query, model.draftQuery)}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Box>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ mr: 2 }}>Rating</Typography>
            {/* <Typography sx={{ flex: 1 }}>
              {toChessLevel(toDraftQuery(model).ratingRange[1])}
            </Typography> */}
            <Typography>
              {String(toDraftQuery(model).ratingRange[0])}-
              {String(toDraftQuery(model).ratingRange[1])}
            </Typography>
          </Box>
          <Box sx={{ paddingX: 2 }}>
            <Slider
              min={minRating}
              max={maxRating}
              valueLabelDisplay="auto"
              step={10}
              marks
              value={toDraftQuery(model).ratingRange}
              onChange={(_, value) => {
                if (Array.isArray(value) && value[0] && value[1]) {
                  $send({
                    t: 'input-draft-query',
                    query: {
                      ...toDraftQuery(model),
                      ratingRange: [value[0], value[1]],
                    },
                  });
                }
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </ViewGameBox>
  );
};

const toCustomSquareStyle = (model: Model): ChessBoard.CustomSquareStyles => {
  const correctMove = toCorrectMove(model);
  return !correctMove
    ? {}
    : model.hint === 'from'
    ? {
        [ChessBoard.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: 'skyblue',
        },
      }
    : model.hint === 'from-and-to'
    ? {
        [ChessBoard.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: 'skyblue',
        },
        [ChessBoard.toLowercaseSquare(correctMove.to)]: {
          backgroundColor: 'skyblue',
        },
      }
    : model.hint === 'none'
    ? {}
    : {};
};

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.floor((duration % 60_000) / 1_000);
  return `${minutes.toString().padStart(1, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
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
              $send({ t: 'opened-modal', modal: 'tune' });
            }}
          />
          <ActionButton
            disabled
            icon={<Icon name="lightbulb" />}
            label="Hint"
            onClick={() => {
              $send({ t: 'show-hint' });
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
              $send({ t: 'opened-modal', modal: 'tune' });
            }}
          />
          <ActionButton
            icon={<Icon name="restart" />}
            label="Retry"
            sx={{
              color: 'error.main',
            }}
            onClick={() => {
              $send({ t: 'retry' });
            }}
          />
          <ActionButton
            icon={<Icon name="chevron-right" />}
            label="Skip"
            onClick={() => {
              $send({ t: 'skip' });
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
              $send({ t: 'opened-modal', modal: 'tune' });
            }}
          />
          <ActionButton
            color="success"
            icon={<Icon name="arrow-circle-right" />}
            label="Next"
            onClick={() => {
              $send({ t: 'next' });
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
              $send({ t: 'opened-modal', modal: 'tune' });
            }}
          />
          <ActionButton
            icon={<Icon name="lightbulb" />}
            label="Hint"
            onClick={() => {
              $send({ t: 'show-hint' });
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
            p: 2,
            py: 1,
            background: toPlayerColor(status.puzzle) === 'b' ? '#000' : '#fff',
            color: toPlayerColor(status.puzzle) === 'b' ? '#fefefe' : '#000',
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
  now: Posix;
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

export const isAnimating = ({
  model,
  now,
}: {
  now: Posix;
  model: Model;
}): boolean => {
  if (!model.puzzles[0]) {
    return false;
  }
  const status = toStatus(model);

  if (status.type === 'solving') {
    return true;
  }

  const visualBoard = toVisualBoard({
    now,
    model,
  });

  const currentBoard: ChessBoard.Model =
    status.type === 'loading' ? { fen: '', pgn: '' } : status.board;

  return visualBoard.fen !== currentBoard.fen;
};

export type VisualModel = {
  slideLeft: Ease.Model;
  puzzlePrev?: string;
  puzzleNex?: string;
};

export const step = ({
  visual,
}: {
  model: Model;
  visual: VisualModel;
}): VisualModel => {
  return visual;
};
