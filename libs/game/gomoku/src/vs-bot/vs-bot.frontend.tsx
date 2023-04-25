import { Cmd, Sub } from '@gamezilla/core';
import {
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from '@gamezilla/game-shared';
import { Ctx } from '@gamezilla/shared';
import {
  BotLevel,
  Stone,
  botLevels,
  stones,
  toOppositeStone,
  toStatus,
  toTurn,
} from '../gomoku/gomoku';
import {
  ViewBoard,
  initVisual,
  step,
  viewCoverArt,
  viewStoneIcon,
} from '../gomoku/gomoku-ui';
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
  ctx: Ctx;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'animate': {
      if (model.type === 'game') {
        const { board, visual } = model;
        const visualNew = step({ now: ctx.now, board, model: visual });
        return {
          model: { ...model, visual: visualNew },
        };
      }

      return { model };
    }

    case 'input-move': {
      const result = handle(ctx, msg, model);

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

    default: {
      return {
        model,
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
  ctx: Ctx;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'bot-moved': {
      const merged = mergeWithBackend({
        ctx,
        frontendModel: model,
        backendModel: msg[1],
      });

      return {
        model: merged,
      };
    }

    default: {
      if (msg[1].type === 'Err') {
        return { model };
      }
      const merged = mergeWithBackend({
        ctx,
        frontendModel: model,
        backendModel: msg[1].value,
      });
      return { model: merged };
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
  switch (backendModel.type) {
    case 'setup': {
      return backendModel;
    }

    case 'game': {
      const visualNew = step({
        board: backendModel.board,
        model:
          frontendModel.type === 'game'
            ? frontendModel.visual
            : initVisual({ now: ctx.now, board: backendModel.board }),
        now: ctx.now,
      });
      return { ...backendModel, visual: visualNew };
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
  ctx: Ctx;
  $send: (m: Msg) => void;
  onBack: () => void;
}) => {
  switch (model.type) {
    case 'setup': {
      return ViewVsBotSetupScreen<BotLevel, Stone>({
        leftPlayerType: 'white',
        botLevel: {
          onInput: (botLevel) => $send(['input-bot-level', { botLevel }]),
          selected: model.botLevel,
          values: Object.values(botLevels),
          toName: (botLevel) => botLevel,
          render: (props) => props.botLevel,
        },
        coverArt: viewCoverArt(),
        player: {
          onInput: (userStone) => $send(['inputted-user-stone', { userStone }]),
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
        onStartPlaying: () => $send(['start-playing']),
        onStopPlaying: () => $send(['stop-playing']),
        onStartGame: () => $send(['start-game']),
        playerId: model.userId,
      });
    }

    case 'game': {
      const status = toStatus(model.board);
      return ViewVsBotGameScreen<Stone>({
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
        viewBoard: () => (
          <ViewBoard
            onPress={(p) => $send(['input-move', { position: p }])}
            board={model.board}
          />
        ),
        viewPlayerIcon: ({ sx, playerType: stone }) =>
          viewStoneIcon({ ...sx, stone }),
      });
    }
  }
};
