import { Cmd, eq, Posix, Sub } from '@gamezilla/shared/core';
import { RoomCtx, RoomViewCtx, ViewGameBox } from '@gamezilla/shared/client';
import {
  ActionButton,
  AspectRatio,
  Box,
  Button,
  Divider,
  Drawer,
  Icon,
  Slider,
  Typography,
  useTheme,
} from '@gamezilla/shared/ui';
import { Skeleton } from '@mui/material';
import { useMemo } from 'react';
import * as Chess from '../chess/chess';
import {
  ClientModel,
  ClientMsg,
  handle,
  initShared,
  maxRating,
  minRating,
  PuzzleQuery,
  Req,
  SharedModel,
  Status,
  ToServer,
  toCorrectMove,
  ToClient,
  toPlayerColor,
  toStatus,
} from './puzzle.types';

//
//
// Model
//
//

export type Model = ClientModel;

const toDraftQuery = (model: Model): PuzzleQuery => {
  return model.draftQuery ?? model.query;
};

export const init = ({
  sendToServer,
}: {
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: sendToServer({ t: 'init' }),
  };
};

//
//
// Update
//
//

type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
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
        sendToServer,
        ctx,
      });
    }

    default: {
      return updateRequest({ msg, model, sendToServer, ctx });
    }
  }
};

const updateRequest = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  msg: Req;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
  ctx: RoomCtx;
}) => {
  const handled = handle({ msg, model, ctx });
  const modelNew = mergeWithServer({
    clientModel: model,
    serverModel: handled.type === 'Err' ? model : handled.value,
  });
  return {
    model: modelNew,
    cmd: sendToServer(msg),
  };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  ctx: RoomCtx;
  msg: ToClient;
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

      const merged = mergeWithServer({
        clientModel: model,
        serverModel: result.value,
      });

      return { model: merged };
    }
  }
};

export const mergeWithServer = ({
  clientModel,
  serverModel,
}: {
  clientModel: Model;
  serverModel: SharedModel;
}): Model => {
  return { ...clientModel, ...serverModel };
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
  ctx: RoomViewCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  const status = useMemo(() => toStatus(model), [model]);

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

      {/*



      Game Status



      */}

      <div className="font-sm flex items-center p-4">
        <div className="flex items-center gap-2">
          <p className="text-neutral-300">Rating</p>
          <p>{status.type === 'loading' ? '...' : status.puzzle.rating}</p>
        </div>
        <p className="text-neutral-300 flex-1 text-center">
          {status.type === 'loading'
            ? ''
            : `${model.moves.length}  /  ${status.puzzle.correctMoves.length}`}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Icon name="clock" sx={{ mr: 1 }} />
          <p className="font-mono font-bold text-lg  text-neutral-300">
            {duration ? formatDuration(duration) : '-:--'}
          </p>
        </div>
      </div>

      <AspectRatio aspectRatio={1}>
        <Skeleton
          sx={{ position: 'absolute' }}
          width="100%"
          height="100%"
          variant="rectangular"
        />

        {status.type !== 'loading' && (
          <Chess.View
            key={status.puzzle.puzzleId}
            model={status.board}
            isDraggablePiece={({ piece }) => {
              if (status.type === 'solved') {
                return false;
              }
              const color = Chess.toColor(piece);
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
        )}
      </AspectRatio>

      <div className="flex-1"></div>

      {ctx.currentUserId === ctx.hostId && (
        <div className="w-full flex items-center border-t border-neutral-700">
          <ViewActionButtons model={model} onClose={onClose} $send={$send} />
        </div>
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

const toCustomSquareStyle = (model: Model): Chess.CustomSquareStyles => {
  const correctMove = toCorrectMove(model);
  return !correctMove
    ? {}
    : model.hint === 'from'
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: 'skyblue',
        },
      }
    : model.hint === 'from-and-to'
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: 'skyblue',
        },
        [Chess.toLowercaseSquare(correctMove.to)]: {
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
            color="error"
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
            {Chess.colorToString(toPlayerColor(status.puzzle))} to move
          </Typography>
        </Box>
      );
    }
  }
};
