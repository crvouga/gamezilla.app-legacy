import { Cmd, Sub } from '@gamezilla/core';
import {
  viewVsBotGameScreen,
  viewVsBotSetupScreen,
} from '@gamezilla/game-shared';
import { Ctx } from '@gamezilla/shared';
import {
  BotLevel,
  botLevels,
  Stone,
  stones,
  toOppositeStone,
  toStatus,
  toTurn,
  viewBoard,
  viewCoverArt,
  viewStoneIcon,
} from '../gomoku/gomoku';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initShared,
  ToBackend,
  ToFrontend,
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

export const update = (
  { sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    default: {
      return [model, sendToBackend(msg)];
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'BotMoved': {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      });
      return [merged, Cmd.None];
    }

    default: {
      if (msg[1].type === 'Err') {
        return [model, Cmd.None];
      }
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      });
      return [merged, Cmd.None];
    }
  }
};

export const mergeWithBackend = ({
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  return backendModel;
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
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
  ctx: Ctx;
  $send: (m: Msg) => void;
  onBack: () => void;
}) => {
  switch (model.type) {
    case 'setup': {
      return viewVsBotSetupScreen<BotLevel, Stone>({
        leftPlayerType: 'white',
        botLevel: {
          onInput: (botLevel) => $send(['input-bot-level', { botLevel }]),
          selected: model.botLevel,
          values: Object.values(botLevels),
        },
        coverArt: viewCoverArt(),
        player: {
          onInput: (userStone) => $send(['InputUserStone', { userStone }]),
          selected: model.userStone,
          values: Object.values(stones),
          icon: ({ sx, playerType: stone }) => viewStoneIcon({ ...sx, stone }),
        },
        ctx,
        title: 'Gomoku',
        subtitle: 'Vs Computer',
        onCancel: onBack,
        onStartPlaying: () => $send(['start-playing']),
        onStopPlaying: () => $send(['stop-playing']),
        onStartGame: () => $send(['start-game']),
        playerId: model.userId,
      });
    }

    case 'game': {
      const status = toStatus(model.board);
      return viewVsBotGameScreen<Stone>({
        ctx,
        actions: [
          ['Exit', 'exit', () => $send(['stop-game'])],
          ['Restart', 'restart', () => $send(['restart'])],
          ['Swap Sides', 'swap', () => $send(['swap-sides'])],
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
          ['Play Again', 'restart', () => $send(['restart'])],
          ['Exit', 'exit', () => $send(['stop-game'])],
        ],
        leftPlayer: 'white',
        playerUserId: model.userId,
        turn: toTurn(model.board),
        userPlayer: model.userStone,
        viewBoard: () => viewBoard({ board: model.board }),
        viewPlayerIcon: ({ sx, playerType: stone }) =>
          viewStoneIcon({ ...sx, stone }),
      });
    }
  }
};
