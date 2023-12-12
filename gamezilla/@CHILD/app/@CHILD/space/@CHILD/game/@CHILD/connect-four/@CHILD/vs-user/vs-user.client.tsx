import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { VsUserSetupScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/vs-user";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client-v2";
import {
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { ClientCmd, ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
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
import { Sub } from "gamezilla/@SHARED/core";
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

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceClientCtx & { onQuit: () => void };
  InCmd: null;
  InEvt: SpaceClientEvt;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvt: null;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = () => {
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

export const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    //
    init(input),
    (model) => updateFromMsg({ ...input, model })
  );
};

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model } = input;

  if (!model) {
    return init(input);
  }

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

export const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Module["View"] = ({ ctx, model, gameState, dispatch }) => {
  if (!model) {
    return null;
  }

  if (gameState.type === "setup") {
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
          userId: gameState.players["player-one"],
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
          userId: gameState.players["player-two"],
        }}
      />
    );
  }

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, gameState);

  return (
    <GameLayout isSpectating={currentUserPlayerType === null}>
      <div class="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div class="flex w-full items-center gap-2 px-2">
          <PlayerSlot playerType="player-one" gameState={gameState} ctx={ctx} />
          <PlayerSlot playerType="player-two" gameState={gameState} ctx={ctx} />
        </div>

        <Feedback ctx={ctx} gameState={gameState} />

        <div class="relative w-full">
          <ViewColumns
            columns={gameState.columns}
            gameId={gameState.gameId}
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
              toTurn(gameState.columns) !== currentUserPlayerType ||
              gameState.type === "game-over"
            }
          />
          {gameState.type === "game-over" && (
            <div class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
              <ViewGameOverMessage
                dispatch={dispatch}
                ctx={ctx}
                gameState={gameState}
              />
            </div>
          )}
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          ...(gameState.type === "game"
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
          ...(gameState.type === "game-over" &&
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
  gameState,
  dispatch,
}: {
  gameState: StateGameOver;
  ctx: ClientCtx;
  dispatch: (msg: GameEvent) => void;
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, gameState);

  if (
    gameState.rematch.type === "Asking" &&
    gameState.rematch.asker === currentPlayerType
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
    gameState.rematch.type === "Asking" &&
    gameState.rematch.asker !== currentPlayerType &&
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

  if (gameState.gameOver.type === "Draw") {
    return <p class="text-xl">Tie</p>;
  }

  if (gameState.gameOver.type === "resignation") {
    const { resigner } = gameState.gameOver;

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one";

    if (currentPlayerType === null) {
      return (
        <>
          <div class="flex w-full items-center justify-center">
            <PlayerIcon playerType={winner} />
            <MyAvatar
              alt=""
              src={ctx.profiles[gameState.players[winner]]?.avatarUrl}
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

  if (gameState.gameOver.type === "Winner") {
    const { winner } = gameState.gameOver;

    if (currentPlayerType === null) {
      return (
        <div class="flex w-full flex-col items-center justify-center gap-2">
          <div class="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} class="h-20 w-20" />
            <MyAvatar
              class="h-20 w-20"
              src={ctx.profiles[gameState.players[winner]]?.avatarUrl}
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
  gameState,
}: {
  ctx: SpaceClientCtx;
  gameState: StateGame | StateGameOver;
}) => {
  if (gameState.type === "game-over") {
    return (
      <p class="flex items-center justify-center text-secondary">Game Over</p>
    );
  }

  const turn = toTurn(gameState.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, gameState);

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
  gameState,
  playerType,
  ctx,
}: {
  gameState: StateGame | StateGameOver;
  playerType: PlayerType;
  ctx: SpaceClientCtx;
}) => {
  return (
    <div class="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-700 p-2">
      <PlayerIcon class="h-8 w-8" playerType={playerType} />
      <MyAvatar
        class="h-8 w-8"
        alt=""
        src={ctx.profiles[gameState.players[playerType]]?.avatarUrl}
      />
      <p class="text-secondary">
        {ctx.profiles[gameState.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};

export const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return null;
};
