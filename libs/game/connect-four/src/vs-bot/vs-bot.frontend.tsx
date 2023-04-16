import { Animation, Cmd, Posix, Sub } from '@gamezilla/core';
import {
  viewVsBotGameScreen,
  viewVsBotSetupScreen,
} from '@gamezilla/game-shared';
import { Alerts, Ctx } from '@gamezilla/shared';
import {
  opposite,
  PlayerType,
  playerTypes,
  toStatus,
  toTurn,
} from '../connect-four/connect-four';
import {
  initVisual,
  isDone,
  PlayerIcon,
  step,
  ViewColumns,
  ViewCoverArt,
} from '../connect-four/connect-four-ui';
import {
  BackendModel,
  BotLevel,
  botLevel,
  FrontendModel,
  FrontendMsg,
  handle,
  initShared,
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

export const init = (
  now: Posix,
  ...params: Parameters<typeof initShared>
): FrontendModel => {
  const shared = initShared(...params);

  if (shared.type === 'Setup') {
    return shared;
  }

  return {
    ...shared,
    ghostIndex: 'none',
    visual: initVisual({ now: now, columns: shared.columns }),
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

type OutAction = Alerts.Action;

export const update = (
  { sendToBackend, ctx }: { ctx: Ctx; sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'hovered': {
      if (model.type !== 'game') {
        return { model };
      }
      return { model: { ...model, ghostIndex: msg[1].columnIndex } };
    }

    case 'animate': {
      if (model.type !== 'game') {
        return { model };
      }
      const visualNew = step({
        now: ctx.now,
        columns: model.columns,
        current: model.visual,
      });
      return { model: { ...model, visual: visualNew } };
    }

    case 'input-move': {
      const result = handle(ctx, msg, model);

      if (result.type === 'Err') {
        return { model };
      }

      const modelNext = mergeWithBackend({
        ctx,
        backendModel: result.value,
        frontendModel: model,
      });

      return { model: modelNext, cmd: sendToBackend(msg) };
    }

    case 'input-player-type':
    case 'restart':
    case 'start-game':
    case 'start-playing':
    case 'stop-game':
    case 'stop-playing':
    case 'swap-sides':
    case 'input-bot-level': {
      return { model, cmd: sendToBackend(msg) };
    }
  }
};

export const updateFromBackend = ({
  ctx,
  msg,
  model,
}: {
  ctx: Ctx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg[0]) {
    case 'player-left': {
      const modelNew = mergeWithBackend({
        ctx,
        frontendModel: model,
        backendModel: msg[1],
      });
      return { model: modelNew };
    }

    case 'bot-move':
    case 'input-move': {
      if (msg[1].type === 'Err') {
        return { model };
      }

      const modelNew = mergeWithBackend({
        ctx,
        frontendModel: model,
        backendModel: msg[1].value,
      });

      return { model: modelNew };
    }

    case 'input-player-type':
    case 'restart':
    case 'start-game':
    case 'start-playing':
    case 'stop-game':
    case 'stop-playing':
    case 'swap-sides':
    case 'input-bot-level': {
      if (msg[1].type === 'Err') {
        return { model };
      }

      const modelNew = mergeWithBackend({
        ctx,
        frontendModel: model,
        backendModel: msg[1].value,
      });

      return { model: modelNew };
    }
  }
};

export const mergeWithBackend = ({
  ctx,
  backendModel,
  frontendModel,
}: {
  ctx: Ctx;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  if (backendModel.type === 'Setup') {
    return backendModel;
  }

  if (frontendModel.type === 'Setup') {
    return {
      ...backendModel,
      ghostIndex: 'none',
      visual: initVisual({ now: ctx.now, columns: backendModel.columns }),
    };
  }

  const columnsNew = backendModel.columns;
  const visualNew = step({
    now: ctx.now,
    columns: columnsNew,
    current: frontendModel.visual,
  });

  return {
    ...backendModel,
    visual: visualNew,
    ghostIndex: frontendModel.ghostIndex,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  _intervalId: string,
  now: Posix,
  model: Model
): Sub<Msg> => {
  switch (model.type) {
    case 'game': {
      if (isDone(now, model.visual)) {
        return Sub.None;
      }
      return Animation.onFrame(() => ['animate']);
    }

    case 'Setup': {
      return Sub.None;
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  goBack,
  ctx,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  goBack: () => void;
  ctx: Ctx;
}) => {
  if (model.type === 'Setup') {
    return viewVsBotSetupScreen<BotLevel, PlayerType>({
      coverArt: <ViewCoverArt />,
      title: 'Connect Four',
      subtitle: 'Play Computer',
      ctx,
      playerId: model.player === 'none' ? null : model.player,
      onStartPlaying: () => $send(['start-playing']),
      onStopPlaying: () => $send(['stop-playing']),
      botLevel: {
        values: Object.values(botLevel),
        selected: model.botLevel,
        onInput: (level) => $send(['input-bot-level', { botLevel: level }]),
        toName: (level) => level,
        render: ({ botLevel }) => <div>{botLevel}</div>,
      },
      player: {
        values: Object.values(playerTypes),
        selected: model.userPlayerType,
        onInput: (playerType) => $send(['input-player-type', { playerType }]),
        icon: ({ sx, playerType }) => (
          <PlayerIcon
            playerType={playerType}
            sx={{ width: '1.5rem', height: '1.5rem', ...sx }}
          />
        ),
        toName: (playerType) => (playerType === 'PlayerOne' ? 'Red' : 'Yellow'),
        render: ({ playerType }) => (
          <div className="flex items-center justify-center gap-2">
            <PlayerIcon playerType={playerType} />
            <div>{playerType === 'PlayerOne' ? 'Red' : 'Yellow'}</div>
          </div>
        ),
      },
      leftPlayerType: 'PlayerOne',
      onCancel: goBack,
      onStartGame: () => $send(['start-game']),
    });
  }

  const status = toStatus(model.columns);

  return viewVsBotGameScreen<PlayerType>({
    gameOver:
      status.type === 'Tie'
        ? { type: 'draw' }
        : status.type === 'Winner'
        ? { type: 'winner', winner: status.winner }
        : { type: 'none' },
    gameOverActions: [
      ['Play Again', 'restart', () => $send(['restart'])],
      ['Exit', 'exit', () => $send(['stop-game'])],
    ],
    botName: model.botLevel,
    botPlayer: opposite[model.userPlayerType],
    ctx,
    leftPlayer: 'PlayerOne',
    playerUserId: model.player,
    userPlayer: model.userPlayerType,
    turn: toTurn(model.columns),
    actions: [
      ['Stop', 'exit', () => $send(['stop-game'])],
      ['Restart', 'restart', () => $send(['restart'])],
      ['Swap', 'swap', () => $send(['swap-sides'])],
    ],
    viewPlayerIcon: (props) => <PlayerIcon key={props.playerType} {...props} />,
    viewBoard: () => (
      <ViewColumns
        ghost={
          ctx.currentUserId === model.player &&
          toTurn(model.columns) === model.userPlayerType &&
          model.ghostIndex !== 'none'
            ? {
                columnIndex: model.ghostIndex,
                playerType: model.userPlayerType,
              }
            : undefined
        }
        columns={model.columns}
        onHover={(columnIndex) => $send(['hovered', { columnIndex }])}
        onClick={(columnIndex) => $send(['input-move', { columnIndex }])}
        visual={model.visual}
      />
    ),
  });
};
