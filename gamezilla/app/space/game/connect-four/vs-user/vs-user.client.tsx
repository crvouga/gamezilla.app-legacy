import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCmd, ViewCtx, sendToServer } from "gamezilla/app/@SHARED/client";
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
} from "gamezilla/app/@SHARED/ui";
import {
  SpaceClientCtx,
  SpaceCtx,
  SpaceEvt,
  SpaceViewCtx,
} from "gamezilla/app/space/@SHARED";
import { appendEvt, withMeta } from "gamezilla/app/space/@SHARED/evt";
import {
  GameLayout,
  ViewBottomButtonBar,
  VsUserSetupScreen,
} from "gamezilla/app/space/game/@SHARED";
import { PlayerType, toTurn } from "../connect-four";
import { ViewCoverArt } from "../connect-four-cover-art";
import { PlayerIcon, ViewColumns } from "../connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  StateGame,
  StateGameOver,
  ToClient,
  ToServer,
  initCore,
  toPlayerType,
  toState,
} from "./vs-user.core";

//
//
//
// Model
//
//
//

export const init = (...params: Parameters<typeof initCore>): ClientModel => {
  return {
    ...initCore(...params),
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
  msg,
  model,
  ctx,
}: {
  ctx: SpaceClientCtx;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "clicked-resign": {
      return { model: { ...model, openedModal: "ConfirmResign" } };
    }

    case "hovered-over-columns": {
      return { model: { ...model, ghostIndex: msg.columnIndex } };
    }

    case "close-modal": {
      return { model: { ...model, openedModal: "none" } };
    }

    default: {
      const evt = withMeta(msg);

      const modelNew: ClientModel = {
        ...model,
        events: appendEvt(model.events, evt),
      };

      return { model: modelNew, cmd: [sendToServer(evt)] };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  switch (msg.t) {
    default: {
      const modelNew: ClientModel = {
        ...model,
        events: appendEvt(model.events, msg),
      };
      return { model: modelNew };
    }
  }
};

export const mergeWithServer = ({
  ctx,
  server,
  client = init(ctx),
}: {
  ctx: SpaceCtx;
  client?: ClientModel;
  server: ServerModel;
}): ClientModel => {
  return {
    ...server,
    openedModal: client.openedModal,
    ghostIndex: client.ghostIndex,
  };
};

export const updateFromEvt = (input: {
  model: ClientModel;
  msg: SpaceEvt;
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
  ctx: SpaceViewCtx;
  dispatch: (msg: ClientMsg) => void;
  onQuit: () => void;
}) => {
  const state = toState(model);

  if (state.type === "setup") {
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
          dispatch({ t: "user-started-game", userId: ctx.currentUserId });
        }}
        onQuit={onQuit}
        playerOne={{
          label: "Red",
          onStartPlaying: () => {
            dispatch({
              t: "user-started-playing",
              playerType: "player-one",
              userId: ctx.currentUserId,
            });
          },
          onStopPlaying: () => {
            dispatch({ t: "user-stopped-playing", userId: ctx.currentUserId });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="player-one" {...props} />;
          },
          userId: state.players["player-one"],
        }}
        playerTwo={{
          label: "Yellow",
          onStartPlaying: () => {
            dispatch({
              t: "user-started-playing",
              userId: ctx.currentUserId,
              playerType: "player-two",
            });
          },
          onStopPlaying: () => {
            dispatch({ t: "user-stopped-playing", userId: ctx.currentUserId });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="player-two" {...props} />;
          },
          userId: state.players["player-two"],
        }}
      />
    );
  }

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, state);

  return (
    <GameLayout isSpectating={currentUserPlayerType === null}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div className="flex w-full items-center gap-2 px-2">
          <PlayerSlot playerType="player-one" state={state} ctx={ctx} />
          <PlayerSlot playerType="player-two" state={state} ctx={ctx} />
        </div>

        <Feedback ctx={ctx} state={state} />

        <div className="relative w-full">
          <ViewColumns
            columns={state.columns}
            gameId={state.gameId}
            onDropDisc={(columnIndex) =>
              dispatch({
                t: "user-dropped-disc",
                userId: ctx.currentUserId,
                columnIndex,
              })
            }
            onHover={(columnIndex) =>
              dispatch({ t: "hovered-over-columns", columnIndex })
            }
            disabled={
              toTurn(state.columns) !== currentUserPlayerType ||
              state.type === "game-over"
            }
          />
          {state.type === "game-over" && (
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
              <ViewGameOverMessage
                dispatch={dispatch}
                ctx={ctx}
                state={state}
              />
            </div>
          )}
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          ...(state.type === "game"
            ? [
                {
                  icon: <IconFlag className="h-6 w-6" />,
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
          ...(state.type === "game-over" && ctx.currentUserId === ctx.hostId
            ? [
                {
                  icon: <IconArrowLeftOnRect className="h-6 w-6" />,
                  label: "Exit",
                  onClick: () => {
                    dispatch({
                      t: "user-stopped-game",
                      userId: ctx.currentUserId,
                    });
                  },
                },
                {
                  icon: <IconArrowRotateLeft className="h-6 w-6" />,
                  label: "Rematch",
                  onClick: () => {
                    dispatch({
                      t: "user-requested-rematch",
                      userId: ctx.currentUserId,
                    });
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
        onConfirm={() =>
          dispatch({ t: "user-resigned", userId: ctx.currentUserId })
        }
        open={model.openedModal === "ConfirmResign"}
      />
    </GameLayout>
  );
};

const ViewGameOverMessage = ({
  ctx,
  state,
  dispatch,
}: {
  state: StateGameOver;
  ctx: ViewCtx;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, state);

  if (
    state.rematch.type === "Asking" &&
    state.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p className="mb-4 text-center text-xl">Waiting for response</p>
        <IconSpinner className="mb-4 h-8 w-8 animate-spin" />
        <Button
          variant="contained"
          onClick={() =>
            dispatch({ t: "user-cancelled-rematch", userId: ctx.currentUserId })
          }
          text="Cancel"
        />
      </>
    );
  }

  if (
    state.rematch.type === "Asking" &&
    state.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <p>Rematch?</p>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "user-responded-to-rematch-request",
                userId: ctx.currentUserId,
                response: "Decline",
              })
            }
            start={<IconXMark className="h-6 w-6" />}
            text="Decline"
          />

          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "user-responded-to-rematch-request",
                userId: ctx.currentUserId,
                response: "Decline",
              })
            }
            start={<IconCheckmarkCircle className="h-6 w-6" />}
            text="Accept"
          />
        </div>
      </>
    );
  }

  if (state.gameOver.type === "Draw") {
    return <p className="text-xl">Tie</p>;
  }

  if (state.gameOver.type === "resignation") {
    const { resigner } = state.gameOver;

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one";

    if (currentPlayerType === null) {
      return (
        <>
          <div className="flex w-full items-center justify-center">
            <PlayerIcon playerType={winner} />
            <MyAvatar
              alt=""
              src={ctx.profiles[state.players[winner]]?.avatarUrl}
            />
          </div>
          <p>Winner</p>
        </>
      );
    }

    return (
      <>
        <p>{currentPlayerType === winner ? "You Won" : "You Lost"}</p>
        <p>by resignation</p>
      </>
    );
  }

  if (state.gameOver.type === "Winner") {
    const { winner } = state.gameOver;

    if (currentPlayerType === null) {
      return (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} className="h-20 w-20" />
            <MyAvatar
              className="h-20 w-20"
              src={ctx.profiles[state.players[winner]]?.avatarUrl}
            />
          </div>
          <p>Winner</p>
        </div>
      );
    }

    return <p>{currentPlayerType === winner ? "You Won" : "You Lost"}</p>;
  }

  return null;
};

const Feedback = ({
  ctx,
  state,
}: {
  ctx: SpaceViewCtx;
  state: StateGame | StateGameOver;
}) => {
  if (state.type === "game-over") {
    return (
      <p className="flex items-center justify-center text-secondary">
        Game Over
      </p>
    );
  }

  const turn = toTurn(state.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, state);

  if (currentUserPlayerType !== turn) {
    return (
      <p className="flex items-center justify-center gap-2 text-center text-secondary">
        <PlayerIcon className="h-4 w-4" playerType={turn} />
        Turn
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
  state,
  playerType,
  ctx,
}: {
  state: StateGame | StateGameOver;
  playerType: PlayerType;
  ctx: SpaceViewCtx;
}) => {
  return (
    <div className="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-700 p-2">
      <PlayerIcon className="h-8 w-8" playerType={playerType} />
      <MyAvatar
        className="h-8 w-8"
        alt=""
        src={ctx.profiles[state.players[playerType]]?.avatarUrl}
      />
      <p className="text-secondary">
        {ctx.profiles[state.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};
