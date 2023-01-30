import { Animation, Cmd, Sub } from '@gamezilla/core';
import {
  viewVsBotGameScreen,
  viewVsBotSetupScreen,
} from '@gamezilla/game-shared';
import { Alerts, Ctx } from '@gamezilla/shared';
import {
  BotLevel,
  botLevels,
  PlayerType,
  playerTypes,
  toGameOver,
  toOpposite,
  toTurn,
} from '../tic-tic-toe/tic-tac-toe';
import {
  isAnimating,
  PlayerTypeIcon,
  step,
  ViewBoard,
  viewCoverArt,
} from '../tic-tic-toe/tic-tac-toe-ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  inputMove,
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

export const init = (...params: Parameters<typeof initSharedModel>): Model => {
  const model = initSharedModel(...params);
  return {
    ...model,
    visual: [],
  };
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type OutAction = Alerts.Action;

export const update = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'animate': {
      if (model.type !== 'game') {
        return { model };
      }
      const visualNew = step({
        nowMs: Date.now(),
        model: model.visual,
        board: model.board,
      });
      return { model: { ...model, visual: visualNew } };
    }
    case 'input-move': {
      const result = inputMove(msg[1], model);
      if (result.type === 'Err') {
        return { model, cmd: sendToBackend(msg) };
      }
      const merged = mergeWithBackend(model, result.value);
      return { model: merged, cmd: sendToBackend(msg) };
    }
    default: {
      return { model, cmd: sendToBackend(msg) };
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

    default: {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None, []];
      }
      const modelNew = mergeWithBackend(model, msg[1].value);
      return [modelNew, Cmd.None, []];
    }
  }
};

export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel
): FrontendModel => {
  return {
    ...backendModel,
    visual: frontendModel.visual,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (ctx: Ctx, model: Model): Sub<Msg> => {
  if (isAnimating({ nowMs: ctx.now, model: model.visual })) {
    return Animation.onFrame(() => ['animate']);
  }
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
