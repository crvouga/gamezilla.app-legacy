import { Cmd, exhaustive } from '@gamezilla/shared/core';
import { Alerts, RoomCtx, ViewCtx } from '@gamezilla/shared/frontend';
import { UserId } from '@gamezilla/shared/app';
import * as UI from '@gamezilla/shared/ui';
import {
  PlayerType,
  Position,
  Slot,
  emptyBoard,
  toTurn,
} from '../tic-tic-toe/tic-tac-toe';
import {
  PlayerTypeIcon,
  ViewSlot,
  gameTheme,
  viewBoard,
} from '../tic-tic-toe/tic-tac-toe-ui';
import { VersusHeader } from '../views';
import * as Round from './vs-user-round';
import {
  ServerModel,
  ClientModel,
  ClientMsg,
  GameModel,
  GameOverModel,
  InputMoveTimeLimit,
  InputMoveTimeLimitToString,
  NewGame,
  NewGameToString,
  Res,
  ToServer,
  ToClient,
  allBestOutOf,
  allMoveTimeLimit,
  bestOutOfToString,
  initSharedModel,
  inputBestOutOf,
  inputBestOutOfToString,
  moveTimeLimitToString,
  rematchAsk,
  rematchAskToString,
  startGame,
  toWinCount,
} from './vs-user.types';

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  ...initSharedModel({ X: 'none', O: 'none' }),
  openedModal: 'none',
};

//
//
// Update
//
//
//

export type Msg = ClientMsg;

export type OutAction = Alerts.Action;

export const update = (
  {
    sendToServer,
  }: {
    sendToServer: (msg: ToServer) => Cmd;
  },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    // Frontend Msg
    //
    //

    case 'close-modal': {
      return [{ ...model, openedModal: 'none' }, Cmd.None];
    }

    case 'OpenModal': {
      return [{ ...model, openedModal: msg[1] }, Cmd.None];
    }

    //
    //
    //
    // Request Msg
    //
    //
    //

    case 'RematchAccept':
    case 'RematchAsk':
    case 'RematchDecline':
    case 'Rematch_Cancel':
    case 'InputBestOutOf':
    case 'InputMoveTimeLimit':
    case 'input-move':
    case 'resign':
    case 'InputPlayer':
    case 'stop-playing':
    case 'start-game':
    case 'NewGame': {
      return [model, sendToServer(msg)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromServer = (
  _: { ctx: RoomCtx },
  msg: ToClient,
  model: Model
): [Model, OutAction[]] => {
  switch (msg[0]) {
    case 'player-left': {
      const modelNew = mergeWithBackend(model, msg[1]);
      return [modelNew, []];
    }

    case 'RematchAccept_Done':
    case 'RematchAsk_Done':
    case 'Rematch_Cancel_Done':
    case 'NewGame_Done':
    case 'InputMoveTimeLimit_Done':
    case 'InputBestOutOf_Done':
    case 'input-move-done':
    case 'InputPlayer_Done':
    case 'StopPlaying_Done':
    case 'StartGame_Done':
    case 'RematchDecline_Done':
    case 'resign_Done': {
      const res: Res = msg;

      if (res[1].type === 'Err') {
        return [model, []];
      }

      const modelNew = mergeWithBackend(model, res[1].value);

      return [{ ...modelNew, openedModal: 'none' }, []];
    }

    case 'MoveCountDown_Done':
    case 'RoundCountDown_Done': {
      if (msg[1].type === 'Err') {
        return [model, []];
      }

      const modelNew = mergeWithBackend(model, msg[1].value);

      return [modelNew, []];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const mergeWithBackend = (
  clientModel: ClientModel,
  serverModel: ServerModel
): ClientModel => {
  return {
    ...serverModel,
    openedModal: clientModel.openedModal,
  };
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  $send,
  onCloseGame,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  onCloseGame: () => void;
}) => {
  if (model.type === 'Setup') {
    const startGameResult = startGame({ userId: ctx.currentUserId }, model);
    const inputBestOutOfResult = inputBestOutOf(
      { bestOutOf: model.maxRoundCount, userId: ctx.currentUserId },
      model
    );
    const InputMoveTimeLimitResult = InputMoveTimeLimit(
      { moveTimeLimit: model.moveTimeLimit, userId: ctx.currentUserId },
      model
    );
    return (
      <UI.FillBox>
        <UI.Box sx={{ flex: 1, overflowY: 'scroll' }}>
          <VersusHeader
            ctx={ctx}
            X={
              model.X === 'none'
                ? { type: 'User' }
                : { type: 'User', userId: model.X }
            }
            O={
              model.O === 'none'
                ? { type: 'User' }
                : { type: 'User', userId: model.O }
            }
          />

          <UI.Box sx={{ padding: 2 }}>
            <UI.Typography color="text.secondary" sx={{ marginBottom: 2 }}>
              Players
            </UI.Typography>

            <ViewPlayerSetupSlot
              playerType="X"
              ctx={ctx}
              userId={model.X}
              $send={$send}
              sx={{ marginBottom: 3 }}
            />

            <ViewPlayerSetupSlot
              playerType="O"
              ctx={ctx}
              userId={model.O}
              $send={$send}
              sx={{ marginBottom: 1 }}
            />
          </UI.Box>

          <UI.Divider />

          <UI.Box sx={{ padding: 2 }}>
            <UI.Typography color="text.secondary" sx={{ marginBottom: 1 }}>
              Best Out Of
            </UI.Typography>

            <UI.Tooltip title={inputBestOutOfToString(inputBestOutOfResult)}>
              <UI.ToggleButtonGroup
                disabled={inputBestOutOfResult.type === 'Err'}
                fullWidth
                value={model.maxRoundCount}
              >
                {allBestOutOf.map((bestOutOf) => (
                  <UI.ToggleButton
                    key={bestOutOf}
                    value={bestOutOf}
                    onClick={() =>
                      $send([
                        'InputBestOutOf',
                        { userId: ctx.currentUserId, bestOutOf },
                      ])
                    }
                  >
                    {bestOutOfToString(bestOutOf)}
                  </UI.ToggleButton>
                ))}
              </UI.ToggleButtonGroup>
            </UI.Tooltip>

            <UI.Typography
              color="text.secondary"
              sx={{ marginTop: 3, marginBottom: 1 }}
            >
              Move Time Limit
            </UI.Typography>

            <UI.Tooltip
              title={InputMoveTimeLimitToString(InputMoveTimeLimitResult)}
            >
              <UI.ToggleButtonGroup
                disabled={InputMoveTimeLimitResult.type === 'Err'}
                fullWidth
                value={model.moveTimeLimit}
              >
                {allMoveTimeLimit.map((moveTimeLimit) => (
                  <UI.ToggleButton
                    key={moveTimeLimit}
                    value={moveTimeLimit}
                    onClick={() =>
                      $send([
                        'InputMoveTimeLimit',
                        { userId: ctx.currentUserId, moveTimeLimit },
                      ])
                    }
                  >
                    {moveTimeLimitToString(moveTimeLimit)}
                  </UI.ToggleButton>
                ))}
              </UI.ToggleButtonGroup>
            </UI.Tooltip>
          </UI.Box>
        </UI.Box>

        <UI.Box sx={{ padding: 2, display: 'flex', gap: 2 }}>
          <UI.Button variant="outlined" fullWidth onClick={onCloseGame}>
            Close
          </UI.Button>
          <UI.Button
            variant="contained"
            fullWidth
            onClick={() => $send(['start-game', { userId: ctx.currentUserId }])}
            disabled={startGameResult.type === 'Err'}
          >
            Start
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    );
  }

  if (model.type === 'game') {
    const currentRound = Round.toCurrent(model.round);
    const board = Round.toCurrentBoard(model.round) ?? emptyBoard;

    return (
      <UI.FillBox>
        <UI.Box sx={{ flex: 1, overflowY: 'scroll' }}>
          <UI.Box sx={{ display: 'flex', gap: 2, paddingX: 1, paddingY: 1 }}>
            <ViewPlayerGameSlot playerType="X" ctx={ctx} model={model} />
            <ViewPlayerGameSlot playerType="O" ctx={ctx} model={model} />
          </UI.Box>

          <UI.Box sx={{ width: '100%', position: 'relative' }}>
            {viewBoard({
              board,
              onClick: (position) =>
                $send(['input-move', { position, userId: ctx.currentUserId }]),
            })}

            <UI.Fade in={currentRound.type === 'RoundStarting'}>
              <UI.Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.66)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  maxHeight: '100%',
                  color: '#fff',
                }}
              >
                <ViewRoundStartingMessage ctx={ctx} model={model} />
              </UI.Box>
            </UI.Fade>
          </UI.Box>
        </UI.Box>

        <UI.Box sx={{ display: 'flex', width: '100%' }}>
          <ViewResignButton model={model} ctx={ctx} $send={$send} />
        </UI.Box>
      </UI.FillBox>
    );
  }

  const board = Round.toCurrentBoard(model.round) ?? emptyBoard;

  const rematchAskResult = rematchAsk({ userId: ctx.currentUserId }, model);
  const NewGameResult = NewGame({ userId: ctx.currentUserId }, model);

  const currentPlayerType: PlayerType | 'none' =
    model.X === ctx.currentUserId
      ? 'X'
      : model.O === ctx.currentUserId
      ? 'O'
      : 'none';

  return (
    <UI.FillBox>
      <UI.Box sx={{ display: 'flex', gap: 2, paddingX: 1, paddingY: 1 }}>
        <ViewPlayerGameSlot playerType="X" ctx={ctx} model={model} />
        <ViewPlayerGameSlot playerType="O" ctx={ctx} model={model} />
      </UI.Box>

      <UI.Box sx={{ width: '100%', position: 'relative' }}>
        {viewBoard({
          board,
          onClick: (position) =>
            $send(['input-move', { position, userId: ctx.currentUserId }]),
        })}
        <UI.Fade in>
          <UI.Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.66)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '100%',
              color: '#fff',
            }}
          >
            <ViewGameOverMessage ctx={ctx} model={model} $send={$send} />
          </UI.Box>
        </UI.Fade>
      </UI.Box>

      <UI.Box sx={{ flex: 1 }} />

      <UI.Box sx={{ display: 'flex', width: '100%', padding: 2, gap: 2 }}>
        <UI.Box sx={{ flex: 1 }}>
          <UI.Tooltip title={NewGameToString(NewGameResult)}>
            <span>
              <UI.Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  $send(['NewGame', { userId: ctx.currentUserId }])
                }
                disabled={NewGameResult.type === 'Err'}
              >
                Back
              </UI.Button>
            </span>
          </UI.Tooltip>
        </UI.Box>
        <UI.Box sx={{ flex: 1 }}>
          <UI.Tooltip
            title={
              model.rematch.type === 'Asking'
                ? ''
                : rematchAskToString(rematchAskResult)
            }
          >
            <span>
              <UI.Button
                disabled={rematchAskResult.type === 'Err'}
                fullWidth
                variant="contained"
                loading={
                  model.rematch.type === 'Asking' &&
                  model.rematch.asker === currentPlayerType
                }
                onClick={() =>
                  $send(['RematchAsk', { userId: ctx.currentUserId }])
                }
              >
                Rematch
              </UI.Button>
            </span>
          </UI.Tooltip>
        </UI.Box>
      </UI.Box>
    </UI.FillBox>
  );
};

const ViewGameOverMessage = ({
  ctx,
  model,
  $send,
}: {
  ctx: ViewCtx;
  model: GameOverModel;
  $send: (msg: Msg) => void;
}) => {
  const isPlaying =
    model.O === ctx.currentUserId || model.X === ctx.currentUserId;
  const score = Round.toScore(model.round);
  const winCount = toWinCount(model);

  const currentPlayerType: PlayerType | 'none' =
    model.X === ctx.currentUserId
      ? 'X'
      : model.O === ctx.currentUserId
      ? 'O'
      : 'none';

  if (
    model.rematch.type === 'Asking' &&
    model.rematch.asker !== currentPlayerType &&
    currentPlayerType !== 'none'
  ) {
    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: 'inherit',
          }}
        >
          <UI.Typography align="center" color="inherit" fontSize={52}>
            Rematch?
          </UI.Typography>
        </UI.Box>

        <UI.Box
          sx={{
            flex: 1,
            width: '100%',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <UI.Button
            startIcon={<UI.Icons.Cancel />}
            variant="contained"
            color="inherit"
            fullWidth
            sx={{ color: '#000' }}
            onClick={() =>
              $send(['RematchDecline', { userId: ctx.currentUserId }])
            }
          >
            Decline
          </UI.Button>
          <UI.Button
            startIcon={<UI.Icons.CheckCircle />}
            variant="contained"
            fullWidth
            onClick={() =>
              $send(['RematchAccept', { userId: ctx.currentUserId }])
            }
          >
            Accept
          </UI.Button>
        </UI.Box>
      </>
    );
  }

  if (
    model.rematch.type === 'Asking' &&
    model.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: 'inherit',
          }}
        >
          <UI.Typography
            align="center"
            color="inherit"
            fontSize={36}
            sx={{ marginBottom: 2 }}
          >
            Waiting for a response
          </UI.Typography>
          <UI.CircularProgress />
        </UI.Box>

        <UI.Box
          sx={{
            flex: 1,
            width: '100%',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <UI.Button
            startIcon={<UI.Icons.Cancel />}
            variant="contained"
            onClick={() =>
              $send(['Rematch_Cancel', { userId: ctx.currentUserId }])
            }
          >
            Cancel
          </UI.Button>
        </UI.Box>
      </>
    );
  }

  if (model.gameOver.type === 'resignation') {
    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: 'inherit',
          }}
        >
          <PlayerTypeIcon
            playerType={model.gameOver.resigner}
            sx={{ width: 64, height: 64 }}
          />
          <UI.Typography align="center" color="inherit" fontSize={52}>
            Resigned
          </UI.Typography>
        </UI.Box>

        <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
          <ViewScores
            maxRoundCount={model.maxRoundCount}
            score={score}
            winCount={winCount}
          />
        </UI.Box>
      </>
    );
  }

  if (model.gameOver.type === 'Tie') {
    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
          }}
        >
          <UI.Typography fontSize={72} align="center" color="inherit">
            Tie
          </UI.Typography>
        </UI.Box>
        <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
          <ViewScores
            maxRoundCount={model.maxRoundCount}
            score={score}
            winCount={winCount}
          />
        </UI.Box>
      </>
    );
  }

  const didCurrentUserWin =
    model.gameOver.type === 'Winner' &&
    model[model.gameOver.winner] === ctx.currentUserId;

  return (
    <>
      <UI.Box
        sx={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: 'inherit',
        }}
      >
        {isPlaying ? (
          <UI.Typography align="center" color="inherit" fontSize={64}>
            {didCurrentUserWin ? 'You Won' : 'You Lost'}
          </UI.Typography>
        ) : (
          <UI.Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <svg width={62} viewBox="-1 -1 2 2">
              <ViewSlot
                strokeWidth={0.33}
                cx={0}
                cy={0}
                r={0.8}
                slot={model.gameOver.winner}
                color="currentColor"
              />
            </svg>
            <UI.Typography
              align="center"
              color="inherit"
              fontSize={64}
              sx={{ marginLeft: 2 }}
            >
              Won
            </UI.Typography>
          </UI.Box>
        )}
      </UI.Box>
      <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
        <ViewScores
          maxRoundCount={model.maxRoundCount}
          score={score}
          winCount={winCount}
        />
      </UI.Box>
    </>
  );
};

export const ViewRoundStartingMessage = ({
  ctx,
  model,
}: {
  ctx: ViewCtx;
  model: GameModel;
}) => {
  const currentRound = Round.toCurrent(model.round);
  const previousRound = Round.toPrevious(model.round);

  if (currentRound.type === 'RoundOver') {
    return null;
  }

  if (currentRound.type === 'RoundStarted') {
    return null;
  }

  const score = Round.toScore(model.round);
  const winCount = toWinCount(model);

  if (previousRound.type === 'none') {
    const countDown = currentRound.countDown;

    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: 'inherit',
          }}
        >
          <UI.Typography
            align="center"
            variant="h2"
            color="inherit"
            sx={{ marginBottom: 1 }}
          >
            Starting in
          </UI.Typography>
          <UI.Typography
            align="center"
            variant="h1"
            color="inherit"
            sx={{ fontSize: '4rem' }}
          >
            {countDown}
          </UI.Typography>
        </UI.Box>
        <UI.Box
          sx={{
            flex: 1,
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <ViewScores
            maxRoundCount={model.maxRoundCount}
            score={score}
            winCount={winCount}
          />
        </UI.Box>
      </>
    );
  }

  const { roundOver } = previousRound;
  const didCurrentUserWin =
    roundOver.type === 'Win' && model[roundOver.winner] === ctx.currentUserId;
  const isPlaying =
    model.O === ctx.currentUserId || model.X === ctx.currentUserId;

  return (
    <>
      <UI.Box sx={{ flex: 1 }}></UI.Box>
      <UI.Box
        sx={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: 'inherit',
        }}
      >
        {roundOver.type === 'Tie' ? (
          <UI.Typography align="center" fontSize={54} color="inherit">
            Round Tie
          </UI.Typography>
        ) : isPlaying ? (
          <UI.Typography align="center" fontSize={54} color="inherit">
            {didCurrentUserWin ? 'Round Win' : 'Round Lost'}
          </UI.Typography>
        ) : (
          <UI.Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'inherit',
            }}
          >
            <PlayerTypeIcon
              playerType={roundOver.winner}
              sx={{ width: 64, height: 64 }}
            />

            <UI.Typography align="center" color="inherit" fontSize={64}>
              Won
            </UI.Typography>
          </UI.Box>
        )}
      </UI.Box>

      {/* <UI.Typography align="center" sx={{ fontSize: 32 }}>
        {roundCount} / {model.maxRoundCount}
      </UI.Typography> */}

      <ViewScores
        score={score}
        winCount={winCount}
        maxRoundCount={model.maxRoundCount}
      />

      <UI.Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: 4,
        }}
      >
        <UI.Typography align="center" variant="h4" color="inherit">
          Starting in {currentRound.countDown}
        </UI.Typography>
      </UI.Box>
    </>
  );
};

const ViewScores = ({
  score,
  winCount,
}: {
  score: Round.Score;
  winCount: number;
  maxRoundCount: number;
}) => {
  const width = 52;

  return (
    <UI.Box
      sx={{
        display: 'flex',
        width: '100%',
        color: 'inherit',
        alignItems: 'center',
      }}
    >
      <UI.Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'inherit',
        }}
      >
        <PlayerTypeIcon playerType="X" sx={{ width: width, height: width }} />
        <ViewScoreSlots
          tieCount={score.Tie}
          score={score.X}
          maxScore={winCount}
          slotSize={32}
        />
      </UI.Box>

      <UI.Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'inherit',
        }}
      >
        <PlayerTypeIcon playerType="O" sx={{ width: width, height: width }} />
        <ViewScoreSlots
          tieCount={score.Tie}
          score={score.O}
          maxScore={winCount}
          slotSize={32}
        />
      </UI.Box>
    </UI.Box>
  );
};

const ViewScoreSlots = ({
  maxScore,
  score,
  slotSize,
}: {
  tieCount: number;
  maxScore: number;
  score: number;
  slotSize: number;
}) => {
  return (
    <UI.Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1 / 2,
        color: 'inherit',
      }}
    >
      {[...new Array(maxScore)].map((_, index) => {
        const n = index + 1;
        return (
          <UI.Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: 'inherit',
            }}
          >
            {n <= score ? (
              <UI.Icons.Circle
                sx={{ width: slotSize, height: slotSize, color: 'inherit' }}
              />
            ) : (
              // n > maxScore - tieCount ? (
              // <UI.Icons.Cancel
              //   sx={{
              //     width: slotSize,
              //     height: slotSize,
              //     color: "inherit",
              //     opacity: 0.5,
              //   }}
              // />
              // ) :
              <UI.Icons.CircleOutlined
                sx={{
                  width: slotSize,
                  height: slotSize,
                  color: 'inherit',
                  opacity: 0.5,
                }}
              />
            )}
          </UI.Box>
        );
      })}
    </UI.Box>
  );
};

const ViewResignButton = ({
  ctx,
  model,
  $send,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <>
      <UI.ActionButton
        icon={<UI.Icons.Flag />}
        label="Resign"
        onClick={() => $send(['OpenModal', 'resignation'])}
      />
      <UI.ConformationDialog
        open={model.openedModal === 'resignation'}
        onCancel={() => $send(['close-modal'])}
        onClose={() => $send(['close-modal'])}
        onConfirm={() => $send(['resign', { userId: ctx.currentUserId }])}
        headerIcon={<UI.Icons.Flag sx={{ width: 64, height: 64 }} />}
        title="Resign from game?"
        confirmTitle="Resign"
      />
    </>
  );
};

export const toGameText = ({ model }: { model: Model }): string => {
  switch (model.type) {
    case 'Setup': {
      return 'Setting up';
    }

    case 'GameOver': {
      switch (model.gameOver.type) {
        case 'resignation': {
          return `Resigned`;
        }

        case 'Winner': {
          // const userId = model[model.gameOver.winner];

          return `won`;
        }

        case 'Tie': {
          return `Tie`;
        }

        default: {
          return 'Game Over';
        }
      }
    }

    case 'game': {
      const currentRound = Round.toCurrent(model.round);

      switch (currentRound.type) {
        case 'RoundOver': {
          switch (currentRound.roundOver.type) {
            case 'Tie': {
              return 'Tie';
            }

            case 'Win': {
              return `${currentRound.roundOver.winner} won`;
            }

            default: {
              return 'Round Over';
            }
          }
        }
        case 'RoundStarted': {
          const turn = toTurn(currentRound.board);
          return `${turn} Turn`;
        }

        case 'RoundStarting': {
          return 'Starting...';
        }

        default: {
          return 'Starting...';
        }
      }
    }
  }
};

const ViewPlayerSetupSlot = ({
  ctx,
  userId,
  playerType,
  $send,
  sx,
}: {
  ctx: ViewCtx;
  userId: UserId | 'none';
  playerType: PlayerType;
  $send: (msg: Msg) => void;
  sx?: UI.Sx;
}) => {
  const iconSx = { width: 42, height: 42, color: 'text.secondary' };

  if (userId === 'none') {
    return (
      <UI.Box
        sx={{ display: 'flex', width: '100%', alignItems: 'center', ...sx }}
      >
        <PlayerTypeIcon
          playerType={playerType}
          sx={{ marginRight: 1, ...iconSx }}
        />
        <UI.Button
          sx={{ flex: 1 }}
          fullWidth
          variant="contained"
          onClick={() =>
            $send(['InputPlayer', { userId: ctx.currentUserId, playerType }])
          }
        >
          Start Playing
        </UI.Button>
      </UI.Box>
    );
  }

  return (
    <UI.Box
      sx={{ display: 'flex', alignItems: 'center', width: '100%', ...sx }}
    >
      <PlayerTypeIcon
        playerType={playerType}
        sx={{ marginRight: 1, ...iconSx }}
      />
      <UI.Avatar
        src={ctx.profiles[userId]?.avatarUrl}
        sx={{ marginRight: 1 }}
      />
      <UI.Box sx={{ flex: 1, overflow: 'hidden' }}>
        <UI.Typography noWrap sx={{ textOverflow: 'ellipsis' }}>
          {ctx.profiles[userId]?.username ?? '...'}
        </UI.Typography>
      </UI.Box>
      {ctx.currentUserId === userId && (
        <UI.Button
          onClick={() => $send(['stop-playing', { userId: ctx.currentUserId }])}
        >
          Stop Playing
        </UI.Button>
      )}
    </UI.Box>
  );
};

const ViewPlayerGameSlot = ({
  ctx,
  model,
  playerType,
}: {
  ctx: ViewCtx;
  model: GameModel | GameOverModel;
  playerType: PlayerType;
}) => {
  const userId = model[playerType];
  const profile = ctx.profiles[userId];
  const uiTheme = UI.useTheme();

  const round = Round.toCurrent(model.round);

  const isTurn =
    model.type === 'game' &&
    round.type === 'RoundStarted' &&
    toTurn(round.board) === playerType;

  const iconSize = {
    width: 20,
    height: 20,
  };

  const timeLeft = round.type === 'RoundStarted' ? round.moveCountDown : 0;

  // const progress = isTurn ? rescale({
  //   value: timeLeft,
  //   from: [0, model.moveTimeLimit],
  //   to: [0, 100]
  // }) : 0

  // const progressColor = !isTurn ? 'inherit' : timeLeft == 2 || timeLeft === 3 ? 'warning' : timeLeft === 1 ? 'error' : "inherit"

  return (
    <UI.Paper
      sx={{ flex: 1, overflow: 'hidden', height: '100%', width: '100%' }}
      variant="outlined"
    >
      <UI.Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          borderBottom: `solid 3.5px ${
            isTurn ? gameTheme.background : uiTheme.palette.divider
          }`,
        }}
      >
        <UI.Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            padding: 1,
            flex: 2,
            overflow: 'hidden',
          }}
        >
          <UI.SvgIcon
            sx={{ display: 'block', marginRight: 1, ...iconSize }}
            viewBox="-1 -1 2 2"
          >
            <ViewSlot
              strokeWidth={0.3}
              color={uiTheme.palette.text.primary}
              slot={playerType}
              cx={0}
              cy={0}
              r={0.8}
            />
          </UI.SvgIcon>
          <UI.Avatar
            src={profile?.avatarUrl}
            sx={{ marginRight: 1, ...iconSize }}
          />
          <UI.Typography noWrap sx={{ flex: 1 }}>
            {profile?.username ?? '...'}
          </UI.Typography>
        </UI.Box>
        <UI.Box>
          {isTurn && (
            <UI.Typography
              variant="h6"
              sx={{ paddingRight: 1 }}
              color={
                timeLeft === 3
                  ? 'warning.light'
                  : timeLeft === 2
                  ? 'warning.dark'
                  : timeLeft < 2
                  ? 'error.main'
                  : 'text.primary'
              }
            >
              {timeLeft}
            </UI.Typography>
          )}
        </UI.Box>
      </UI.Box>
      {/* {isTurn ? <UI.LinearProgress key="isTurn" color={progressColor} variant="determinate" value={progress} /> : <UI.LinearProgress key="isNotTurn" color={"inherit"} variant="determinate" value={0} />} */}
    </UI.Paper>
  );
};
//
//
//
//
//
//
//

export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, 'X'],
    [{ row: 0, column: 1 }, '_'],
    [{ row: 1, column: 0 }, '_'],
    [{ row: 1, column: 1 }, 'O'],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={gameTheme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};

export const BannerArt = ({ title }: { title: string }) => {
  const strokeWidth = 0.25;
  return (
    <UI.AspectRatio aspectRatio={Math.pow(3 / 4, 4)}>
      <UI.Box
        sx={{
          width: '100%',
          height: '100%',
          padding: 2,
          backgroundColor: gameTheme.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <svg width="33%" viewBox="-1 -1 2 2">
          <ViewSlot strokeWidth={strokeWidth} slot="X" cx={0} cy={0} r={0.75} />
        </svg>
        <svg width="33%" viewBox="-1 -1 2 2">
          <ViewSlot strokeWidth={strokeWidth} slot="O" cx={0} cy={0} r={0.75} />
        </svg>
      </UI.Box>

      <UI.Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4))`,
          color: '#fff',
        }}
      >
        <UI.Box sx={{ flex: 1 }} />

        <UI.Typography
          sx={{ paddingX: 2, paddingBottom: 1 }}
          variant="h3"
          color="inherit"
        >
          {title}
        </UI.Typography>
      </UI.Box>
    </UI.AspectRatio>
  );
};
