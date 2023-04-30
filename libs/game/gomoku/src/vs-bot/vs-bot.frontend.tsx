import { Cmd, Sub } from '@gamezilla/core';
import {
  Ctx,
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from '@gamezilla/shared';
import { ViewCtx } from '@gamezilla/shared';
import {
  BotLevel,
  Stone,
  botLevels,
  stones,
  toOppositeStone,
  toStatus,
  toTurn,
} from '../gomoku/gomoku';
import { ViewBoard, ViewCoverArt, viewStoneIcon } from '../gomoku/gomoku-ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
  handle,
  initShared,
} from './vs-bot.types';

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

export const update = ({
  ctx,
  sendToBackend,
  msg,
  model,
}: {
  ctx: ViewCtx;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    default: {
      const result = handle({ ctx, msg, model });

      if (result.type === 'Err') {
        return {
          model,
          cmd: sendToBackend(msg),
        };
      }

      const merged = mergeWithBackend({
        ctx,
        backendModel: result.value,
        frontendModel: model,
      });

      return {
        model: merged,
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
  ctx: ViewCtx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.result.type === 'Err') {
    return { model };
  }

  const merged = mergeWithBackend({
    ctx,
    frontendModel: model,
    backendModel: msg.result.value,
  });

  return { model: merged };
};

export const mergeWithBackend = ({
  backendModel,
  frontendModel,
}: {
  ctx: ViewCtx;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  return { ...frontendModel, ...backendModel };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: Ctx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'game': {
      return Sub.None;
    }

    case 'setup': {
      return Sub.None;
    }
  }
};

//
//
//
// view
//
//
//

export const view = ({
  $send,
  model,
  ctx,
  onBack,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
  onBack: () => void;
}) => {
  switch (model.type) {
    case 'setup': {
      return ViewVsBotSetupScreen<BotLevel, Stone>({
        leftPlayerType: 'white',
        botLevel: {
          onInput: (botLevel) => $send({ t: 'input-bot-level', botLevel }),
          selected: model.botLevel,
          values: Object.values(botLevels),
          toName: (botLevel) => botLevel,
          render: (props) => props.botLevel,
        },
        coverArt: ViewCoverArt(),
        player: {
          onInput: (userStone) =>
            $send({ t: 'inputted-user-stone', userStone }),
          selected: model.userStone,
          values: Object.values(stones),
          icon: ({ sx, playerType: stone }) => viewStoneIcon({ ...sx, stone }),
          toName: (stone) => stone,
          render: (props) => (
            <div className="flex items-center justify-center gap-2">
              {viewStoneIcon({ stone: props.playerType })}
              {props.playerType === 'white' ? 'White' : 'Black'}
            </div>
          ),
        },
        ctx,
        title: 'gomoku',
        subtitle: 'Vs Computer',
        onCancel: onBack,
        onStartPlaying: () => $send({ t: 'start-playing' }),
        onStopPlaying: () => $send({ t: 'stop-playing' }),
        onStartGame: () => $send({ t: 'start-game' }),
        playerId: model.userId,
      });
    }

    case 'game': {
      const status = toStatus(model.board);

      return ViewVsBotGameScreen<Stone>({
        ctx,
        actions: [
          ['Exit', 'exit', () => $send({ t: 'stop-game' })],
          ['Restart', 'restart', () => $send({ t: 'restart' })],
          ['Swap Sides', 'swap', () => $send({ t: 'swap-sides' })],
        ],
        botName: model.botLevel,
        botPlayer: toOppositeStone(model.userStone),
        gameOver:
          status.type === 'draw'
            ? { type: 'draw' }
            : status.type === 'win'
            ? { type: 'winner', winner: status.winner }
            : { type: 'none' },

        gameOverActions: [
          ['Exit', 'exit', () => $send({ t: 'stop-game' })],
          ['Play Again', 'restart', () => $send({ t: 'restart' })],
        ],
        leftPlayer: 'white',
        playerUserId: model.userId,
        turn: toTurn(model.board),
        userPlayer: model.userStone,
        viewBoard: () => (
          <ViewBoard
            onPress={(position) => $send({ t: 'input-move', position })}
            board={model.board}
          />
        ),
        viewPlayerIcon: ({ sx, playerType: stone }) =>
          viewStoneIcon({ ...sx, stone }),
      });
    }
  }
};
