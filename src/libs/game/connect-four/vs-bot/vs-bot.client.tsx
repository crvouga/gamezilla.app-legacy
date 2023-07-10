import {
  Ctx,
  GameLayout,
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
  VsBotGameOverOverlay,
  VsBotPlayerSection,
  VsBotProps,
  VsBotSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Posix, Sub } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "@gamezilla/shared/ui";
import { toStatus, toTurn } from "../connect-four";
import {
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  ViewCoverArt,
} from "../connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (...params: Parameters<typeof initShared>): ClientModel => {
  const shared = initShared(...params);

  if (shared.type === "setup") {
    return shared;
  }

  return {
    ...shared,
    ghostIndex: null,
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

export const update = ({
  sendToServer,
  ctx,
  msg,
  model,
}: {
  ctx: SpaceCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "hovered") {
    if (model.type !== "game") {
      return { model };
    }
    return { model: { ...model, ghostIndex: msg.columnIndex } };
  }

  const result = handle({ ctx, msg, model });

  if (result.t === "err") {
    return { model };
  }

  const modelNext = syncWithServer({
    ctx,
    serverModel: result.value,
    clientModel: model,
  });

  return { model: modelNext, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "player-left") {
    const modelNew = syncWithServer({
      ctx,
      clientModel: model,
      serverModel: msg.model,
    });
    return { model: modelNew };
  }

  if (msg.result.t === "err") {
    return { model };
  }

  const modelNew = syncWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  });

  return { model: modelNew };
};

export const syncWithServer = ({
  serverModel,
  clientModel,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  if (serverModel.type === "setup") {
    return serverModel;
  }

  if (clientModel.type === "setup") {
    return {
      ...serverModel,
      ghostIndex: null,
    };
  }

  return {
    ...serverModel,
    ghostIndex: clientModel.ghostIndex,
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
  _now: Posix,
  _model: Model
): Sub<Msg> => {
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
  model,
  onQuit,
  ctx,
  dispatch,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
  onQuit: () => void;
  ctx: SpaceViewCtx;
}) => {
  const vsBotProps: VsBotProps = {
    ctx: ctx,
    onQuit: onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    canStartGame: model.player !== null,
    onStartGame: () => dispatch({ t: "start-game" }),
    human: {
      player:
        model.userPlayerType === "PlayerOne" ? "player-one" : "player-two",
      userId: model.player,
    },
    bot: {
      label: model.botLevel,
    },
    playerOne: {
      label: "Red",
      renderIcon: (props) => <PlayerOneIcon {...props} />,
      onStartPlaying: () =>
        dispatch({ t: "start-playing", playerType: "PlayerOne" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        dispatch({ t: "start-playing", playerType: "PlayerTwo" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
    },
  };

  if (model.type === "setup") {
    return <VsBotSetupScreen {...vsBotProps} />;
  }

  const vsBotGameProps = {
    ...vsBotProps,
    human: {
      ...vsBotProps.human,
      userId: model.player,
    },
  };

  const turn = toTurn(model.columns);
  const status = toStatus(model.columns);

  return (
    <GameLayout isSpectating={ctx.currentUserId !== model.player}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <VsBotPlayerSection {...vsBotGameProps} />

        <LoadingBar
          disabled={turn === model.userPlayerType || status.type !== "Playing"}
          className="w-full"
        />

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <ViewColumns
            implementation="svg"
            ghost={
              ctx.currentUserId === model.player &&
              turn === model.userPlayerType &&
              model.ghostIndex !== null
                ? {
                    columnIndex: model.ghostIndex,
                    playerType: model.userPlayerType,
                  }
                : undefined
            }
            columns={model.columns}
            onHover={(columnIndex) => dispatch({ t: "hovered", columnIndex })}
            onClick={(columnIndex) =>
              dispatch({ t: "input-move", columnIndex })
            }
          />

          <VsBotGameOverOverlay
            {...vsBotGameProps}
            fadeInDelay={600}
            gameOver={
              status.type === "Tie"
                ? { t: "draw" }
                : status.type === "Winner"
                ? {
                    t: "winner",
                    winner:
                      status.winner === "PlayerOne"
                        ? "player-one"
                        : "player-two",
                  }
                : null
            }
          />
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          {
            label: "Exit",
            icon: <IconArrowLeftOnRect />,
            onClick: () => dispatch({ t: "stop-game" }),
          },
          {
            label: "Swap sides",
            icon: <IconRightLeft />,
            onClick: () => dispatch({ t: "swap-sides" }),
          },
          {
            label: "Restart",
            icon: <IconArrowRotateLeft />,
            onClick: () => dispatch({ t: "restart" }),
          },
        ]}
      />
    </GameLayout>
  );
};
