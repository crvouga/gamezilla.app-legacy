import { Cmd, Sub } from '@gamezilla/shared/core';
import {
  ViewCtx,
  viewUserPlayerSlotBar,
  viewVsUserSetupScreen,
} from '@gamezilla/shared/frontend';
import {
  actionButton,
  box,
  button,
  conformation,
  fillBox,
  text,
} from '@gamezilla/shared/ui';
import { ViewCoverArt, viewStoneIcon } from '../gomoku/gomoku-ui';
import {
  ServerModel,
  ClientModel,
  ClientMsg,
  ModelGameOver,
  ToServer,
  ToClient,
  initShared,
} from './vs-user.types';

//
//
//
// model
//
//
//

export type Model = ClientModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  sendToServer,
}: {
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'clicked-cancel') {
    return { model: { ...model, confirming: undefined } };
  }

  if (msg.t === 'resign') {
    if (model.confirming === 'resign') {
      return { model, cmd: sendToServer(msg) };
    }

    return { model: { ...model, confirming: 'resign' } };
  }

  return { model, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-move') {
    if (msg.result.type === 'Err') {
      return { model };
    }
    const merged = mergeWithServer({
      serverModel: msg.result.value,
      clientModel: model,
    });

    return { model: merged };
  }

  if (msg.result.type === 'Err') {
    return { model };
  }

  const merged = mergeWithServer({
    serverModel: msg.result.value,
    clientModel: model,
  });

  return { model: merged };
};

export const mergeWithServer = ({
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return serverModel;
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
  model,
  ctx,
  onCancel,
  $send,
}: {
  $send: (m: Msg) => void;
  ctx: ViewCtx;
  model: Model;
  onCancel: () => void;
}) => {
  switch (model.type) {
    case 'setup': {
      return viewVsUserSetupScreen({
        title: 'gomoku',
        subtitle: 'Player Vs Player',
        coverArt: ViewCoverArt(),
        ctx,
        playerOne: {
          label: 'White',
          userId: model.white,
          onStartPlaying: () => $send({ t: 'start-playing', stone: 'white' }),
          onStopPlaying: () => $send({ t: 'stop-playing', stone: 'white' }),
          icon: (sx) => viewStoneIcon({ ...sx, stone: 'white' }),
        },
        playerTwo: {
          label: 'Black',
          userId: model.black,
          onStartPlaying: () => $send({ t: 'start-playing', stone: 'black' }),
          onStopPlaying: () => $send({ t: 'stop-playing', stone: 'black' }),
          icon: (sx) => viewStoneIcon({ ...sx, stone: 'black' }),
        },
        onCancel,
        onStartGame: () => $send({ t: 'start-game' }),
      });
    }

    case 'playing': {
      return fillBox({}, [
        viewUserPlayerSlotBar({ left: model.white, right: model.black, ctx }),
        // viewBoard({
        //   // model: model.visuals,
        //   onPress: (position) => $send(['input-move', { position }]),
        // }),
        box({ sx: { flex: 1 } }, []),
        box({ sx: { display: 'flex', p: 2 } }, [
          actionButton({
            label: 'resign',
            iconName: 'flag',
            onPress: () => $send({ t: 'resign' }),
          }),
        ]),
        conformation({
          open: 'resign' === model.confirming,
          title: 'resign from game?',
          iconName: 'flag',
          confirmTitle: 'resign',
          onConfirm: () => $send({ t: 'resign' }),
          onCancel: () => $send({ t: 'clicked-cancel' }),
          onClose: () => $send({ t: 'clicked-cancel' }),
        }),
      ]);
    }

    case 'gameOver': {
      return fillBox({}, [
        viewUserPlayerSlotBar({ left: model.white, right: model.black, ctx }),
        box({ sx: { position: 'relative', aspectRatio: '1' } }, [
          // viewBoard({ model: {} }),
          viewOverlay({ model, ctx }),
        ]),
        box(
          { sx: { p: 2, display: 'flex', gap: 2, flexDirection: 'column' } },
          [
            button(
              {
                onPress: () => $send({ t: 'rematch-request' }),
                variant: 'contained',
                startIcon: 'restart',
                width: '100%',
              },
              'Rematch'
            ),
            button(
              {
                onPress: () => $send({ t: 'stop-game' }),
                variant: 'contained',
                startIcon: 'exit',
                width: '100%',
              },
              'Back to lobby'
            ),
          ]
        ),
      ]);
    }
  }
};

export const viewOverlay = ({
  model,
  ctx,
}: {
  model: ModelGameOver;
  ctx: ViewCtx;
}) => {
  return box(
    {
      sx: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.66)',
        aspectRatio: '1',
      },
    },
    [viewOverlay_({ model, ctx })]
  );
};

export const viewOverlay_ = ({
  model,
  ctx,
}: {
  model: ModelGameOver;
  ctx: ViewCtx;
}) => {
  const currentUserStone =
    ctx.currentUserId === model.white ? 'white' : 'black';
  if (
    model.gameOver.type === 'resigned' &&
    model.gameOver.resigner === currentUserStone
  ) {
    return text({ color: 'white', variant: 'h2' }, ['You resigned']);
  }

  if (model.gameOver.type === 'resigned') {
    return box({ sx: { display: 'flex', alignItems: 'center' } }, [
      viewStoneIcon({
        stone: model.gameOver.resigner,
        width: 64,
        height: 64,
        mr: 2,
      }),
      text({ color: 'white', variant: 'h1' }, 'resigned'),
    ]);
  }

  if (model.gameOver.type === 'Draw') {
    return text({ color: 'white', variant: 'h1' }, ['Draw']);
  }

  if (
    model.gameOver.type === 'Winner' &&
    model.gameOver.winner === currentUserStone
  ) {
    return text({ color: 'white', variant: 'h1' }, ['You won']);
  }

  if (model.gameOver.type === 'Winner') {
    return box({ sx: { display: 'flex', alignItems: 'center' } }, [
      viewStoneIcon({
        stone: model.gameOver.winner,
        width: 64,
        height: 64,
        mr: 2,
      }),
      text({ color: 'white', variant: 'h1' }, 'Won'),
    ]);
  }

  return text({ color: 'white', variant: 'h2' }, ['Game Over']);
};
