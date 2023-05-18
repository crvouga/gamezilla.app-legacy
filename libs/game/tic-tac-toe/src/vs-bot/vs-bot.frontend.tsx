import { Cmd, Posix, Sub } from '@gamezilla/shared/core';
import {
  Alerts,
  Ctx,
  RoomCtx,
  ViewCtx,
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from '@gamezilla/shared/frontend';
import {
  BotLevel,
  PlayerType,
  botLevels,
  playerTypes,
  toGameOver,
  toOpposite,
  toTurn,
} from '../tic-tic-toe/tic-tac-toe';
import {
  PlayerTypeIcon,
  viewBoard,
  viewCoverArt,
} from '../tic-tic-toe/tic-tac-toe-ui';
import {
  ServerModel,
  ClientModel,
  ClientMsg,
  ToServer,
  ToClient,
  initSharedModel,
  inputMove,
} from './vs-bot.types';

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (...params: Parameters<typeof initSharedModel>): Model => {
  const model = initSharedModel(...params);
  return {
    ...model,
  };
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export type OutAction = Alerts.Action;

export const update = ({
  sendToServer,
  msg,
  model,
  ctx,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'animate': {
      if (model.type !== 'game') {
        return { model };
      }

      return { model };
    }

    case 'input-move': {
      const result = inputMove(msg[1], model);
      if (result.type === 'Err') {
        return { model, cmd: sendToServer(msg) };
      }
      const merged = mergeWithServer({
        ...ctx,
        clientModel: model,
        serverModel: result.value,
      });
      return { model: merged, cmd: sendToServer(msg) };
    }

    default: {
      return { model, cmd: sendToServer(msg) };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: Ctx;
  msg: ToClient;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'player-left': {
      const modelNew = mergeWithServer({
        ...ctx,
        clientModel: model,
        serverModel: msg[1],
      });
      return [modelNew, Cmd.None, []];
    }

    default: {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None, []];
      }
      const modelNew = mergeWithServer({
        ...ctx,
        clientModel: model,
        serverModel: msg[1].value,
      });
      return [modelNew, Cmd.None, []];
    }
  }
};

export const mergeWithServer = ({
  serverModel,
}: {
  now: Posix;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  switch (serverModel.type) {
    case 'Setup': {
      return {
        ...serverModel,
      };
    }

    case 'game': {
      return {
        ...serverModel,
      };
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: Ctx, _model: Model): Sub<Msg> => {
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
  ctx: ViewCtx;
  goBack: () => void;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.type === 'Setup') {
    return ViewVsBotSetupScreen<BotLevel, PlayerType>({
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
        render: ({ playerType }) => <PlayerTypeIcon playerType={playerType} />,
        toName: (player) => player,
      },
      botLevel: {
        onInput: (botLevel) =>
          $send(['InputBot', { userId: ctx.currentUserId, botLevel }]),
        selected: model.botLevel,
        values: Object.values(botLevels),
        toName: (botLevel) => botLevel,
        render: ({ botLevel }) => botLevel,
      },
    });
  }
  const gameOver = toGameOver(model.board);

  return ViewVsBotGameScreen<PlayerType>({
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
        'Swap',
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
    viewBoard: () =>
      viewBoard({
        board: model.board,
        onClick: (position) =>
          $send(['input-move', { userId: ctx.currentUserId, position }]),
      }),
    viewPlayerIcon: ({ playerType, sx }) => (
      <PlayerTypeIcon sx={sx} playerType={playerType} />
    ),
  });
};
