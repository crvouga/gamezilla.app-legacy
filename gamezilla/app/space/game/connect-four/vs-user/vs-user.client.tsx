import { Sub } from "gamezilla/@SHARED/core";
import { ViewCtx } from "gamezilla/app/@SHARED/client";
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
import { GameClient, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  GameLayout,
  ViewBottomButtonBar,
  VsUserSetupScreen,
} from "gamezilla/app/space/game/@SHARED";
import { PlayerType, toTurn } from "../@SHARED/connect-four";
import { ViewCoverArt } from "../connect-four-cover-art";
import { PlayerIcon, ViewColumns } from "../@SHARED/connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  Event,
  State,
  StateGame,
  StateGameOver,
  ToClient,
  ToServer,
  toPlayerType,
} from "./vs-user.core";

type Client = GameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State,
  Event,
  SpaceViewCtx & { onQuit: () => void }
>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = () => {
  return {
    model: {
      ghostIndex: "none",
      openedModal: "none",
    },
  };
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = ({ msg, model }) => {
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
  }
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  return input;
};

export const updateFromEvent: Client["updateFromEvent"] = (
  input
): {
  model: ClientModel;
} => {
  return input;
};

export const updateFromGame: Client["updateFromGame"] = (input) => {
  const { model } = input;
  if (model) {
    return { model };
  }
  return init(input);
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Client["View"] = ({
  ctx,
  model,
  state,
  dispatch,
  dispatchEvent,
}) => {
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
          dispatchEvent({ t: "user-started-game", userId: ctx.currentUserId });
        }}
        onQuit={ctx.onQuit}
        playerOne={{
          label: "Red",
          onStartPlaying: () => {
            dispatchEvent({
              t: "user-started-playing",
              playerType: "player-one",
              userId: ctx.currentUserId,
            });
          },
          onStopPlaying: () => {
            dispatchEvent({
              t: "user-stopped-playing",
              userId: ctx.currentUserId,
            });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="player-one" {...props} />;
          },
          userId: state.players["player-one"],
        }}
        playerTwo={{
          label: "Yellow",
          onStartPlaying: () => {
            dispatchEvent({
              t: "user-started-playing",
              userId: ctx.currentUserId,
              playerType: "player-two",
            });
          },
          onStopPlaying: () => {
            dispatchEvent({
              t: "user-stopped-playing",
              userId: ctx.currentUserId,
            });
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
              dispatchEvent({
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
                dispatchEvent={dispatchEvent}
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
          ...(state.type === "game-over" &&
          ctx.currentUserId === ctx.space.hostId
            ? [
                {
                  icon: <IconArrowLeftOnRect className="h-6 w-6" />,
                  label: "Exit",
                  onClick: () => {
                    dispatchEvent({
                      t: "user-stopped-game",
                      userId: ctx.currentUserId,
                    });
                  },
                },
                {
                  icon: <IconArrowRotateLeft className="h-6 w-6" />,
                  label: "Rematch",
                  onClick: () => {
                    dispatchEvent({
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
          dispatchEvent({ t: "user-resigned", userId: ctx.currentUserId })
        }
        open={model.openedModal === "ConfirmResign"}
      />
    </GameLayout>
  );
};

const ViewGameOverMessage = ({
  ctx,
  state,
  dispatchEvent,
}: {
  state: StateGameOver;
  ctx: ViewCtx;
  dispatchEvent: (msg: Event) => void;
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
            dispatchEvent({
              t: "user-cancelled-rematch",
              userId: ctx.currentUserId,
            })
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
              dispatchEvent({
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
              dispatchEvent({
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
