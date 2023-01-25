import { Cmd, Sub } from '@gamezilla/core';
import {
  viewVsBotGameScreen,
  viewVsBotSetupScreen,
} from '@gamezilla/game-shared';
import { Alerts, Ctx } from '@gamezilla/shared';
import {
  BotLevel,
  botLevels,
  PlayerType,
  PlayerTypeIcon,
  playerTypes,
  toGameOver,
  toOpposite,
  toTurn,
  ViewBoard,
  viewCoverArt,
} from '../tic-tic-toe/tic-tac-toe';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  ToBackend,
  ToFrontend,
} from './vs-bot.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = Alerts.Action;

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'start-game':
    case 'stop-playing':
    case 'start-playing':
    case 'InputBot':
    case 'stop-game':
    case 'input-move':
    case 'restart':
    case 'swap-sides':
    case 'input-player-type': {
      return [model, sendToBackend(msg)];
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'player-left': {
      const modelNew = mergeWithBackend(model, msg[1]);
      return [modelNew, Cmd.None, []];
    }

    case 'BotMove_Done':
    case 'InputBot_Done':
    case 'StartGame_Done':
    case 'StartPlaying_Done':
    case 'StopPlaying_Done':
    case 'StopGame_Done':
    case 'InputMove_Done':
    case 'Restart_Done':
    case 'swap-sides-done':
    case 'InputPlayerType_Done': {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None, []];
      }
      const modelNew = mergeWithBackend(model, msg[1].value);
      return [modelNew, Cmd.None, []];
    }
  }
};

export const mergeWithBackend = (
  _frontendModel: FrontendModel,
  backendModel: BackendModel
): FrontendModel => {
  return backendModel;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  goBack,
  model,
  $send,
  ctx,
}: {
  ctx: Ctx;
  goBack: () => void;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.type === 'Setup') {
    return viewVsBotSetupScreen<BotLevel, PlayerType>({
      leftPlayerType: 'X',
      playerId: model.player === 'none' ? null : model.player,
      subtitle: 'Vs Computer',
      title: 'Tic-Tac-Toe',
      coverArt: viewCoverArt(),
      ctx,
      onCancel: goBack,
      onStartGame: () => $send(['start-game', { userId: ctx.currentUserId }]),
      onStartPlaying: () =>
        $send(['start-playing', { userId: ctx.currentUserId }]),
      onStopPlaying: () =>
        $send(['stop-playing', { userId: ctx.currentUserId }]),
      player: {
        values: Object.values(playerTypes),
        onInput: (player) =>
          $send([
            'input-player-type',
            { userId: ctx.currentUserId, playerType: player },
          ]),
        selected: model.userPlayerType,
        icon: ({ playerType, sx }) => (
          <PlayerTypeIcon sx={sx} playerType={playerType} />
        ),
      },
      botLevel: {
        onInput: (botLevel) =>
          $send(['InputBot', { userId: ctx.currentUserId, botLevel }]),
        selected: model.botLevel,
        values: Object.values(botLevels),
      },
    });
  }
  const gameOver = toGameOver(model.board);

  return viewVsBotGameScreen<PlayerType>({
    leftPlayer: 'X',
    actions: [
      [
        'Exit',
        'exit',
        () => $send(['stop-game', { userId: ctx.currentUserId }]),
      ],
      [
        'Restart',
        'restart',
        () => $send(['restart', { userId: ctx.currentUserId }]),
      ],
      [
        'Swap Sides',
        'swap',
        () => $send(['swap-sides', { userId: ctx.currentUserId }]),
      ],
    ],
    ctx,
    botName: model.botLevel,
    botPlayer: toOpposite(model.userPlayerType),
    gameOver:
      gameOver.type === 'Tie'
        ? { type: 'draw' }
        : gameOver.type === 'Win'
        ? { type: 'winner', winner: gameOver.winner }
        : { type: 'none' },
    gameOverActions: [
      [
        'Restart',
        'restart',
        () => $send(['restart', { userId: ctx.currentUserId }]),
      ],
      [
        'Exit',
        'exit',
        () => $send(['stop-game', { userId: ctx.currentUserId }]),
      ],
    ],
    playerUserId: model.player,
    turn: toTurn(model.board),
    userPlayer: model.userPlayerType,
    viewBoard: () => (
      <ViewBoard
        board={model.board}
        onClick={(position) =>
          $send(['input-move', { userId: ctx.currentUserId, position }])
        }
      />
    ),
    viewPlayerIcon: ({ playerType, sx }) => (
      <PlayerTypeIcon sx={sx} playerType={playerType} />
    ),
  });
};
