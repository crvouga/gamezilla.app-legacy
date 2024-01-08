import {
  BottomBarButtonAction,
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Avatar,
  IconArrowCircle,
  IconArrowLeftOnRect,
  IconArrowRight,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconLightbulb,
  IconXMark,
  Spinner,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, andThen, isErr, p } from "gamezilla/@SHARED/core";
import { Chess } from "../../@SHARED/chess";
import { Chessboard } from "../../@SHARED/chess-ui/chessboard";
import { CHESS_SOUND } from "../../@SHARED/chess/chess-sounds";
import {
  ClientModel,
  ClientMsg,
  CoreModel,
  ToClient,
  ToServer,
  initCore,
  isIncorrect,
  isNoMoreHints,
  isSolved,
  toCurrentBoard,
  toNextEloRating,
  toPlayerColor,
  updateCore,
} from "./puzzle.core";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";

//
//
// Model
//
//

export const init = (): {
  model: ClientModel;
} => {
  return {
    model: initCore,
  };
};

//
//
// Update
//
//

export const update = (input: {
  msg: ClientMsg;
  model: ClientModel;
  ctx: SpaceClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return GameClientModule.chainUpdates(
    input,
    (model) => updateMain({ ...input, model }),
    (model) => {
      if (input.msg.t === "input-move") {
        if (input.msg.didCapture) {
          return { model, cmd: [playSound(CHESS_SOUND.captureSound)] };
        }
        return { model, cmd: [playSound(CHESS_SOUND.moveSound)] };
      }
      return { model };
    },
    (model) => {
      if (!isIncorrect(input.model) && isIncorrect(model)) {
        return { model, cmd: [playSound(APP_SOUND.alertErrorMd)] };
      }
      if (!isSolved(input.model) && isSolved(model)) {
        return { model, cmd: [playSound(APP_SOUND.celebration)] };
      }
      return { model };
    }
  );
};

export const updateMain = ({
  msg,
  model,
  ctx,
}: {
  msg: ClientMsg;
  model: ClientModel;
  ctx: SpaceClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const updated = updateCore({ msg, model, ctx });

  const modelNew = mergeWithServer({
    client: model,
    server: updated.t === "err" ? model : updated.value,
  });

  return {
    model: modelNew,
    cmd: [sendToServer(msg)],
    eff: Eff.None,
  };
};

export const updateFromServer = (input: {
  ctx: SpaceClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return p(updateFromServerMain(input), andThen(watch));
};

export const updateFromServerMain: typeof updateFromServer = ({
  msg,
  model,
}: {
  ctx: SpaceClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "clock-tick": {
      return { model: { ...model, serverNow: msg.now } };
    }

    default: {
      const result = msg.result;

      if (isErr(result)) {
        if (msg.t === "db-got-puzzles") {
          return {
            model,
            cmd: [showToast("Failed to load puzzles")],
          };
        }

        if (msg.t === "db-got-initial-load") {
          return {
            model,
            cmd: [showToast(`Failed to load puzzles and profile.`, "error")],
          };
        }

        return { model };
      }

      const merged = mergeWithServer({
        client: model,
        server: result.value,
      });

      return { model: merged };
    }
  }
};

export const mergeWithServer = ({
  client,
  server,
}: {
  client?: ClientModel;
  server: CoreModel;
}): ClientModel => {
  return {
    ...client,
    ...server,
  };
};

function watch(model: ClientModel): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} {
  return { model };
}

//
//
// View
//
//

const toDurationMs = (ctx: SpaceClientCtx, model: ClientModel) => {
  if (model.t === "loading") {
    return null;
  }
  if (model.t === "started") {
    return Math.max(0, (model.serverNow ?? ctx.now) - model.startedAt);
  }
  return model.endedAt - model.startedAt;
};

export const View = ({
  model,
  onClose,
  ctx,
  dispatch,
}: {
  ctx: SpaceClientCtx;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  onClose: () => void;
}) => {
  const durationMs = toDurationMs(ctx, model);
  const isSpectating = ctx.currentUserId !== ctx.space.hostId;
  const nextEloRating = toNextEloRating(model);
  return (
    <GameLayout isSpectating={isSpectating}>
      <ViewStatusBar model={model} />

      {/* top heads up */}
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full items-center gap-2 px-3 py-2">
          <Avatar
            src={ctx.profiles[ctx.space.hostId]?.avatarUrl}
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

        <div className="relative flex aspect-square w-full items-center justify-end overflow-hidden bg-neutral-700">
          <Chessboard
            id="puzzle-chess-board"
            orientation={
              model.t === "loading" ? undefined : toPlayerColor(model.puzzle)
            }
            model={model.t === "loading" ? undefined : toCurrentBoard(model)}
            isPieceDraggable={(input) => {
              if (model.t !== "started") {
                return false;
              }
              const color = Chess.toColor(input.piece);

              return (
                color === toPlayerColor(model.puzzle) &&
                ctx.space.hostId === ctx.currentUserId
              );
            }}
            onPieceDrop={(input) => {
              const chessModel = toCurrentBoard(model);

              const moved = Chess.move(
                {
                  from: input.source,
                  to: input.target,
                  promotion: "q",
                },
                chessModel
              );

              if (moved.t === "ok") {
                dispatch({
                  t: "input-move",
                  didCapture: moved.value.didCapture,
                  moveInput: {
                    from: input.source,
                    to: input.target,
                    promotion: "q",
                  },
                });
              }
              return moved.t === "ok";
            }}
          />
          {model.t === "loading" && (
            <div className="absolute left-0 top-0 z-20 grid h-full w-full place-items-center bg-black/50">
              <Spinner />
            </div>
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

      {!isSpectating ? (
        <ViewBottomButtonBar
          actions={toBottomBarActions({ model, onClose, dispatch })}
        />
      ) : (
        <></>
      )}
    </GameLayout>
  );
};

// export const toChessboardPropsForHint = (model: Model): Partial<BoardProps> => {
//   const correctMove = toCorrectMove(model);

//   if (!correctMove) {
//     return {};
//   }

//   if (model.t !== "started") {
//     return {};
//   }

//   if (model.hint === "from") {
//     return {
//       customSquareStyles: {
//         [Chess.toLowercaseSquare(correctMove.from)]: {
//           backgroundColor: "#91CEBD",
//         },
//       },
//     };
//   }

//   if (model.hint === "from-and-to") {
//     return {
//       arrows: [correctMove],
//     };
//   }

//   return {};
// };

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
  dispatch,
}: {
  model: ClientModel;
  onClose: () => void;
  dispatch: (m: ClientMsg) => void;
}): BottomBarButtonAction[] => {
  const exit: BottomBarButtonAction = {
    icon: <IconArrowLeftOnRect className="h-6 w-6" />,
    label: "Exit",
    onClick: onClose,
  };

  const hint: BottomBarButtonAction = {
    icon: <IconLightbulb className="h-6 w-6" />,
    label: "Hint",
    disabled: isNoMoreHints(model),
    onClick: () => dispatch({ t: "show-hint" }),
  };

  const retry: BottomBarButtonAction = {
    icon: <IconArrowRotateLeft className="h-6 w-6" />,
    label: "Retry",
    onClick: () => dispatch({ t: "retry" }),
    color: "danger",
  };

  const skip: BottomBarButtonAction = {
    icon: <IconArrowRight className="h-6 w-6" />,
    label: "Skip",
    onClick: () => dispatch({ t: "skip" }),
  };

  const next: BottomBarButtonAction = {
    icon: <IconArrowCircle className="h-6 w-6" />,
    label: "Next",
    color: "success",
    onClick: () => dispatch({ t: "next" }),
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

const ViewStatusBar = ({ model }: { model: ClientModel }) => {
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
        <IconXMark className="h-6 w-6" />
        <p className="text-xl">Incorrect</p>
      </div>
    );
  }

  if (model.t === "solved") {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-green-500 p-2 text-white">
        <IconCheckmarkCircle className="h-6 w-6" />
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
        )}
      >
        <div
          className={cn(
            "h-6 w-6 rounded-full border-2",
            toPlayerColor(model.puzzle) === "b"
              ? "border-[#ababab] bg-black"
              : "border-black bg-white"
          )}
        ></div>
        <p className="text-xl text-inherit">
          {Chess.colorToString(toPlayerColor(model.puzzle))} to move
        </p>
      </div>
    );
  }

  if (model.t === "solved-with-hint") {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-neutral-600 p-2 text-white">
        <IconCheckmarkCircle className="h-6 w-6" />
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
      strokeWidth="0.2"
    >
      <circle cx="0" cy="0" r="0.9"></circle>

      {/* up */}
      <line
        stroke={input.sec % 4 === 0 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="0"
        y2="-1"
      ></line>

      {/* right */}
      <line
        stroke={input.sec % 4 === 1 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      ></line>

      {/* down */}
      <line
        stroke={input.sec % 4 === 2 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      ></line>

      {/* left */}
      <line
        stroke={input.sec % 4 === 3 ? undefined : "transparent"}
        x1="0"
        y1="0"
        x2="-1"
        y2="0"
      ></line>
    </svg>
  );
};
