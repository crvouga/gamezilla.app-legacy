import { Audio, Cmd, exhaustive, Option, Sub, t } from '@gamezilla/core';
import { viewVsBotSetupScreen } from '@gamezilla/game-shared';
import { Alerts, Ctx } from '@gamezilla/temp-shared';
import * as UI from '@gamezilla/temp-shared/ui';
import * as Board from '../chess/chess-board';
import { viewCoverArt } from '../chess/chess-board';
import Sounds from '../chess/chess-sounds';
import { PawnIcon } from '../chess/chess-views';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initShared,
  inputMove,
  isBotTurn,
  Res,
  SharedModel,
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

export const init = (): [FrontendModel, Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared,
      openedMenuId: Option.None,
      openedModal: 'none',
      isFlipped: false,
    },
    Cmd.None,
  ];
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

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  _model: Model
): [Model, Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };
  switch (msg[0]) {
    //
    //
    // Frontend Only
    //
    //

    case 'audio-done': {
      return [model, Cmd.None];
    }

    case 'ClosedModal': {
      return [{ ...model, openedModal: 'none' }, Cmd.None];
    }

    case 'ClickedFlip': {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None];
    }

    case 'OpenedMenu': {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None];
    }

    case 'ClosedMenu': {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None];
    }

    //
    //
    // Frontend and Backend
    //
    //

    case 'InputUser': {
      return [model, sendToBackend(msg)];
    }

    case 'InputColor': {
      return [model, sendToBackend(msg)];
    }

    case 'InputBot': {
      return [model, sendToBackend(msg)];
    }

    case 'start-game': {
      return [model, sendToBackend(msg)];
    }

    case 'stop-game': {
      return [model, sendToBackend(msg)];
    }

    case 'input-move': {
      const result = inputMove(msg[1], model.sharedModel);

      const sharedModel =
        result.type === 'Err' ? model.sharedModel : result.value;

      return [{ ...model, sharedModel: sharedModel }, sendToBackend(msg)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  modelPrev: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  const [modelNext, cmd, actions] = updateFromBackend_(msg, modelPrev);

  if (
    modelPrev.sharedModel.type !== 'GameOver' &&
    modelNext.sharedModel.type === 'GameOver'
  ) {
    return [
      { ...modelNext, openedModal: 'GameOver' },
      Cmd.batch([cmd, playAudio(Sounds.gameOver)]),
      actions,
    ];
  }

  if (
    modelPrev.sharedModel.type !== 'game' &&
    modelNext.sharedModel.type === 'game'
  ) {
    return [modelNext, Cmd.batch([cmd, playAudio(Sounds.gameStart)]), actions];
  }

  return [modelNext, cmd, actions];
};

const updateFromBackend_ = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'bot-moved_Done': {
      const result = msg[1];

      if (result.type === 'Err') {
        return [model, Cmd.None, []];
      }

      const { didCapture, ...sharedModel } = result.value;

      const soundCmd =
        sharedModel.type === 'game' && Board.inCheck(sharedModel.board)
          ? playAudio(Sounds.check)
          : didCapture
          ? playAudio(Sounds.capture)
          : playAudio(Sounds.move);

      return [{ ...model, sharedModel }, soundCmd, []];
    }

    case 'player-left': {
      const merged = mergeWithBackend(model, msg[1]);
      return [merged, Cmd.None, []];
    }

    case 'input-move-done': {
      const result = msg[1];

      if (result.type === 'Err') {
        return [model, Cmd.None, []];
      }

      const sharedModelNew = result.value;

      const modelNew = mergeWithBackend(model, sharedModelNew);

      const soundCmd =
        sharedModelNew.type === 'game' && Board.inCheck(sharedModelNew.board)
          ? playAudio(Sounds.check)
          : sharedModelNew.didCapture
          ? playAudio(Sounds.capture)
          : playAudio(Sounds.move);

      return [modelNew, soundCmd, []];
    }

    case 'InputUser_Done':
    case 'InputColor_Done':
    case 'InputBot_Done':
    case 'StartGame_Done':
    case 'StopGame_Done': {
      return handleResponse(msg, model);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const handleResponse = (
  res: Res,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  const result = res[1];

  if (result.type === 'Err') {
    return [model, Cmd.None, []];
  }

  const sharedModelNew = result.value;

  const modelNew = mergeWithBackend(model, sharedModelNew);

  return [modelNew, Cmd.None, []];
};

const playAudio = (src: string): Cmd<Msg> => {
  return Audio.play(src, t('audio-done'));
};

//
//
//
//
//
//
//

export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel
): FrontendModel => {
  return {
    isFlipped: frontendModel.isFlipped,
    openedMenuId: frontendModel.openedMenuId,
    openedModal: frontendModel.openedModal,
    sharedModel: backendModel,
  };
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
  ctx,
  model,
  $send,
  onClose,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
  onClose: () => void;
}) => {
  if (model.sharedModel.type === 'Setup') {
    return viewVsBotSetupScreen<Board.BotLevel, Board.Color>({
      botLevel: {
        values: Board.allBotLevels,
        selected: model.sharedModel.botLevel,
        onInput: (botLevel) =>
          $send(['InputBot', { botLevel, userId: ctx.currentUserId }]),
      },
      onCancel: onClose,
      coverArt: viewCoverArt(),
      ctx,
      onStartGame: () => $send(['start-game', { userId: ctx.currentUserId }]),
      onStartPlaying: () => $send(['InputUser', { userId: ctx.currentUserId }]),
      onStopPlaying: () => $send(['InputUser', { userId: 'none' }]),
      player: {
        values: Object.values(Board.colors),
        selected: model.sharedModel.userColor,
        onInput: (color) =>
          $send([
            'InputColor',
            { userColor: color, userId: ctx.currentUserId },
          ]),
        icon: ({ sx, playerType: color }) => (
          <PawnIcon
            sx={{ ...sx, color: color === 'w' ? '#fff' : '#000' }}
            stroke={color === 'w' ? '#000' : '#fff'}
          />
        ),
      },
      leftPlayerType: 'w',
      playerId:
        model.sharedModel.userId === 'none' ? null : model.sharedModel.userId,
      title: 'Chess',
      subtitle: 'Vs Computer',
    });
  }

  const botSlot = (
    <UI.Box sx={{ paddingX: 2, display: 'flex', alignItems: 'center' }}>
      <UI.Avatar sx={{ marginRight: 2, backgroundColor: 'transparent' }}>
        <UI.Icons.SmartToy
          sx={{ color: 'text.primary', width: '100%', height: '100%' }}
          // sx={{ width: 40, height: 40, marginRight: 2 }}
        />
      </UI.Avatar>

      <UI.Box sx={{ flex: 1 }}>
        <UI.Typography variant="h6">
          {Board.botLevelToString(model.sharedModel.botLevel)}
        </UI.Typography>
      </UI.Box>

      {isBotTurn(model.sharedModel) && <UI.CircularProgress size={24} />}
    </UI.Box>
  );

  const userSlot = (
    <UI.Box sx={{ paddingX: 2, display: 'flex', alignItems: 'center' }}>
      <UI.Avatar
        src={ctx.profiles[model.sharedModel.userId]?.avatarUrl}
        sx={{ marginRight: 2 }}
      />

      <UI.Typography variant="h6">
        {ctx.profiles[model.sharedModel.userId]?.username}
      </UI.Typography>
    </UI.Box>
  );

  const boardOrientation = model.isFlipped
    ? Board.toOppositeColor(model.sharedModel.userColor)
    : model.sharedModel.userColor;

  const topSlot = (
    <UI.Box sx={{ paddingTop: 1, paddingBottom: 2 }}>
      {boardOrientation === model.sharedModel.userColor ? botSlot : userSlot}
    </UI.Box>
  );

  const bottomSlot = (
    <UI.Box sx={{ paddingTop: 2, paddingBottom: 1 }}>
      {boardOrientation === model.sharedModel.userColor ? userSlot : botSlot}
    </UI.Box>
  );

  return (
    <UI.FillBox>
      {topSlot}

      <Board.View
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return (
            Board.toColor(piece) === model.sharedModel.userColor &&
            model.sharedModel.userId === ctx.currentUserId
          );
        }}
        model={model.sharedModel.board}
        onPieceDrop={(move) => {
          const msg: Msg = [
            'input-move',
            {
              userId: ctx.currentUserId,
              from: move.from,
              to: move.to,
              promotion: move.promotion,
            },
          ];

          $send(msg);

          const result = inputMove(msg[1], model.sharedModel);

          return result.type === 'Ok';
        }}
      />

      {bottomSlot}

      <UI.Box sx={{ flex: 1 }} />

      <UI.Box sx={{ width: '100%', display: 'flex' }}>
        <UI.ActionButton
          icon={<UI.Icons.ExitToApp sx={{ transform: 'rotate(180deg)' }} />}
          label={'Exit'}
          onClick={() => $send(['stop-game', { userId: ctx.currentUserId }])}
        />

        <UI.ActionButton
          icon={
            <UI.Icons.Flip
              sx={{
                transform: model.isFlipped ? 'rotate(90deg)' : 'rotate(270deg)',
              }}
            />
          }
          label={model.isFlipped ? 'Unflip' : 'Flip'}
          onClick={() => {
            $send(['ClickedFlip']);
          }}
        />
      </UI.Box>

      {model.sharedModel.type === 'GameOver' && (
        <UI.Dialog
          open={
            model.sharedModel.type === 'GameOver' &&
            model.openedModal === 'GameOver'
          }
          onClose={() => $send(['ClosedModal'])}
        >
          {model.sharedModel.gameOver.type === 'Checkmate' && (
            <UI.DialogTitle>
              {Board.colorToString(model.sharedModel.gameOver.winner)} won by
              checkmate
            </UI.DialogTitle>
          )}

          {model.sharedModel.gameOver.type === 'Stalemate' && (
            <UI.DialogTitle>Drawn by stalemate</UI.DialogTitle>
          )}

          <UI.DialogActions>
            <UI.Button onClick={() => $send(['ClosedModal'])}>Close</UI.Button>
          </UI.DialogActions>
        </UI.Dialog>
      )}
    </UI.FillBox>
  );
};

export const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case 'GameOver': {
      switch (model.gameOver.type) {
        case 'Checkmate': {
          const color = Board.colorToString(model.gameOver.winner);
          return `${color} won by checkmate`;
        }

        case 'Stalemate': {
          return 'Stalemate';
        }

        default:
          return exhaustive(model.gameOver);
      }
    }

    case 'Setup': {
      return 'Setting up game';
    }

    case 'game': {
      if (Board.inCheck(model.board)) {
        return `${Board.colorToString(Board.toTurn(model.board))} is in check`;
      }

      return `${Board.colorToString(Board.toTurn(model.board))}'s turn`;
    }

    default:
      return exhaustive(model);
  }
};
