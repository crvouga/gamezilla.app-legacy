import {
  RoomCtx,
  RoomMsg,
  RoomViewCtx,
  ViewCtx,
  VsUserSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/shared/core";
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  CircularProgress,
  ConformationDialog,
  Fade,
  Icons,
  MyAvatar,
  Typography,
} from "@gamezilla/shared/ui";
import { PlayerType, toTurn } from "../connect-four/connect-four";
import {
  PlayerIcon,
  ViewColumns,
  ViewCoverArt,
} from "../connect-four/connect-four-ui";
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
} from "./vs-user.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

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

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  msg,
  model,
  ctx,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
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
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
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

export const updateFromRoom = (input: {
  model: Model;
  msg: RoomMsg;
}): {
  model: Model;
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

export const subscriptions = (_model: Model): Sub<Msg> => {
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
  $send,
  onQuit,
}: {
  model: Model;
  ctx: RoomViewCtx;
  $send: (msg: Msg) => void;
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
          $send({ t: "start-game" });
        }}
        onQuit={onQuit}
        playerOne={{
          label: "Red",
          onStartPlaying: () => {
            $send({ t: "start-playing", playerType: "PlayerOne" });
          },
          onStopPlaying: () => {
            $send({ t: "stop-playing" });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="PlayerOne" {...props} />;
          },
          userId: model.players.PlayerOne,
        }}
        playerTwo={{
          label: "Yellow",
          onStartPlaying: () => {
            $send({ t: "start-playing", playerType: "PlayerTwo" });
          },
          onStopPlaying: () => {
            $send({ t: "stop-playing" });
          },
          renderIcon: (props) => {
            return <PlayerIcon playerType="PlayerTwo" {...props} />;
          },
          userId: model.players.PlayerTwo,
        }}
      />
    );
  }

  if (model.type === "game") {
    const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Box
          sx={{
            paddingX: 1,
            mb: 1,
            gap: 1,
            display: "flex",
            width: "100%",
            overflow: "hidden",
          }}>
          <PlayerSlot playerType="PlayerOne" model={model} ctx={ctx} />
          <PlayerSlot playerType="PlayerTwo" model={model} ctx={ctx} />
        </Box>
        <Feedback ctx={ctx} model={model} />

        <div className="flex-1 flex flex-col items-center justify-center">
          <ViewColumns
            columns={model.columns}
            onClick={(columnIndex) =>
              $send({ t: "input-move", userId: ctx.currentUserId, columnIndex })
            }
            onHover={(columnIndex) =>
              $send({ t: "hovered-over-columns", columnIndex })
            }
            disabled={toTurn(model.columns) !== currentUserPlayerType}
            ghost={
              currentUserPlayerType !== "none" && model.ghostIndex !== "none"
                ? {
                    playerType: currentUserPlayerType,
                    columnIndex: model.ghostIndex,
                  }
                : undefined
            }
          />
        </div>

        <Box sx={{ display: "flex" }}>
          <ActionButton
            icon={<Icons.Flag />}
            label="Resign"
            onClick={() =>
              $send({ t: "clicked-resign", userId: ctx.currentUserId })
            }
          />
        </Box>

        <ConformationDialog
          headerIcon={<Icons.Flag sx={{ width: 52, height: 52 }} />}
          title="Resign from game?"
          onCancel={() => $send({ t: "close-modal" })}
          onClose={() => $send({ t: "close-modal" })}
          confirmTitle="Resign"
          onConfirm={() => $send({ t: "resign" })}
          open={model.openedModal === "ConfirmResign"}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <Box
        sx={{
          paddingX: 1,
          mb: 1,
          gap: 1,
          display: "flex",
          width: "100%",
          overflow: "hidden",
        }}>
        <PlayerSlot playerType="PlayerOne" model={model} ctx={ctx} />
        <PlayerSlot playerType="PlayerTwo" model={model} ctx={ctx} />
      </Box>
      <Feedback ctx={ctx} model={model} />

      <div className="flex items-center justify-center flex-1 w-full">
        <ViewColumns columns={model.columns} disabled />

        {model.type === "game-over" && (
          <Fade in>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#fff",
              }}>
              <ViewGameOverMessage $send={$send} ctx={ctx} model={model} />
            </Box>
          </Fade>
        )}
      </div>

      <div className="w-full p-4 flex items-center gap-3">
        <Button
          variant="outlined"
          fullWidth
          onClick={() => $send({ t: "new-game" })}>
          Back
        </Button>

        <Button
          variant="contained"
          fullWidth
          disabled={model.rematch.type === "Asking"}
          onClick={() => $send({ t: "rematch-request" })}>
          Rematch
        </Button>
      </div>
    </div>
  );
};

const ViewGameOverMessage = ({
  ctx,
  model,
  $send,
}: {
  model: GameOverModel;
  ctx: ViewCtx;
  $send: (msg: Msg) => void;
}) => {
  const size = { width: 84, height: 84 };

  const currentPlayerType = toPlayerType(ctx.currentUserId, model);

  if (
    model.rematch.type === "Asking" &&
    model.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <Typography align="center" sx={{ fontSize: "2rem", marginBottom: 4 }}>
          Waiting for response
        </Typography>
        <CircularProgress sx={{ marginBottom: 4 }} />
        <Button
          variant="contained"
          onClick={() => $send({ t: "rematch-cancel" })}>
          Cancel
        </Button>
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
        <Typography align="center" sx={{ fontSize: "3rem", marginBottom: 4 }}>
          Rematch?
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="inherit"
            sx={{ color: "#000" }}
            startIcon={<Icons.Cancel />}
            onClick={() =>
              $send({
                t: "rematch-respond",
                response: "Decline",
              })
            }>
            Decline
          </Button>
          <Button
            variant="contained"
            startIcon={<Icons.Done />}
            onClick={() => $send({ t: "rematch-respond", response: "Accept" })}>
            Accept
          </Button>
        </Box>
      </>
    );
  }

  if (model.gameOver.type === "Draw") {
    return <Typography sx={{ fontSize: "3rem" }}>Tie</Typography>;
  }

  if (model.gameOver.type === "resignation") {
    const { resigner } = model.gameOver;

    const winner: PlayerType =
      resigner === "PlayerOne" ? "PlayerTwo" : "PlayerOne";

    if (currentPlayerType === "none") {
      return (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}>
            <PlayerIcon playerType={winner} />
            <Avatar
              sx={{ ...size }}
              src={ctx.profiles[model.players[winner]]?.avatarUrl}
            />
          </Box>
          <Typography sx={{ fontSize: "2.5rem" }}>Winner</Typography>
        </>
      );
    }

    return (
      <>
        <Typography sx={{ fontSize: "3rem" }}>
          {currentPlayerType === winner ? "You Won" : "You Lost"}
        </Typography>
        <Typography>by resignation</Typography>
      </>
    );
  }

  if (model.gameOver.type === "Winner") {
    const { winner } = model.gameOver;

    if (currentPlayerType === "none") {
      return (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}>
            <PlayerIcon playerType={winner} />
            <Avatar
              sx={{ ...size }}
              src={ctx.profiles[model.players[winner]]?.avatarUrl}
            />
          </Box>
          <Typography sx={{ fontSize: 50 }}>Winner</Typography>
        </>
      );
    }

    return (
      <Typography sx={{ fontSize: 64 }}>
        {currentPlayerType === winner ? "You Won" : "You Lost"}
      </Typography>
    );
  }

  return null;
};

const Feedback = ({
  ctx,
  model,
}: {
  ctx: RoomViewCtx;
  model: GameModel | GameOverModel;
}) => {
  if (model.type === "game-over") {
    return (
      <p className="text-secondary flex items-center justify-center">
        Game Over
      </p>
    );
  }

  const turn = toTurn(model.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

  if (currentUserPlayerType !== turn) {
    return (
      <p className="text-secondary text-center flex items-center justify-center gap-2">
        <PlayerIcon className="w-6 h-6" playerType={turn} />
        Turn
      </p>
    );
  }

  if (model.moveCountDown <= 5) {
    return (
      <p className="text-center flex items-center justify-center gap-2">
        Move in {model.moveCountDown}...
      </p>
    );
  }

  return (
    <p className="text-center flex items-center justify-center gap-2">
      <PlayerIcon className="w-6 h-6" playerType={turn} />
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
  ctx: RoomViewCtx;
}) => {
  return (
    <div className="flex items-center gap-2 flex-1 p-2 rounded border border-neutral-600 overflow-hidden">
      <PlayerIcon className="w-8 h-8" playerType={playerType} />
      <MyAvatar
        className="w-8 h-8"
        alt=""
        src={ctx.profiles[model.players[playerType]]?.avatarUrl}
      />
      <p className="text-secondary">
        {ctx.profiles[model.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  );
};

export const resToStr = ({
  ctx,
  res,
}: {
  ctx: RoomCtx;
  res: Res;
}): string | null => {
  if (res.t === "start-playing" && res.result.t === "ok") {
    // @ts-ignore
    const username = ctx.profiles[res.userId]?.username ?? "...";
    return `${username} started playing`;
  }

  return null;
};
