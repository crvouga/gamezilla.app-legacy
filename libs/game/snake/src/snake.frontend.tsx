import { useLayoutEffect, useRef } from 'react';
import { Ctx, Alerts, Route } from '@gamezilla/shared';
import {
  Cmd,
  exhaustive,
  Keyboard,
  Option,
  Result,
  Sub,
} from '@gamezilla/core';
import * as UI from '@gamezilla/shared/ui';
import { Direction } from './direction';
import * as Snake from './snake';
import {
  BackendModel,
  canStartGame,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  SharedModel,
  ToBackend,
  ToFrontend,
} from './snake.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  ...initSharedModel,
  openedMenuId: Option.None,
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
  {
    sendToBackend,
    ctx,
  }: {
    sendToBackend: (msg: ToBackend) => Cmd;
    ctx: Ctx;
  },
  msg: Msg,
  _model: Model
): [Model, Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };

  switch (msg[0]) {
    case 'ClickedBack':
      return [model, Route.back];

    case 'PressedKeyDown': {
      if (model.gameStatus.type !== 'GameStarted') {
        return [model, Cmd.None];
      }

      if (model.gameStatus.player[1] !== ctx.currentUserId) {
        return [model, Cmd.None];
      }

      const direction = Direction.fromKey(msg[1]);

      const changeDirectionCmd =
        direction.type === 'Some'
          ? sendToBackend([
              'InputDirection',
              { userId: ctx.currentUserId, direction: direction.value },
            ])
          : Cmd.None;

      const toggleStatusCmd =
        msg[1] === 'Space'
          ? sendToBackend(['ToggleStatus', { userId: ctx.currentUserId }])
          : Cmd.None;

      return [model, Cmd.batch([changeDirectionCmd, toggleStatusCmd])];
    }

    case 'ToggleStatus': {
      return [model, sendToBackend(msg)];
    }

    case 'InputPlayer': {
      return [model, sendToBackend(msg)];
    }

    case 'InputDirection': {
      return [model, sendToBackend(msg)];
    }

    case 'start-game': {
      return [model, sendToBackend(msg)];
    }

    case 'OpenedMenu': {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None];
    }

    case 'ClosedMenu': {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'Sync': {
      const sharedModel = msg[1];
      return [
        {
          ...sharedModel,
          openedMenuId: model.openedMenuId,
        },
        Cmd.None,
        [],
      ];
    }

    case 'InputDirection_Done': {
      return updateResponse(msg[1], model);
    }

    case 'ToggleStatus_Done': {
      return updateResponse(msg[1], model);
    }

    case 'InputPlayer_Done': {
      return updateResponse(msg[1], model);
    }

    case 'StartGame_Done': {
      return updateResponse(msg[1], model);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const updateResponse = <
  TProblem extends string,
  TResult extends Result<TProblem, SharedModel>
>(
  result: TResult,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  if (result.type === 'Err') {
    const message = result.error.split('_').join(' ');
    return [
      model,
      Cmd.None,
      [['Alerts', { tag: 'Snack', message, variant: 'Error' }]],
    ];
  }
  const sharedModel = result.value;
  return [{ ...model, ...sharedModel }, Cmd.None, []];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Keyboard.keyDowns<Msg>((key) => ['PressedKeyDown', key]);
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
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.gameStatus.type === 'GameSetup') {
    const menuAnchorId = 'playerSlotMenuId';
    return (
      <UI.FillBox>
        <UI.Typography sx={{ paddingX: 2 }} color="text.secondary">
          Snake
        </UI.Typography>

        <UI.Box
          sx={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {model.gameStatus.player.type === 'none' ? (
            <UI.Box sx={{ padding: 2, width: '100%' }}>
              <UI.Button
                variant="contained"
                fullWidth
                onClick={() =>
                  $send([
                    'InputPlayer',
                    Option.Some(['User', ctx.currentUserId]),
                  ])
                }
              >
                Play as Snake
              </UI.Button>
            </UI.Box>
          ) : (
            <>
              <UI.ListItemButton
                id={menuAnchorId}
                onClick={() => $send(['OpenedMenu', menuAnchorId])}
              >
                <UI.ListItemAvatar>
                  <UI.Avatar
                    src={
                      ctx.profiles[model.gameStatus.player.value[1]]?.avatarUrl
                    }
                  />
                </UI.ListItemAvatar>
                <UI.ListItemText
                  primary={
                    ctx.profiles[model.gameStatus.player.value[1]]?.username
                  }
                />
                <UI.ListItemSecondaryAction>
                  <UI.Icons.MoreVert />
                </UI.ListItemSecondaryAction>
              </UI.ListItemButton>
              <UI.Menu
                open={
                  model.openedMenuId.type === 'Some' &&
                  model.openedMenuId.value === menuAnchorId
                }
                onClose={() => $send(['ClosedMenu'])}
                anchorEl={document.getElementById(menuAnchorId)}
              >
                <UI.Button
                  size="large"
                  fullWidth
                  onClick={() => $send(['InputPlayer', Option.None])}
                >
                  Stop Playing
                </UI.Button>
              </UI.Menu>
            </>
          )}
        </UI.Box>

        <UI.Box sx={{ flex: 1 }} />

        <UI.Box sx={{ padding: 2 }}>
          <UI.Button
            variant="contained"
            fullWidth
            disabled={!canStartGame(model)}
            onClick={() => {
              $send(['start-game']);
            }}
          >
            Start Game
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    );
  }

  return (
    <UI.FillBox>
      <ViewBoard model={model} $send={$send} />
      {model.gameStatus.player[1] === ctx.currentUserId && (
        <UI.Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            paddingBottom: 2,
          }}
        >
          {/*  */}
        </UI.Box>
      )}
      {/* {model.gameStatus.player[1] === currentUserId && (
            <UI.Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <UI.Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <UI.ButtonBase
                  sx={leftRight}
                  onMouseDown={() => $send(["InputDirection", { direction: "left", userId: currentUserId }])}
                >
                  <UI.Icons.KeyboardArrowLeft sx={iconSx} />
                </UI.ButtonBase>

                <UI.Box sx={{ display: "flex", flexDirection: "column" }}>
                  <UI.ButtonBase
                    sx={upDown}
                    onMouseDown={() => $send(["InputDirection", { direction: "up", userId: currentUserId }])}
                  >
                    <UI.Icons.KeyboardArrowUp sx={iconSx} />
                  </UI.ButtonBase>

                  <UI.ButtonBase
                    sx={upDown}
                    onMouseDown={() => $send(["InputDirection", { direction: "down", userId: currentUserId }])}
                  >
                    <UI.Icons.KeyboardArrowDown sx={iconSx} />
                  </UI.ButtonBase>
                </UI.Box>

                <UI.ButtonBase
                  sx={leftRight}
                  onMouseDown={() => $send(["InputDirection", { direction: "right", userId: currentUserId }])}
                >
                  <UI.Icons.KeyboardArrowRight sx={iconSx} />
                </UI.ButtonBase>
              </UI.Box>
            </UI.Box>
          )} */}
    </UI.FillBox>
  );
};

export const ViewBoard = ({
  model,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      const dpi = 1000;
      ctx.scale(dpi, dpi);

      const width = canvas.width;
      const height = canvas.height;

      Snake.draw({ width, height }, model, ctx);
    }
  }, [model]);

  return (
    <UI.Box sx={{ flex: 1, width: '100%', userSelect: 'none' }}>
      <canvas
        style={{
          userSelect: 'none',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          minHeight: '100%',
        }}
        ref={ref}
      />
    </UI.Box>
  );
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): FrontendModel => {
  return {
    ...backendModel,
    openedMenuId: frontendModel.openedMenuId,
  };
};
