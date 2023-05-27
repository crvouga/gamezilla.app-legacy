import {
  BottomBarButtonAction,
  RoomCtx,
  RoomViewCtx,
  ViewBottomButtonBar,
  ViewGameBox,
} from "@gamezilla/shared/client";
import { Cmd, Posix, Sub, eq } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRight,
  IconCheckmarkCircle,
  IconClock,
  IconGear,
  IconLightbulb,
  IconXMark,
  MyButton,
  MyDrawer,
  MyTextField,
  cn,
} from "@gamezilla/shared/ui";
import { useMemo } from "react";
import * as Chess from "../chess/chess";
import {
  ClientModel,
  ClientMsg,
  PuzzleQuery,
  Req,
  SharedModel,
  Status,
  ToClient,
  ToServer,
  handle,
  initShared,
  toCorrectMove,
  toPlayerColor,
  toStatus,
} from "./puzzle.shared";

//
//
// Model
//
//

export type Model = ClientModel;

const toDraftQuery = (model: Model): PuzzleQuery => {
  return model.draftQuery ?? model.query;
};

export const init = ({
  sendToServer,
}: {
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: sendToServer({ t: "init" }),
  };
};

//
//
// Update
//
//

type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
  ctx: RoomCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case "animate": {
      return { model };
    }

    case "opened-modal": {
      return { model: { ...model, openedModal: msg.modal } };
    }

    case "closed-modal": {
      return { model: { ...model, openedModal: null } };
    }

    case "input-draft-query": {
      return {
        model: { ...model, draftQuery: msg.query },
      };
    }

    case "clicked-save": {
      return updateRequest({
        msg: { t: "input-query", query: toDraftQuery(model) },
        model: { ...model, openedModal: null },
        sendToServer,
        ctx,
      });
    }

    default: {
      return updateRequest({ msg, model, sendToServer, ctx });
    }
  }
};

const updateRequest = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  msg: Req;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
  ctx: RoomCtx;
}) => {
  const handled = handle({ msg, model, ctx });
  const modelNew = syncWithServer({
    clientModel: model,
    serverModel: handled.t === "err" ? model : handled.value,
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
  ctx: RoomCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "clock-tick": {
      return { model: { ...model, backendNow: msg.now } };
    }

    default: {
      const result = msg.result;

      if (result.t === "err") {
        return { model };
      }

      const merged = syncWithServer({
        clientModel: model,
        serverModel: result.value,
      });

      return { model: merged };
    }
  }
};

export const syncWithServer = ({
  clientModel,
  serverModel,
}: {
  clientModel: Model;
  serverModel: SharedModel;
}): Model => {
  return { ...clientModel, ...serverModel };
};

//
//
// Subscriptions
//
//

export const subscriptions = (_args: {
  model: Model;
  now: Posix;
  intervalId: string;
}): Sub<Msg> => {
  return Sub.None;
};

//
//
// View
//
//

export const View = ({
  model,
  onClose,
  ctx,
  $send,
}: {
  ctx: RoomViewCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  const status = useMemo(() => toStatus(model), [model]);

  const duration = useMemo(() => {
    return !model.startedAt
      ? null
      : status.type === "loading"
      ? null
      : status.type === "solving"
      ? Math.max(0, (model.backendNow ?? ctx.now) - model.startedAt)
      : status.endedAt - model.startedAt;
  }, [ctx.now, status, model]);

  const isSpectating = ctx.currentUserId !== ctx.hostId;

  return (
    <ViewGameBox isSpectating={isSpectating}>
      <ViewStatusBar status={status} />

      <div className="flex-1 w-full flex items-center justify-center flex-col">
        <div className="font-sm grid grid-cols-3 px-4 py-2 w-full">
          <div className="flex items-center justify-start gap-2">
            <p className="text-neutral-300">Rating</p>
            <p>{status.type === "loading" ? "" : status.puzzle.rating}</p>
          </div>

          <div>
            <p className="text-neutral-300 flex-1 text-center">
              {status.type === "loading"
                ? ""
                : `${model.moves.length}  /  ${status.puzzle.correctMoves.length}`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <IconClock />
            <p className="font-mono font-bold text-lg  text-neutral-300">
              {duration ? formatDuration(duration) : "-:--"}
            </p>
          </div>
        </div>

        <div className="w-full re flex items-center justify-end aspect-square bg-neutral-700">
          {status.type !== "loading" && (
            <Chess.View
              key={status.puzzle.puzzleId}
              model={status.board}
              isDraggablePiece={({ piece }) => {
                if (status.type === "solved") {
                  return false;
                }
                const color = Chess.toColor(piece);
                return (
                  color === toPlayerColor(status.puzzle) &&
                  ctx.hostId === ctx.currentUserId
                );
              }}
              customSquareStyles={toCustomSquareStyle(model)}
              boardOrientation={toPlayerColor(status.puzzle)}
              onPieceDrop={(moveInput) => {
                $send({ t: "input-move", moveInput });
                return false;
              }}
            />
          )}
        </div>
      </div>

      {!isSpectating && (
        <>
          <ViewBottomButtonBar
            actions={toBottomBarActions({ model, onClose, $send })}
          />
          <MyDrawer
            open={model.openedModal === "tune"}
            onClose={() => $send({ t: "closed-modal" })}>
            <div className="p-4 flex flex-col gap-4 pb-8">
              <div className="flex items-center w-full justify-between">
                <p className="text-3xl">Settings</p>
                <div className="flex items-center gap-2">
                  <MyButton
                    size="sm"
                    variant="outlined"
                    disabled={eq(model.query, model.draftQuery)}
                    onClick={() =>
                      $send({ t: "input-draft-query", query: model.query })
                    }>
                    Cancel
                  </MyButton>
                  <MyButton
                    size="sm"
                    variant="contained"
                    onClick={() => $send({ t: "clicked-save" })}
                    disabled={eq(model.query, model.draftQuery)}>
                    Save
                  </MyButton>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">Rating Range</p>

                <div className="px-2 w-full flex items-center gap-4">
                  <div className="flex-1">
                    <MyTextField
                      id="min-rating"
                      onChange={(valueNew) => {
                        const parsed = parseInt(valueNew);
                        if (isNaN(parsed)) {
                          return;
                        }
                        $send({
                          t: "input-draft-query",
                          query: {
                            ...model.query,
                            ratingRange: [parsed, model.query.ratingRange[1]],
                          },
                        });
                      }}
                      value={toDraftQuery(model).ratingRange[0]}
                      label="Min"
                      type="number"></MyTextField>
                  </div>
                  <div className="flex-1">
                    <MyTextField
                      id="max-rating"
                      onChange={(valueNew) => {
                        const parsed = parseInt(valueNew);
                        if (isNaN(parsed)) {
                          return;
                        }
                        $send({
                          t: "input-draft-query",
                          query: {
                            ...model.query,
                            ratingRange: [model.query.ratingRange[0], parsed],
                          },
                        });
                      }}
                      value={toDraftQuery(model).ratingRange[1]}
                      label="Max"
                      type="number"></MyTextField>
                  </div>
                </div>
              </div>
            </div>
          </MyDrawer>
        </>
      )}
    </ViewGameBox>
  );
};

const toCustomSquareStyle = (model: Model): Chess.CustomSquareStyles => {
  const correctMove = toCorrectMove(model);
  return !correctMove
    ? {}
    : model.hint === "from"
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: "skyblue",
        },
      }
    : model.hint === "from-and-to"
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: "skyblue",
        },
        [Chess.toLowercaseSquare(correctMove.to)]: {
          backgroundColor: "skyblue",
        },
      }
    : model.hint === "none"
    ? {}
    : {};
};

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.floor((duration % 60_000) / 1_000);
  return `${minutes.toString().padStart(1, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const toBottomBarActions = ({
  model,
  onClose,
  $send,
}: {
  model: Model;
  onClose: () => void;
  $send: (m: Msg) => void;
}): BottomBarButtonAction[] => {
  const status = toStatus(model);

  const exit: BottomBarButtonAction = {
    icon: <IconArrowLeftOnRect />,
    label: "Exit",
    onClick: onClose,
  };

  const settings: BottomBarButtonAction = {
    icon: <IconGear />,
    label: "Settings",
    onClick: () => {
      $send({ t: "opened-modal", modal: "tune" });
    },
  };

  const hint: BottomBarButtonAction = {
    icon: <IconLightbulb />,
    label: "Hint",
    onClick: () => $send({ t: "show-hint" }),
  };

  const retry: BottomBarButtonAction = {
    icon: <IconLightbulb />,
    label: "Retry",
    onClick: () => $send({ t: "retry" }),
    color: "danger",
  };

  const skip: BottomBarButtonAction = {
    icon: <IconArrowRight />,
    label: "Skip",
    onClick: () => $send({ t: "skip" }),
  };

  const next: BottomBarButtonAction = {
    icon: <IconArrowRight />,
    label: "Next",
    color: "success",
    onClick: () => $send({ t: "next" }),
  };

  if (status.type === "loading") {
    return [exit, settings, { ...hint, disabled: true }];
  }

  if (status.type === "solving") {
    return [exit, settings, hint];
  }

  if (status.type === "incorrect") {
    return [exit, settings, retry, skip];
  }

  if (status.type === "solved") {
    return [exit, settings, next];
  }

  const check: never = status;

  return check;
};

const ViewStatusBar = ({ status }: { status: Status }) => {
  if (status.type === "loading") {
    return (
      <div className="w-full flex items-center justify-center p-2">
        <p className="text-xl">...</p>
      </div>
    );
  }

  if (status.type === "incorrect") {
    return (
      <div className="w-full flex items-center justify-center gap-2 p-2 bg-red-500 text-white">
        <IconXMark />
        <p className="text-xl">Incorrect</p>
      </div>
    );
  }

  if (status.type === "solved") {
    return (
      <div className="w-full flex items-center justify-center gap-2 p-2 bg-green-500 text-white">
        <IconCheckmarkCircle />
        <p className="text-xl">Correct</p>
      </div>
    );
  }

  if (status.type === "solving") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 p-2 w-full",
          toPlayerColor(status.puzzle) === "b"
            ? "bg-black text-white"
            : "bg-white text-black"
        )}>
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2",
            toPlayerColor(status.puzzle) === "b"
              ? "bg-black border-[#ababab]"
              : "bg-white border-black"
          )}></div>
        <p className="text-xl text-inherit">
          {Chess.colorToString(toPlayerColor(status.puzzle))} to move
        </p>
      </div>
    );
  }

  const check: never = status;
  return check;
};
