import {
  AppMsg,
  BottomBarButtonAction,
  RoomCtx,
  RoomViewCtx,
  ViewBottomButtonBar,
  ViewGameBox,
} from "@gamezilla/shared/client";
import { Cmd, eq } from "@gamezilla/shared/core";
import {
  IconArrowCircle,
  IconArrowLeftOnRect,
  IconArrowRight,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconGear,
  IconLightbulb,
  IconXMark,
  MyAvatar,
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
  PuzzleState,
  Req,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initQuery,
  initShared,
  toCorrectMove,
  toPlayerColor,
  toState,
} from "./puzzle.shared";

//
//
// Model
//
//

export type Model = ClientModel;

const toDraftQuery = (model: Model): PuzzleQuery => {
  return model.draftQuery ?? model.puzzleProfile?.puzzleQuery ?? initQuery;
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
      return handleRequest({
        msg: { t: "input-query", query: toDraftQuery(model) },
        model: { ...model, openedModal: null },
        sendToServer,
        ctx,
      });
    }

    default: {
      return handleRequest({ msg, model, sendToServer, ctx });
    }
  }
};

const handleRequest = ({
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
  msgs?: AppMsg[];
} => {
  if (msg.t === "clock-tick") {
    return { model: { ...model, backendNow: msg.now } };
  }

  const result = msg.result;

  if (result.t === "err") {
    return { model };
  }

  const merged = syncWithServer({
    clientModel: model,
    serverModel: result.value,
  });

  return { model: merged };
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
  const status = useMemo(() => toState(model), [model]);

  const durationMs = useMemo(() => {
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
      <ViewStatusBar state={status} />

      {/* top heads up */}
      <div className="flex-1 w-full flex items-center justify-center flex-col">
        <div className="flex items-center gap-2 w-full px-3 py-2">
          <MyAvatar
            src={ctx.profiles[ctx.hostId]?.avatarUrl}
            className="w-9 h-9"
            alt=""
          />

          <div className="flex flex-col justify-center flex-1">
            <p className="text-xs text-neutral-300 -mb-1/2">Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold">
                {model.puzzleProfile?.eloRating}
              </p>
              {status.type === "solved" && (
                <div className="text-green-500 rounded-xl  text-lg font-semibold">
                  +
                  {status.nextEloRating - (model.puzzleProfile?.eloRating ?? 0)}
                </div>
              )}
              {status.type === "incorrect" && (
                <div className="text-red-500  rounded-xl   text-lg font-semibold">
                  {status.nextEloRating - (model.puzzleProfile?.eloRating ?? 0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <TickingClock
              sec={durationMs ? Math.floor(durationMs / 1_000) : 0}
            />
            <p className="font-mono font-bold text-lg  text-neutral-300">
              {durationMs ? formatDuration(durationMs) : "-:--"}
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
        <div className="w-full grid grid-cols-2 px-2 py-1">
          <div className="flex items-center text-xs justify-start gap-1 ">
            <p className="text-neutral-300">Puzzle Rating</p>
            <p>{status.type === "loading" ? "" : status.puzzle.rating}</p>
          </div>

          {status.type !== "loading" && (
            <div className="flex-1 flex items-center justify-end text-right text-xs gap-1">
              <p className="text-neutral-300">Moved</p>
              <p className="text-inherit">
                {status.type === "solving" ? status.playerMoves.length : "-"}
              </p>
              <p className="text-neutral-300">out of</p>
              <p className="text-inherit">
                {status.puzzle.correctMoves.length}
              </p>
            </div>
          )}
        </div>
      </div>

      {!isSpectating && (
        <>
          <ViewBottomButtonBar
            actions={toBottomBarActions({ model, onClose, $send })}
          />
          <MyDrawer
            open={model.openedModal === "settings"}
            onClose={() => $send({ t: "closed-modal" })}>
            <div className="p-4 flex flex-col gap-4 pb-8">
              <div className="flex items-center w-full justify-between">
                <p className="text-3xl">Settings</p>
                <div className="flex items-center gap-2">
                  <MyButton
                    size="sm"
                    variant="outlined"
                    disabled={eq(
                      model.puzzleProfile?.puzzleQuery,
                      model.draftQuery
                    )}
                    onClick={() => {
                      if (model.puzzleProfile) {
                        $send({
                          t: "input-draft-query",
                          query: model.puzzleProfile.puzzleQuery,
                        });
                      }
                    }}>
                    Cancel
                  </MyButton>
                  <MyButton
                    size="sm"
                    variant="contained"
                    onClick={() => $send({ t: "clicked-save" })}
                    disabled={eq(
                      model.puzzleProfile?.puzzleQuery,
                      model.draftQuery
                    )}>
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
                        if (model.puzzleProfile) {
                          $send({
                            t: "input-draft-query",
                            query: {
                              ...model.puzzleProfile.puzzleQuery,
                              ratingRange: [
                                parsed,
                                model.puzzleProfile.puzzleQuery.ratingRange[1],
                              ],
                            },
                          });
                        }
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
                        if (model.puzzleProfile) {
                          $send({
                            t: "input-draft-query",
                            query: {
                              ...model.puzzleProfile.puzzleQuery,
                              ratingRange: [
                                model.puzzleProfile.puzzleQuery.ratingRange[0],
                                parsed,
                              ],
                            },
                          });
                        }
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

  if (!correctMove) {
    return {};
  }

  const state = toState(model);

  if (state.type !== "solving") {
    return {};
  }

  return state.hint === "from"
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: "skyblue",
        },
      }
    : state.hint === "from-and-to"
    ? {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: "skyblue",
        },
        [Chess.toLowercaseSquare(correctMove.to)]: {
          backgroundColor: "skyblue",
        },
      }
    : state.hint === "none"
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
  const status = toState(model);

  const exit: BottomBarButtonAction = {
    icon: <IconArrowLeftOnRect />,
    label: "Exit",
    onClick: onClose,
  };

  const settings: BottomBarButtonAction = {
    icon: <IconGear />,
    label: "Settings",
    onClick: () => {
      $send({ t: "opened-modal", modal: "settings" });
    },
  };

  const hint: BottomBarButtonAction = {
    icon: <IconLightbulb />,
    label: "Hint",
    onClick: () => $send({ t: "show-hint" }),
  };

  const retry: BottomBarButtonAction = {
    icon: <IconArrowRotateLeft />,
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
    icon: <IconArrowCircle />,
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

  if (status.type === "solved-with-hint") {
    return [exit, settings, next];
  }

  const check: never = status;

  return check;
};

const ViewStatusBar = ({ state }: { state: PuzzleState }) => {
  if (state.type === "loading") {
    return (
      <div className="w-full flex items-center justify-center p-2">
        <p className="text-xl">...</p>
      </div>
    );
  }

  if (state.type === "incorrect") {
    return (
      <div className="w-full flex items-center justify-center gap-2 p-2 bg-red-500 text-white">
        <IconXMark />
        <p className="text-xl">Incorrect</p>
      </div>
    );
  }

  if (state.type === "solved") {
    return (
      <div className="w-full flex items-center justify-center gap-2 p-2 bg-green-500 text-white">
        <IconCheckmarkCircle />
        <p className="text-xl">Correct</p>
      </div>
    );
  }

  if (state.type === "solving") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 p-2 w-full",
          toPlayerColor(state.puzzle) === "b"
            ? "bg-black text-white"
            : "bg-white text-black"
        )}>
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2",
            toPlayerColor(state.puzzle) === "b"
              ? "bg-black border-[#ababab]"
              : "bg-white border-black"
          )}></div>
        <p className="text-xl text-inherit">
          {Chess.colorToString(toPlayerColor(state.puzzle))} to move
        </p>
      </div>
    );
  }

  if (state.type === "solved-with-hint") {
    return (
      <div className="w-full flex items-center justify-center gap-2 p-2 bg-yellow-500 text-white">
        <IconCheckmarkCircle />
        <p className="text-xl">Solved with hint</p>
      </div>
    );
  }

  return <div></div>;
};

const TickingClock = (input: { sec: number }) => {
  return (
    <svg
      className="w-5 h-5"
      viewBox="-1 -1 2 2"
      stroke="currentColor"
      strokeWidth="0.2">
      <circle cx="0" cy="0" r="0.9"></circle>

      {/* up */}
      <line
        stroke={input.sec % 4 === 0 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="0"
        y2="-1"></line>

      {/* right */}
      <line
        stroke={input.sec % 4 === 1 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="1"
        y2="0"></line>

      {/* down */}
      <line
        stroke={input.sec % 4 === 2 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="0"
        y2="1"></line>

      {/* left */}
      <line
        stroke={input.sec % 4 === 3 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="-1"
        y2="0"></line>
    </svg>
  );
};
