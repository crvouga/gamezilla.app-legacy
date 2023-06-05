import { keyframes } from "@emotion/react";
import { UserId } from "@gamezilla/shared/app";
import {
  ChoiceChips,
  RoomCtx,
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
  Divider,
  Fade,
  FillBox,
  Icons,
  MyButton,
  Paper,
  Typography,
  useTheme,
} from "@gamezilla/shared/ui";
import {
  PlayerType,
  playerTypeToColor,
  toStatus,
  toTurn,
} from "../connect-four/connect-four";
import {
  PlayerIcon,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  ViewCoverArt,
  gameTheme,
} from "../connect-four/connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  GameModel,
  GameOverModel,
  ServerModel,
  SetupModel,
  ToClient,
  ToServer,
  allMoveTimeLimit,
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
      <>
        <FillBox>
          <PlayerSlotBar model={model} ctx={ctx} />

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

          <Box sx={{ flex: 1 }}></Box>

          <Box sx={{ display: "flex" }}>
            <ActionButton
              icon={<Icons.Flag />}
              label="Resign"
              onClick={() =>
                $send({ t: "clicked-resign", userId: ctx.currentUserId })
              }
            />
          </Box>
        </FillBox>

        <ConformationDialog
          headerIcon={<Icons.Flag sx={{ width: 52, height: 52 }} />}
          title="Resign from game?"
          onCancel={() => $send({ t: "close-modal" })}
          onClose={() => $send({ t: "close-modal" })}
          confirmTitle="Resign"
          onConfirm={() => $send({ t: "resign" })}
          open={model.openedModal === "ConfirmResign"}
        />
      </>
    );
  }

  return (
    <FillBox>
      <PlayerSlotBar model={model} ctx={ctx} />

      <Box sx={{ position: "relative" }}>
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
      </Box>

      <Box sx={{ flex: 1 }}></Box>

      <Box sx={{ display: "flex", padding: 2, gap: 2 }}>
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
      </Box>
    </FillBox>
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

export const _ViewSetup = ({
  model,
  $send,
  ctx,
  goBack,
}: {
  goBack: () => void;
  model: SetupModel;
  ctx: RoomViewCtx;
  $send: (msg: Msg) => void;
}) => {
  const startGameResult = handle({
    ctx,
    req: { t: "start-game" },
    model,
  });

  return (
    <FillBox>
      <ViewVersusHeader model={model} ctx={ctx} />

      <Typography
        color="text.secondary"
        sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}>
        Players
      </Typography>

      <ViewSetupPlayerSlot
        ctx={ctx}
        playerType={"PlayerOne"}
        userId={model.players.PlayerOne}
        $send={$send}
      />

      <ViewSetupPlayerSlot
        ctx={ctx}
        playerType={"PlayerTwo"}
        userId={model.players.PlayerTwo}
        $send={$send}
      />

      <Divider sx={{ paddingBottom: 2 }} />

      <div className="px-4">
        <p className="pb-2 text-neutral-300">Move Time Limit</p>
        <ChoiceChips
          choices={Object.values(allMoveTimeLimit)}
          onSelect={(moveTimeLimit) =>
            $send({ t: "input-move-time-limit", moveTimeLimit })
          }
          toKey={(moveTimeLimit) => String(moveTimeLimit)}
          renderChoice={(moveTimeLimit) => `${moveTimeLimit} sec`}
          selected={model.moveTimeLimit}
        />
      </div>

      <div className="flex-1"></div>

      <div className="flex gap-4 p-4">
        <MyButton className="flex-1" onClick={goBack}>
          Back
        </MyButton>
        <MyButton
          color="primary"
          className="flex-1"
          disabled={startGameResult.t === "err"}
          onClick={() => $send({ t: "start-game" })}>
          Start Game
        </MyButton>
      </div>
    </FillBox>
  );
};

const PlayerSlotBar = ({
  model,
  ctx,
}: {
  model: GameModel | GameOverModel;
  ctx: RoomViewCtx;
}) => {
  return (
    <Box sx={{ paddingTop: 2, paddingBottom: 1 }}>
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
    </Box>
  );
};

const flicker = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.66; }
  100% { opacity: 1; }
`;

const Feedback = ({
  ctx,
  model,
}: {
  ctx: RoomViewCtx;
  model: GameModel | GameOverModel;
}) => {
  if (model.type === "game-over") {
    return (
      <Typography
        color="text.secondary"
        align="center"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        Game Over
      </Typography>
    );
  }

  const turn = toTurn(model.columns);

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, model);

  if (currentUserPlayerType === turn) {
    if (model.moveCountDown <= 5) {
      return (
        <Typography
          align="center"
          sx={{ animation: `${flicker} 0.75s infinite ease` }}>
          Move in {model.moveCountDown}...
        </Typography>
      );
    }

    return (
      <Typography
        align="center"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: `${flicker} 0.75s infinite ease`,
        }}>
        <PlayerIcon playerType={turn} />
        Your Turn
      </Typography>
    );
  }

  return (
    <Typography
      color="text.secondary"
      align="center"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <PlayerIcon playerType={turn} />
      Turn
    </Typography>
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
  const size = { width: "1.5rem", height: "1.5rem" };
  const status = toStatus(model.columns);
  const uiTheme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        overflow: "hidden",
        p: 1,
        boxSizing: "content-box",
        borderBottom:
          status.type === "Playing" && status.turn === playerType
            ? `solid 3px ${gameTheme.primary.dark}`
            : `solid 3px ${uiTheme.palette.divider}`,
      }}>
      <PlayerIcon playerType={playerType} />
      <Avatar
        src={ctx.profiles[model.players[playerType]]?.avatarUrl}
        sx={{ ...size, marginRight: 1 }}
      />
      <Typography noWrap color="text.secondary">
        {ctx.profiles[model.players[playerType]]?.username ?? "..."}
      </Typography>
    </Paper>
  );
};

const ViewSetupPlayerSlot = ({
  $send,
  userId,
  ctx,
  playerType,
}: {
  $send: (msg: Msg) => void;
  playerType: PlayerType;
  userId: null | UserId;
  ctx: RoomViewCtx;
}) => {
  return (
    <Box
      sx={{
        paddingX: 2,
        display: "flex",
        paddingBottom: 2,
        alignItems: "center",
      }}>
      <PlayerIcon playerType={playerType} />
      {userId === "none" ? (
        <Button
          fullWidth
          variant="contained"
          onClick={() => $send({ t: "start-playing", playerType })}>
          Play as {playerTypeToColor[playerType]}
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            flex: 1,
          }}>
          <Avatar
            src={userId ? ctx.profiles[userId]?.avatarUrl : ""}
            sx={{ marginRight: 1 }}
          />
          <Typography noWrap sx={{ flex: 1 }}>
            {userId ? ctx.profiles[userId]?.username ?? "..." : "..."}
          </Typography>
          {userId === ctx.currentUserId && (
            <Button onClick={() => $send({ t: "stop-playing" })}>
              Stop Playing
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

const ViewVersusHeader = ({
  model,
  ctx,
}: {
  model: SetupModel;
  ctx: RoomViewCtx;
}) => {
  return (
    <Box
      sx={{
        paddingY: 6,
        paddingX: 2,
        background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}>
      <Box sx={{ width: 72, overflow: "hidden", textAlign: "center" }}>
        <Avatar
          sx={{ marginX: "auto" }}
          src={
            !model.players.PlayerOne
              ? ""
              : ctx.profiles[model.players.PlayerOne]?.avatarUrl
          }>
          <Icons.QuestionMark />
        </Avatar>
        <Typography color="#fff" align="center" noWrap>
          {!model.players.PlayerOne
            ? "?"
            : ctx.profiles[model.players.PlayerOne]?.username ?? "..."}
        </Typography>
      </Box>
      <PlayerOneIcon />
      <Typography color="#fff" sx={{ fontSize: 32 }}>
        vs
      </Typography>
      <PlayerTwoIcon />
      <Box sx={{ width: 72, overflow: "hidden", textAlign: "center" }}>
        <Avatar
          sx={{ marginX: "auto" }}
          src={
            !model.players.PlayerTwo
              ? ""
              : ctx.profiles[model.players.PlayerTwo]?.avatarUrl
          }>
          <Icons.QuestionMark />
        </Avatar>
        <Typography color="#fff" align="center" noWrap>
          {!model.players.PlayerTwo
            ? "?"
            : ctx.profiles[model.players.PlayerTwo]?.username ?? "..."}
        </Typography>
      </Box>
    </Box>
  );
};
