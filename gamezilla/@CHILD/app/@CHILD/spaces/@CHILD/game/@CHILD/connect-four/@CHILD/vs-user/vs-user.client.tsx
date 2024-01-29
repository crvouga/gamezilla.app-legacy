import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { VsUserSetupScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-user";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd, ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  ConfirmationDialog,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark,
  Avatar,
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
  InEvent: SpaceClientEvent;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvent: null;
}>;

//
//
//
// Model
//
//
//

const init: Module["init"] = {
  ghostIndex: null,
  openedModal: null,
};

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates({ model: input.model }, (model) =>
    updateFromMsg(model)(input)
  );
};

const updateFromMsg =
  (model: ClientModel): Module["update"] =>
  (input) => {
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

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// View
//
//
//

const View: Module["View"] = ({ ctx, model, modelGameState, emit }) => {
  if (!model) {
    return null;
  }

  switch (modelGameState.type) {
    case "setup": {
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
            emit({ t: "user-started-game", userId: ctx.currentUserId });
          }}
          onQuit={ctx.onQuit}
          playerOne={{
            label: "Red",
            onStartPlaying: () => {
              emit({
                t: "user-started-playing",
                playerType: "player-one",
                userId: ctx.currentUserId,
              });
            },
            onStopPlaying: () => {
              emit({
                t: "user-stopped-playing",
                userId: ctx.currentUserId,
              });
            },
            renderIcon: (props) => {
              return <PlayerIcon playerType="player-one" {...props} />;
            },
            userId: modelGameState.players["player-one"],
          }}
          playerTwo={{
            label: "Yellow",
            onStartPlaying: () => {
              emit({
                t: "user-started-playing",
                userId: ctx.currentUserId,
                playerType: "player-two",
              });
            },
            onStopPlaying: () => {
              emit({
                t: "user-stopped-playing",
                userId: ctx.currentUserId,
              });
            },
            renderIcon: (props) => {
              return <PlayerIcon playerType="player-two" {...props} />;
            },
            userId: modelGameState.players["player-two"],
          }}
        />
      );
    }

    case "game":
    case "game-over": {
      const currentUserPlayerType = toPlayerType(
        ctx.currentUserId,
        modelGameState
      );

      return (
        <GameLayout isSpectating={currentUserPlayerType === null}>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center gap-2 px-2">
              <PlayerSlot
                playerType="player-one"
                modelGameState={modelGameState}
                ctx={ctx}
              />
              <PlayerSlot
                playerType="player-two"
                modelGameState={modelGameState}
                ctx={ctx}
              />
            </div>

            <Feedback ctx={ctx} modelGameState={modelGameState} />

            <div className="relative w-full">
              <ViewColumns
                columns={modelGameState.columns}
                gameId={modelGameState.gameId}
                onDropDisc={(columnIndex) =>
                  emit({
                    t: "user-dropped-disc",
                    userId: ctx.currentUserId,
                    columnIndex,
                  })
                }
                onHover={(columnIndex) =>
                  emit({ t: "hovered-over-columns", columnIndex })
                }
                disabled={
                  toTurn(modelGameState.columns) !== currentUserPlayerType ||
                  modelGameState.type === "game-over"
                }
              />
              {modelGameState.type === "game-over" && (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
                  <ViewGameOverMessage
                    emit={emit}
                    ctx={ctx}
                    modelGameState={modelGameState}
                  />
                </div>
              )}
            </div>
          </div>

          <ViewBottomButtonBar
            actions={[
              ...(modelGameState.type === "game"
                ? [
                    {
                      icon: <IconFlag className="h-6 w-6" />,
                      label: "Resign",
                      onClick: () => {
                        emit({
                          t: "clicked-resign",
                          userId: ctx.currentUserId,
                        });
                      },
                    },
                  ]
                : []),
              ...(modelGameState.type === "game-over" &&
              ctx.currentUserId === ctx.space.hostId
                ? [
                    {
                      icon: <IconArrowLeftOnRect className="h-6 w-6" />,
                      label: "Exit",
                      onClick: () => {
                        emit({
                          t: "user-stopped-game",
                          userId: ctx.currentUserId,
                        });
                      },
                    },
                    {
                      icon: <IconArrowRotateLeft className="h-6 w-6" />,
                      label: "Rematch",
                      onClick: () => {
                        emit({
                          t: "user-requested-rematch",
                          userId: ctx.currentUserId,
                        });
                      },
                    },
                  ]
                : []),
            ]}
          />

          <ConfirmationDialog
            headerIcon={<IconFlag className="h-10 w-10" />}
            title="Resign from game?"
            onCancel={() => emit({ t: "close-modal" })}
            onClose={() => emit({ t: "close-modal" })}
            confirmTitle="Resign"
            onConfirm={() =>
              emit({ t: "user-resigned", userId: ctx.currentUserId })
            }
            open={model.openedModal === "confirm-resign"}
          />
        </GameLayout>
      );
    }
  }
};

const ViewGameOverMessage = ({
  ctx,
  modelGameState,
  emit,
}: {
  modelGameState: StateGameOver;
  ctx: ClientCtx;
  emit: (msg: GameEvent) => void;
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, modelGameState);

  if (
    modelGameState.rematch.type === "Asking" &&
    modelGameState.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p className="mb-4 text-center text-xl">Waiting for response</p>
        <IconSpinner className="mb-4 h-8 w-8 animate-spin" />
        <Button
          variant="contained"
          onClick={() =>
            emit({
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
    modelGameState.rematch.type === "Asking" &&
    modelGameState.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <p>Rematch?</p>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() =>
              emit({
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
              emit({
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

  if (modelGameState.gameOver.type === "Draw") {
    return <p className="text-xl">Tie</p>;
  }

  if (modelGameState.gameOver.type === "resignation") {
    const { resigner } = modelGameState.gameOver;

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one";

    if (currentPlayerType === null) {
      return (
        <>
          <div className="flex w-full items-center justify-center">
            <PlayerIcon playerType={winner} />
            <Avatar
              alt=""
              src={ctx.profiles[modelGameState.players[winner]]?.avatarUrl}
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

  if (modelGameState.gameOver.type === "Winner") {
    const { winner } = modelGameState.gameOver;

    if (currentPlayerType === null) {
      return (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} className="h-20 w-20" />
            <Avatar
              className="h-20 w-20"
              src={ctx.profiles[modelGameState.players[winner]]?.avatarUrl}
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
  modelGameState,
}: {
  ctx: SpaceClientCtx;
  modelGameState: StateGame | StateGameOver;
}) => {
  if (modelGameState.type === "game-over") {
    return (
      <p className="flex items-center justify-center text-secondary">
        Game Over
      </p>
    );
  }

  const turn = toTurn(modelGameState.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, modelGameState);

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
  modelGameState,
  playerType,
  ctx,
}: {
  modelGameState: StateGame | StateGameOver;
  playerType: PlayerType;
  ctx: SpaceClientCtx;
}) => {
  return (
    <div className="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-600 p-2">
      <PlayerIcon className="h-8 w-8" playerType={playerType} />
      <Avatar
        className="h-8 w-8"
        alt=""
        src={ctx.profiles[modelGameState.players[playerType]]?.avatarUrl}
      />
      <p className="text-secondary">
        {ctx.profiles[modelGameState.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};

const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return null;
};

export const VsUser: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
