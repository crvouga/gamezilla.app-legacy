import {
  RoomCtx,
  RoomMsg,
  RoomViewCtx,
  ViewBottomButtonBar,
  ViewCtx,
  ViewGameBox,
  VsUserSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/shared/core";
import {
  ConformationDialog,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark,
  MyAvatar,
  MyButton,
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
      <ViewGameBox isSpectating={currentUserPlayerType === null}>
        <div className="flex-1 flex flex-col items-center justify-center w-full gap-2">
          <div className="w-full flex items-center px-2 gap-2">
            <PlayerSlot playerType="PlayerOne" model={model} ctx={ctx} />
            <PlayerSlot playerType="PlayerTwo" model={model} ctx={ctx} />
          </div>

          <Feedback ctx={ctx} model={model} />

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
              currentUserPlayerType !== null && model.ghostIndex !== "none"
                ? {
                    playerType: currentUserPlayerType,
                    columnIndex: model.ghostIndex,
                  }
                : undefined
            }
          />
        </div>

        <ViewBottomButtonBar
          actions={[
            {
              icon: <IconFlag />,
              label: "Resign",
              onClick: () => {
                $send({ t: "clicked-resign", userId: ctx.currentUserId });
              },
            },
          ]}
        />

        <ConformationDialog
          headerIcon={<IconFlag className="w-10 h-10" />}
          title="Resign from game?"
          onCancel={() => $send({ t: "close-modal" })}
          onClose={() => $send({ t: "close-modal" })}
          confirmTitle="Resign"
          onConfirm={() => $send({ t: "resign" })}
          open={model.openedModal === "ConfirmResign"}
        />
      </ViewGameBox>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-2">
        <div className="flex items-center justify-center w-full px-2 gap-2">
          <PlayerSlot playerType="PlayerOne" model={model} ctx={ctx} />
          <PlayerSlot playerType="PlayerTwo" model={model} ctx={ctx} />
        </div>

        <Feedback ctx={ctx} model={model} />

        <div className="w-full relative">
          <ViewColumns columns={model.columns} disabled />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <ViewGameOverMessage $send={$send} ctx={ctx} model={model} />
          </div>
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect />,
            label: "Exit",
            onClick: () => $send({ t: "new-game" }),
          },
          {
            icon: <IconArrowRotateLeft />,
            label: "Rematch",
            onClick: () => $send({ t: "rematch-request" }),
          },
        ]}
      />
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
  const currentPlayerType = toPlayerType(ctx.currentUserId, model);

  if (
    model.rematch.type === "Asking" &&
    model.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p className="text-xl mb-4 text-center">Waiting for response</p>
        <IconSpinner className="animate-spin mb-4 w-8 h-8" />
        <MyButton
          variant="contained"
          onClick={() => $send({ t: "rematch-cancel" })}>
          Cancel
        </MyButton>
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
        <div className="flex items-center justify-center gap-4 w-full">
          <MyButton
            variant="contained"
            onClick={() =>
              $send({
                t: "rematch-respond",
                response: "Decline",
              })
            }>
            <IconXMark />
            Decline
          </MyButton>

          <MyButton
            variant="contained"
            onClick={() => $send({ t: "rematch-respond", response: "Accept" })}>
            <IconCheckmarkCircle />
            Accept
          </MyButton>
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
      resigner === "PlayerOne" ? "PlayerTwo" : "PlayerOne";

    if (currentPlayerType === null) {
      return (
        <>
          <div className="flex items-center w-full justify-center">
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
        <p className="text-xl">
          {currentPlayerType === winner ? "You Won" : "You Lost"}
        </p>
        <p>by resignation</p>
      </>
    );
  }

  if (model.gameOver.type === "Winner") {
    const { winner } = model.gameOver;

    if (currentPlayerType === null) {
      return (
        <>
          <div className="w-full flex items-center justify-center gap-2">
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
        <PlayerIcon className="w-4 h-4" playerType={turn} />
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
      <PlayerIcon className="w-4 h-4" playerType={turn} />
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

export const resToStr = ({ res }: { ctx: RoomCtx; res: Res }) => {
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
