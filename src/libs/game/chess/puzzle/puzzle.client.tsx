import {
  ClientAppMsg,
  BottomBarButtonAction,
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
  ViewGameBox,
} from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/shared/core";
import {
  IconArrowCircle,
  IconArrowLeftOnRect,
  IconArrowRight,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconLightbulb,
  IconXMark,
  MyAvatar,
  cn,
} from "@gamezilla/shared/ui";
import { useMemo } from "react";
import * as Chess from "../chess/chess";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initShared,
  isNoMoreHints,
  toCorrectMove,
  toCurrentBoard,
  toNextEloRating,
  toPlayerColor,
} from "./puzzle.shared";

//
//
// Model
//
//

export type Model = ClientModel;

export const init = (_input: {
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: initShared,
    cmd: Cmd.None,
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
  ctx: SpaceCtx;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  const handled = handle({ msg, model, ctx });

  const modelNew = syncWithServer({
    client: model,
    server: handled.t === "err" ? model : handled.value,
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
  ctx: SpaceCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "clock-tick") {
    return { model: { ...model, serverNow: msg.now } };
  }

  const result = msg.result;

  if (result.t === "err") {
    if (msg.t === "db-got-puzzles") {
      return {
        model,
        msgs: [{ t: "toast-enqueued", text: `Failed to load puzzles.` }],
      };
    }

    if (msg.t === "db-got-initial-load") {
      return {
        model,
        msgs: [
          {
            t: "toast-enqueued",
            text: `Failed to load puzzles and profile.`,
          },
        ],
      };
    }

    return { model };
  }

  const merged = syncWithServer({
    client: model,
    server: result.value,
  });

  return { model: merged };
};

export const syncWithServer = ({
  client,
  server,
}: {
  client: Model;
  server: SharedModel;
}): Model => {
  return {
    ...client,
    ...server,
  };
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
  ctx: SpaceViewCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  const durationMs = useMemo(() => {
    if (model.t === "loading") {
      return null;
    }
    if (model.t === "started") {
      return Math.max(0, (model.serverNow ?? ctx.now) - model.startedAt);
    }
    return model.endedAt - model.startedAt;
  }, [ctx.now, model]);

  const isSpectating = ctx.currentUserId !== ctx.hostId;
  const nextEloRating = toNextEloRating(model);
  return (
    <ViewGameBox isSpectating={isSpectating}>
      <ViewStatusBar model={model} />

      {/* top heads up */}
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full items-center gap-2 px-3 py-2">
          <MyAvatar
            src={ctx.profiles[ctx.hostId]?.avatarUrl}
            className="h-10 w-10"
            alt=""
          />

          <div className="flex flex-1 flex-col justify-center">
            <p className="-mb-1/2 text-xs text-neutral-300">Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-semibold">
                {model.profile?.eloRating ?? "..."}
              </p>

              {model.t === "solved" && !model.hasLost && nextEloRating && (
                <div className="rounded-xl text-lg  font-semibold text-green-500">
                  +{nextEloRating - model.profile.eloRating}
                </div>
              )}
              {model.t !== "loading" && model.hasLost && nextEloRating && (
                <div className="rounded-xl  text-lg   font-semibold text-red-500">
                  {nextEloRating - model.profile.eloRating}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <TickingClock
              sec={durationMs ? Math.floor(durationMs / 1_000) : 0}
            />
            <p className="font-mono text-lg font-bold  text-neutral-300">
              {durationMs ? formatDuration(durationMs) : "-:--"}
            </p>
          </div>
        </div>

        <div className="re flex aspect-square w-full items-center justify-end bg-neutral-700">
          {model.t !== "loading" && (
            <Chess.View
              {...toChessboardPropsForHint(model)}
              key={model.puzzle.puzzleId}
              model={toCurrentBoard(model)}
              isDraggablePiece={({ piece }) => {
                if (model.t !== "started") {
                  return false;
                }
                const color = Chess.toColor(piece);
                return (
                  color === toPlayerColor(model.puzzle) &&
                  ctx.hostId === ctx.currentUserId
                );
              }}
              boardOrientation={toPlayerColor(model.puzzle)}
              onPieceDrop={(moveInput) => {
                $send({ t: "input-move", moveInput });
                return false;
              }}
            />
          )}
        </div>
        <div className="grid w-full grid-cols-2 px-2 py-1">
          <div className="flex items-center justify-start gap-1 text-xs ">
            <p className="text-neutral-300">Puzzle Rating</p>
            <p>{model.t === "loading" ? "..." : model.puzzle.rating}</p>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1 text-right text-xs">
            <p className="text-neutral-300">Moved</p>
            <p className="text-inherit">
              {model.t === "loading" ? "0" : model.moves?.length ?? "0"}
            </p>
            <p className="text-neutral-300">out of</p>
            <p className="text-inherit">
              {model.t === "loading" ? "0" : model.puzzle?.moves?.length ?? "0"}
            </p>
          </div>
        </div>
      </div>

      {!isSpectating && (
        <ViewBottomButtonBar
          actions={toBottomBarActions({ model, onClose, $send })}
        />
      )}
    </ViewGameBox>
  );
};

const toChessboardPropsForHint = (model: Model): Partial<Chess.BoardProps> => {
  const correctMove = toCorrectMove(model);

  if (!correctMove) {
    return {};
  }

  if (model.t !== "started") {
    return {};
  }

  if (model.hint === "from") {
    return {
      customSquareStyles: {
        [Chess.toLowercaseSquare(correctMove.from)]: {
          backgroundColor: "#91CEBD",
        },
      },
    };
  }

  if (model.hint === "from-and-to") {
    return {
      arrows: [correctMove],
    };
  }

  return {};
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
  const exit: BottomBarButtonAction = {
    icon: <IconArrowLeftOnRect />,
    label: "Exit",
    onClick: onClose,
  };

  const hint: BottomBarButtonAction = {
    icon: <IconLightbulb />,
    label: "Hint",
    disabled: isNoMoreHints(model),
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

  if (model.t === "loading") {
    return [exit, { ...hint, disabled: true }];
  }

  if (model.t === "started") {
    return [exit, hint];
  }

  if (model.t === "incorrect") {
    return [exit, retry, skip];
  }

  if (model.t === "solved") {
    return [exit, next];
  }

  if (model.t === "solved-with-hint") {
    return [exit, next];
  }

  return [];
};

const ViewStatusBar = ({ model }: { model: Model }) => {
  if (model.t === "loading") {
    return (
      <div className="flex w-full items-center justify-center p-2">
        <p className="text-xl">...</p>
      </div>
    );
  }

  if (model.t === "incorrect") {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-red-500 p-2 text-white">
        <IconXMark />
        <p className="text-xl">Incorrect</p>
      </div>
    );
  }

  if (model.t === "solved") {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-green-500 p-2 text-white">
        <IconCheckmarkCircle />
        <p className="text-xl">Correct</p>
      </div>
    );
  }

  if (model.t === "started") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center gap-2 p-2",
          toPlayerColor(model.puzzle) === "b"
            ? "bg-black text-white"
            : "bg-white text-black"
        )}>
        <div
          className={cn(
            "h-6 w-6 rounded-full border-2",
            toPlayerColor(model.puzzle) === "b"
              ? "border-[#ababab] bg-black"
              : "border-black bg-white"
          )}></div>
        <p className="text-xl text-inherit">
          {Chess.colorToString(toPlayerColor(model.puzzle))} to move
        </p>
      </div>
    );
  }

  if (model.t === "solved-with-hint") {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-neutral-600 p-2 text-white">
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
      className="h-5 w-5"
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
