import { Cmd, Sub } from "@gamezilla/core";
import { ViewCtx } from "@gamezilla/shared/client";
import {
  GameLayout,
  GameSpaceClientCtx,
  GameSpaceMsg,
  GameSpaceViewCtx,
  ViewBottomButtonBar,
  VsUserSetupScreen,
} from "@gamezilla/shared/game-space";
import {
  Button,
  ConformationDialog,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark,
  MyAvatar,
  Text,
} from "@gamezilla/ui";
import { PlayerType, toTurn } from "../connect-four";
import { ViewCoverArt } from "../connect-four-cover-art";
import { PlayerIcon, ViewColumns } from "../connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  GameModel,
  GameOverModel,
  Res,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initShared,
  toPlayerType,
} from "./vs-user.core";

//
//
//
// Model
//
//
//

export const init = ({
  players,
}: Pick<ClientModel, "players">): ClientModel => {
  return {
    ...initShared({ players }),
    ghostIndex: "none",
    openedModal: "none",
  };
};

//
//
//
// Update
//
//
//

export const update = ({
  sendToServer,
  msg,
  model,
  ctx,
}: {
  ctx: GameSpaceClientCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: Cmd<ClientMsg>;
} => {
  if (msg.t === "clicked-resign") {
    return { model: { ...model, openedModal: "ConfirmResign" } };
  }

  if (msg.t === "hovered-over-columns") {
    return { model: { ...model, ghostIndex: msg.columnIndex } };
  }

  if (msg.t === "close-modal") {
    return { model: { ...model, openedModal: "none" } };
  }

  const handled = handle({
    ctx: ctx,
    model,
    req: msg,
  });

  const modelNew = syncWithServer({
    clientModel: model,
    serverModel: handled.t === "ok" ? handled.value : model,
  });

  return {
    model: modelNew,
    cmd: sendToServer(msg),
  };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: Cmd<ClientMsg>;
} => {
  if (msg.t === "tick-done") {
    const merged = syncWithServer({
      clientModel: model,
      serverModel: msg.model,
    });
    return { model: merged };
  }

  if (msg.t === "player-left") {
    const merged = syncWithServer({
      clientModel: model,
      serverModel: msg.model,
    });
    return { model: merged };
  }

  const modelNew = msg.result.t === "err" ? model : msg.result.value;
  const merged = syncWithServer({
    clientModel: model,
    serverModel: modelNew,
  });
  return { model: { ...merged, openedModal: "none" } };
};

export const syncWithServer = ({
  clientModel,
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return {
    ...serverModel,
    openedModal: clientModel.openedModal,
    ghostIndex: clientModel.ghostIndex,
  };
};

export const updateFromParent = (input: {
  model: ClientModel;
  msg: GameSpaceMsg;
}): {
  model: ClientModel;
} => {
  return input;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: ClientModel): Sub<ClientMsg> => {
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
  dispatch,
  onQuit,
}: {
  model: ClientModel;
  ctx: GameSpaceViewCtx;
  dispatch: (msg: ClientMsg) => void;
  onQuit: () => void;
}) => {
  if (model.type === "setup") {
    return (
      <VsUserSetupScreen
        ctx={ctx}
        title="Connect Four"
        renderCoverArt={(props) => {
          return (
            <div {...props}>
              <ViewCoverArt />
            </div>
          );
        }}
        onStartGame={() => {
          dispatch({ t: "start-game" });
        }}
        onQuit={onQuit}
        playerOne={{
          label: "Red",
          onStartPlaying: () => {
            dispatch({ t: "start-playing", playerType: "player-one" });
          },
          onStopPlaying: () => {
            dispatch({ t: "stop-playing" });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="player-one" {...props} />;
          },
          userId: model.players["player-one"],
        }}
        playerTwo={{
          label: "Yellow",
          onStartPlaying: () => {
            dispatch({ t: "start-playing", playerType: "player-two" });
          },
          onStopPlaying: () => {
            dispatch({ t: "stop-playing" });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="player-two" {...props} />;
          },
          userId: model.players["player-two"],
        }}
      />
    );
  }

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

  return (
    <GameLayout isSpectating={currentUserPlayerType === null}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div className="flex w-full items-center gap-2 px-2">
          <PlayerSlot playerType="player-one" model={model} ctx={ctx} />
          <PlayerSlot playerType="player-two" model={model} ctx={ctx} />
        </div>

        <Feedback ctx={ctx} model={model} />

        <div className="relative w-full">
          <ViewColumns
            columns={model.columns}
            gameId={model.gameId}
            onClick={(columnIndex) =>
              dispatch({
                t: "input-move",
                userId: ctx.currentUserId,
                columnIndex,
              })
            }
            onHover={(columnIndex) =>
              dispatch({ t: "hovered-over-columns", columnIndex })
            }
            disabled={
              toTurn(model.columns) !== currentUserPlayerType ||
              model.type === "game-over"
            }
            ghost={
              currentUserPlayerType !== null && model.ghostIndex !== "none"
                ? {
                    playerType: currentUserPlayerType,
                    columnIndex: model.ghostIndex,
                  }
                : undefined
            }
          />
          {model.type === "game-over" && (
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
              <ViewGameOverMessage
                dispatch={dispatch}
                ctx={ctx}
                model={model}
              />
            </div>
          )}
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          ...(model.type === "game"
            ? [
                {
                  icon: <IconFlag />,
                  label: "Resign",
                  onClick: () => {
                    dispatch({
                      t: "clicked-resign",
                      userId: ctx.currentUserId,
                    });
                  },
                },
              ]
            : []),
          ...(model.type === "game-over" && ctx.currentUserId === ctx.hostId
            ? [
                {
                  icon: <IconArrowLeftOnRect />,
                  label: "Exit",
                  onClick: () => {
                    dispatch({ t: "new-game" });
                  },
                },
                {
                  icon: <IconArrowRotateLeft />,
                  label: "Rematch",
                  onClick: () => {
                    dispatch({ t: "rematch-request" });
                  },
                },
              ]
            : []),
        ]}
      />

      <ConformationDialog
        headerIcon={<IconFlag className="h-10 w-10" />}
        title="Resign from game?"
        onCancel={() => dispatch({ t: "close-modal" })}
        onClose={() => dispatch({ t: "close-modal" })}
        confirmTitle="Resign"
        onConfirm={() => dispatch({ t: "resign" })}
        open={model.openedModal === "ConfirmResign"}
      />
    </GameLayout>
  );
};

const ViewGameOverMessage = ({
  ctx,
  model,
  dispatch,
}: {
  model: GameOverModel;
  ctx: ViewCtx;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, model);

  if (
    model.rematch.type === "Asking" &&
    model.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p className="mb-4 text-center text-xl">Waiting for response</p>
        <IconSpinner className="mb-4 h-8 w-8 animate-spin" />
        <Button
          variant="contained"
          onClick={() => dispatch({ t: "rematch-cancel" })}
          text="Cancel"
        />
      </>
    );
  }

  if (
    model.rematch.type === "Asking" &&
    model.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <Text variant="h3" className="text-center">
          Rematch?
        </Text>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "rematch-respond",
                response: "Decline",
              })
            }
            start={<IconXMark />}
            text="Decline"
          />

          <Button
            variant="contained"
            onClick={() =>
              dispatch({ t: "rematch-respond", response: "Accept" })
            }
            start={<IconCheckmarkCircle />}
            text="Accept"
          />
        </div>
      </>
    );
  }

  if (model.gameOver.type === "Draw") {
    return <p className="text-xl">Tie</p>;
  }

  if (model.gameOver.type === "resignation") {
    const { resigner } = model.gameOver;

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one";

    if (currentPlayerType === null) {
      return (
        <>
          <div className="flex w-full items-center justify-center">
            <PlayerIcon playerType={winner} />
            <MyAvatar
              alt=""
              src={ctx.profiles[model.players[winner]]?.avatarUrl}
            />
          </div>
          <p>Winner</p>
        </>
      );
    }

    return (
      <>
        <Text variant="h2">
          {currentPlayerType === winner ? "You Won" : "You Lost"}
        </Text>
        <p>by resignation</p>
      </>
    );
  }

  if (model.gameOver.type === "Winner") {
    const { winner } = model.gameOver;

    if (currentPlayerType === null) {
      return (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} className="h-20 w-20" />
            <MyAvatar
              className="h-20 w-20"
              src={ctx.profiles[model.players[winner]]?.avatarUrl}
            />
          </div>
          <Text variant="h2">Winner</Text>
        </div>
      );
    }

    return (
      <Text variant="h2">
        {currentPlayerType === winner ? "You Won" : "You Lost"}
      </Text>
    );
  }

  return null;
};

const Feedback = ({
  ctx,
  model,
}: {
  ctx: GameSpaceViewCtx;
  model: GameModel | GameOverModel;
}) => {
  if (model.type === "game-over") {
    return (
      <p className="flex items-center justify-center text-secondary">
        Game Over
      </p>
    );
  }

  const turn = toTurn(model.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

  if (currentUserPlayerType !== turn) {
    return (
      <p className="flex items-center justify-center gap-2 text-center text-secondary">
        <PlayerIcon className="h-4 w-4" playerType={turn} />
        Turn
      </p>
    );
  }

  if (model.moveCountDown <= 5) {
    return (
      <p className="flex items-center justify-center gap-2 text-center">
        Move in {model.moveCountDown}...
      </p>
    );
  }

  return (
    <p className="flex items-center justify-center gap-2 text-center">
      <PlayerIcon className="h-4 w-4" playerType={turn} />
      Your Turn
    </p>
  );
};

const PlayerSlot = ({
  model,
  playerType,
  ctx,
}: {
  model: GameModel | GameOverModel;
  playerType: PlayerType;
  ctx: GameSpaceViewCtx;
}) => {
  return (
    <div className="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-700 p-2">
      <PlayerIcon className="h-8 w-8" playerType={playerType} />
      <MyAvatar
        className="h-8 w-8"
        alt=""
        src={ctx.profiles[model.players[playerType]]?.avatarUrl}
      />
      <p className="text-secondary">
        {ctx.profiles[model.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};

export const resToStr = ({ res }: { ctx: GameSpaceClientCtx; res: Res }) => {
  if (res.t === "start-playing" && res.result.t === "ok") {
    // const username = ctx.profiles[res.user]?.username ?? "...";
    return `Started playing`;
  }

  if (res.t === "stop-playing" && res.result.t === "ok") {
    // const username = ctx.profiles[res.user]?.username ?? "...";
    return `Stopped playing`;
  }

  return null;
};
