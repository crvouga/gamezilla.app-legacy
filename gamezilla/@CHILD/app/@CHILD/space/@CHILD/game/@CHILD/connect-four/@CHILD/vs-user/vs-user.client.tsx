import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  VsUserSetupScreen,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/vs-user";
import {
  GameClient,
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ViewCtx } from "gamezilla/@CHILD/app/@SHARED/client";
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
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, chain } from "gamezilla/@SHARED/core";
import { PlayerType, toTurn } from "../../@SHARED/connect-four";
import { PlayerIcon, ViewColumns } from "../../@SHARED/connect-four-ui";
import { CoverArt } from "../../@SHARED/connect-four-ui/connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  StateGame,
  StateGameOver,
  ToClient,
  ToServer,
  toPlayerType,
} from "./vs-user.core";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx & { onQuit: () => void };
}>;

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
      ghostIndex: null,
      openedModal: null,
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

export const update: Client["update"] = (input) => {
  return chain(init(input), (model) => {
    const { msg } = input;

    if (!msg) {
      return { model };
    }

    switch (msg.t) {
      case "clicked-resign": {
        return { model: { ...model, openedModal: "confirm-resign" } };
      }

      case "hovered-over-columns": {
        return { model: { ...model, ghostIndex: msg.columnIndex } };
      }

      case "close-modal": {
        return { model: { ...model, openedModal: null } };
      }

      default: {
        return {
          model,
          gameEvent: msg,
        };
      }
    }
  });
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

export const View: Client["View"] = ({ ctx, model, state, dispatch }) => {
  if (!model) {
    return null;
  }

  if (state.type === "setup") {
    return (
      <VsUserSetupScreen
        ctx={ctx}
        title="Connect Four"
        renderCoverArt={(props) => {
          return (
            <div {...props}>
              <CoverArt />
            </div>
          );
        }}
        onStartGame={() => {
          dispatch({ t: "user-started-game", userId: ctx.currentUserId });
        }}
        onQuit={ctx.onQuit}
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
            dispatch({
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
            dispatch({
              t: "user-started-playing",
              userId: ctx.currentUserId,
              playerType: "player-two",
            });
          },
          onStopPlaying: () => {
            dispatch({
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
      <div class="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div class="flex w-full items-center gap-2 px-2">
          <PlayerSlot playerType="player-one" state={state} ctx={ctx} />
          <PlayerSlot playerType="player-two" state={state} ctx={ctx} />
        </div>

        <Feedback ctx={ctx} state={state} />

        <div class="relative w-full">
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
            <div class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
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
                  icon: <IconFlag class="h-6 w-6" />,
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
                  icon: <IconArrowLeftOnRect class="h-6 w-6" />,
                  label: "Exit",
                  onClick: () => {
                    dispatch({
                      t: "user-stopped-game",
                      userId: ctx.currentUserId,
                    });
                  },
                },
                {
                  icon: <IconArrowRotateLeft class="h-6 w-6" />,
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
        headerIcon={<IconFlag class="h-10 w-10" />}
        title="Resign from game?"
        onCancel={() => dispatch({ t: "close-modal" })}
        onClose={() => dispatch({ t: "close-modal" })}
        confirmTitle="Resign"
        onConfirm={() =>
          dispatch({ t: "user-resigned", userId: ctx.currentUserId })
        }
        open={model.openedModal === "confirm-resign"}
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
  dispatch: (msg: GameEvent) => void;
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, state);

  if (
    state.rematch.type === "Asking" &&
    state.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p class="mb-4 text-center text-xl">Waiting for response</p>
        <IconSpinner class="mb-4 h-8 w-8 animate-spin" />
        <Button
          variant="contained"
          onClick={() =>
            dispatch({
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
        <div class="flex w-full items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "user-responded-to-rematch-request",
                userId: ctx.currentUserId,
                response: "Decline",
              })
            }
            start={<IconXMark class="h-6 w-6" />}
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
            start={<IconCheckmarkCircle class="h-6 w-6" />}
            text="Accept"
          />
        </div>
      </>
    );
  }

  if (state.gameOver.type === "Draw") {
    return <p class="text-xl">Tie</p>;
  }

  if (state.gameOver.type === "resignation") {
    const { resigner } = state.gameOver;

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one";

    if (currentPlayerType === null) {
      return (
        <>
          <div class="flex w-full items-center justify-center">
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
        <div class="flex w-full flex-col items-center justify-center gap-2">
          <div class="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} class="h-20 w-20" />
            <MyAvatar
              class="h-20 w-20"
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
      <p class="flex items-center justify-center text-secondary">Game Over</p>
    );
  }

  const turn = toTurn(state.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, state);

  if (currentUserPlayerType !== turn) {
    return (
      <p class="flex items-center justify-center gap-2 text-center text-secondary">
        <PlayerIcon class="h-4 w-4" playerType={turn} />
        Turn
      </p>
    );
  }

  return (
    <p class="flex items-center justify-center gap-2 text-center">
      <PlayerIcon class="h-4 w-4" playerType={turn} />
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
    <div class="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-700 p-2">
      <PlayerIcon class="h-8 w-8" playerType={playerType} />
      <MyAvatar
        class="h-8 w-8"
        alt=""
        src={ctx.profiles[state.players[playerType]]?.avatarUrl}
      />
      <p class="text-secondary">
        {ctx.profiles[state.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};


export const ViewFeedItem: Client["ViewFeedItem"] = () => {
  return null;
}