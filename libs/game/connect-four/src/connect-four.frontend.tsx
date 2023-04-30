import { Cmd, Posix, Sub } from '@gamezilla/core';
import {
  Alerts,
  Ctx,
  RoomCtx,
  RoomViewCtx,
  ViewCtx,
  ViewMainMenu,
  bannerArtAspectRatio,
} from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import { IconComputerDesktop, IconUsers } from '@gamezilla/shared/ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './connect-four.types';
import {
  PlayerIcon,
  ViewCoverArt,
  gameTheme,
} from './connect-four/connect-four-ui';
import * as VsBot from './vs-bot/vs-bot.frontend';
import * as VsUser from './vs-user/vs-user.frontend';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = { t: 'none' };

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

type OutAction = Alerts.Action;

export const update = ({
  sendToBackend,
  ctx,
  msg,
  model,
}: {
  sendToBackend: (msg: ToBackend) => Cmd;
  ctx: RoomCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'input-mode') {
    return { model, cmd: sendToBackend(msg) };
  }

  if (msg.t === 'vs-user' && model.t === 'vs-user') {
    const updated = VsUser.update(
      {
        sendToBackend: (c) => sendToBackend({ t: 'vs-user', c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: 'vs-user', c: updated[0] },
      cmd: Cmd.tag_('vs-user', updated[1]),
    };
  }

  if (msg.t === 'vs-bot' && model.t === 'vs-bot') {
    const updated = VsBot.update(
      {
        ctx,
        sendToBackend: (c) => sendToBackend({ t: 'vs-bot', c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: 'vs-bot', c: updated.model },
      cmd: Cmd.tag_('vs-bot', updated.cmd),
    };
  }

  return { model };
};

export const updateFromBackend = ({
  ctx,
  model,
  msg,
}: {
  ctx: RoomCtx;
  msg: ToFrontend;
  model: Model;
}): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg.t) {
    case 'input-mode': {
      if (msg.result.type === 'Err') {
        return [model, Cmd.None, []];
      }

      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg.result.value,
        ctx,
      });
      return [merged, Cmd.None, []];
    }

    case 'vs-user': {
      if (model.t === 'vs-user') {
        const [c, cmd, actions] = VsUser.updateFromBackend(msg.c, model.c);
        return [{ t: 'vs-user', c }, Cmd.tag_('vs-user', cmd), actions];
      }
      return [model, Cmd.None, []];
    }

    case 'vs-bot': {
      if (model.t === 'vs-bot') {
        const updated = VsBot.updateFromBackend({
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: 'vs-bot', c: updated.model },
          Cmd.tag_('vs-bot', updated.cmd ?? Cmd.None),
          updated?.actions ?? [],
        ];
      }
      return [model, Cmd.None, []];
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
  $send,
  ctx,
  gameRoomCtx,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  ctx: ViewCtx;
  gameRoomCtx: RoomViewCtx;
}) => {
  const goBack = () => $send({ t: 'input-mode', mode: 'none' });

  switch (model.t) {
    case 'none': {
      return (
        <ViewMainMenu
          roomCtx={gameRoomCtx}
          title="Connect Four"
          coverArt={<ViewCoverArt />}
          buttons={[
            {
              icon: <IconUsers />,
              label: 'Play Friend',
              onClick: () => $send({ mode: 'vs-user', t: 'input-mode' }),
            },
            {
              icon: <IconComputerDesktop className="w-6 h-6" />,
              label: 'Play Computer',
              onClick: () => $send({ mode: 'vs-bot', t: 'input-mode' }),
            },
          ]}
        />
      );
    }

    case 'vs-user': {
      return (
        <VsUser.View
          ctx={ctx}
          $send={(c) => $send({ t: 'vs-user', c })}
          goBack={goBack}
          model={model.c}
        />
      );
    }

    case 'vs-bot': {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(c) => $send({ t: 'vs-bot', c })}
          model={model.c}
          goBack={goBack}
        />
      );
    }
  }
};

//
//
//
// Art
//
//
//

export const BannerArt = () => {
  const iconSx: UI.Sx = { width: 120, height: 120, maxHeight: '66%' };

  return (
    <UI.AspectRatio aspectRatio={bannerArtAspectRatio}>
      <UI.List
        sx={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <PlayerIcon playerType="PlayerOne" sx={iconSx} />
        <PlayerIcon playerType="PlayerTwo" sx={iconSx} />
      </UI.List>
      <UI.List
        sx={{
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.1)',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <UI.Typography
          color="#fff"
          fontSize={36}
          sx={{ paddingX: 2, paddingY: 1 }}
        >
          Connect Four
        </UI.Typography>
      </UI.List>
    </UI.AspectRatio>
  );
};

export const mergeWithBackend = ({
  ctx,
  frontendModel,
  backendModel,
}: {
  ctx: Ctx;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  switch (backendModel.t) {
    case 'none': {
      return backendModel;
    }

    case 'vs-bot': {
      if (frontendModel.t === 'vs-bot') {
        return {
          t: 'vs-bot',
          c: VsBot.mergeWithBackend({
            ctx,
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        };
      }

      return {
        t: 'vs-bot',
        c: VsBot.mergeWithBackend({
          ctx,
          frontendModel: VsBot.init(backendModel.c),
          backendModel: backendModel.c,
        }),
      };
    }

    case 'vs-user': {
      if (frontendModel.t === 'vs-user') {
        return {
          t: 'vs-user',
          c: VsUser.mergeWithBackend({
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        };
      }

      return {
        t: 'vs-user',
        c: VsUser.mergeWithBackend({
          frontendModel: VsUser.init(backendModel.c),
          backendModel: backendModel.c,
        }),
      };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  now: Posix,
  model: Model
): Sub<Msg> => {
  switch (model.t) {
    case 'none': {
      return Sub.None;
    }

    case 'vs-bot': {
      return Sub.tag_('vs-bot', VsBot.subscriptions(intervalId, now, model.c));
    }

    case 'vs-user': {
      return Sub.tag_('vs-user', VsUser.subscriptions(model.c));
    }
  }
};
