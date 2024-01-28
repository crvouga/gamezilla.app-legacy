import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  APP_SOUND,
  playSound,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Drawer,
  IconArrowLeftOnRect,
  IconEllipsisVertical,
  IconFloppyDisk,
  IconPenToSquare,
  IconPlay,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { FlowGridUI, FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow";
import { ViewProfileCard } from "../../@SHARED/ui";
import { DeleteForeverClient } from "./delete-forever/delete-forever.client";
import { EditNameClient } from "./edit-name/edit-name.client";
import { ClientModule, GameEvent, toCurrentGrid } from "./puzzle-builder.core";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";

//
//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateSound({ ...input, model }),
    (model) => updateSaveChanges({ ...input, model }),
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => updateExitBuilder({ ...input, model }),
    (model) => EditNameClient.update({ ...input, model }),
    (model) => DeleteForeverClient.update({ ...input, model })
  );
};

const updateExitBuilder: ClientModule["update"] = (input) => {
  const { msg, model, gameState } = input;

  if (gameState.t !== "build") {
    return { model };
  }

  switch (msg?.t) {
    case "builder/user-clicked-exit-button": {
      const gameEvent: GameEvent = {
        t: "user-exited-builder",
        userId: input.ctx.currentUserId,
      };
      return { model, gameEvent: [withId(gameEvent)] };
    }
    default: {
      break;
    }
  }

  return { model };
};

const updateSaveChanges: ClientModule["update"] = (input) => {
  const { model, gameEvent, ctx, fromServer } = input;

  if (gameEvent?.t === "user-saved-changes") {
    return {
      model: { ...model, isSavingChanges: true },
      cmd: [playSound(APP_SOUND.tap)],
    };
  }

  if (
    fromServer?.t === "put-puzzle" &&
    fromServer.reason === "user-saved-puzzle" &&
    ctx.currentUserId === ctx.space.hostId
  ) {
    return {
      model: { ...model, isSavingChanges: false },
      cmd: [showToast("Saved changes"), playSound(APP_SOUND.refreshFeed)],
    };
  }
  return { model };
};

const updateSound: ClientModule["update"] = (input) => {
  const { model, gameState, gameEvent } = input;

  if (!gameEvent) {
    return { model };
  }

  if (gameState.t !== "build") {
    return { model };
  }

  switch (gameEvent.t) {
    case "user-exited-builder":
    case "user-changed-to-edit-mode": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navBackwardMin)],
      };
    }

    case "user-created-new-puzzle":
    case "user-changed-to-play-mode": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navForwardMin)],
      };
    }

    case "grid-ui-edit": {
      if (gameState.mode.t !== "edit") {
        return { model };
      }
      const updated = FlowGridUIEdit.update({
        model: gameState.gridEdit,
        msg: gameEvent.c,
        grid: gameState.puzzle.puzzle.c,
      });

      if (!updated.cmd) {
        return { model };
      }

      switch (updated.cmd.t) {
        case "play-sound": {
          return { model, cmd: [playSound(updated.cmd.sourceSrc)] };
        }
      }
    }

    default: {
      return { model };
    }
  }
};

//
//
//
//
//
//

const subscriptions: ClientModule["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
//
//
//
//

const View: ClientModule["View"] = (input) => {
  const { gameState, ctx } = input;

  if (gameState.t !== "build") return null;

  const isSpectating = ctx.currentUserId !== ctx.space.hostId;

  if (isSpectating) {
    return <ViewSpectating {...input} />;
  }

  return (
    <>
      <ViewMode {...input} />
      <ViewMoreDrawer {...input} />
    </>
  );
};

const ViewMode: ClientModule["View"] = (input) => {
  const { model, gameState, dispatch, ctx } = input;

  if (gameState.t !== "build") return null;

  const exit = {
    label: "Exit",
    icon: <IconArrowLeftOnRect className="h-6 w-6" />,
    onClick: () => dispatch({ t: "builder/user-clicked-exit-button" }),
  };

  const save = {
    label: "Save",
    icon: <IconFloppyDisk className="h-6 w-6" />,
    loading: model.isSavingChanges,
    onClick: () =>
      dispatch({
        t: "game-event",
        c: {
          t: "user-saved-changes",
          userId: ctx.currentUserId,
          puzzle: {
            ...gameState.puzzle,
            puzzle: {
              t: "grid",
              c: FlowGridUIEdit.toCurrentGrid({
                grid: gameState.puzzle.puzzle.c,
                model: gameState.gridEdit,
              }),
            },
          },
        },
      }),
  };

  const more = {
    label: "More",
    icon: <IconEllipsisVertical className="h-6 w-6" />,
    onClick: () => dispatch({ t: "builder/user-clicked-more-button" }),
  };

  switch (gameState.mode.t) {
    case "edit": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPenToSquare {...props} />}
            label="Edit Mode"
            color="yellow"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
            <FlowGridUIEdit.View
              model={gameState.gridEdit}
              grid={gameState.puzzle.puzzle.c}
              dispatch={(c) =>
                dispatch({ t: "game-event", c: { t: "grid-ui-edit", c } })
              }
            />
          </div>

          <ViewBottomButtonBar
            actions={[
              exit,
              {
                label: "Play Mode",
                classNames: {
                  button: "text-blue-500",
                },
                icon: <IconPlay className="h-6 w-6" />,
                onClick: () =>
                  dispatch({
                    t: "game-event",
                    c: {
                      t: "user-changed-to-play-mode",
                      userId: ctx.currentUserId,
                    },
                  }),
              },
              save,
              more,
            ]}
          />
        </div>
      );
    }

    case "play": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPlay {...props} />}
            label="Play Mode"
            color="blue"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
            <FlowGridUIPlay.View
              model={gameState.gridPlay}
              grid={toCurrentGrid(gameState)}
              dispatch={(c) =>
                dispatch({ t: "game-event", c: { t: "grid-ui-play", c } })
              }
            />
          </div>

          <ViewBottomButtonBar
            actions={[
              exit,
              {
                label: "Edit Mode",
                classNames: {
                  button: "text-amber-500",
                },
                icon: <IconPenToSquare className="h-6 w-6" />,
                onClick: () =>
                  dispatch({
                    t: "game-event",
                    c: {
                      t: "user-changed-to-edit-mode",
                      userId: ctx.currentUserId,
                    },
                  }),
              },
              save,
              more,
            ]}
          />
        </div>
      );
    }
  }
};

const ViewSpectating: ClientModule["View"] = ({ gameState, ctx }) => {
  if (gameState.t !== "build") return null;

  return (
    <GameLayout isSpectating>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
        <ViewProfileCard
          profile={ctx.profiles[ctx.space.hostId]}
          subtitle="Editor"
        />
        <FlowGridUI.View disabled model={toCurrentGrid(gameState)} />
      </div>
    </GameLayout>
  );
};

const ViewModeBar = (props: {
  icon: (props: { className: string }) => VDom;
  label: string;
  color: "blue" | "yellow";
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 p-1 text-xs font-bold text-white",
        props.color === "blue" ? "bg-blue-500" : "bg-amber-500"
      )}
    >
      {props.icon({ className: "h-4 w-4" })}
      {props.label}
    </div>
  );
};

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
};

//
//
//
//
//
//
//

const updateMoreDrawer: ClientModule["update"] = (input) => {
  const { msg, model } = input;
  switch (msg?.t) {
    case "builder/user-closed-more-drawer": {
      return { model: { ...model, opened: null } };
    }
    case "builder/user-clicked-more-button": {
      return { model: { ...model, opened: "more" } };
    }
    default: {
      return { model };
    }
  }
};

export const ViewMoreDrawer: ClientModule["View"] = (input) => {
  const { dispatch } = input;
  return (
    <Drawer
      id="more-drawer"
      open={input.model.opened === "more"}
      onClose={() => dispatch({ t: "builder/user-closed-more-drawer" })}
      position="bottom"
    >
      <EditNameClient.View {...input} />
      <DeleteForeverClient.View {...input} />
      <div className="w-full pb-2"></div>
    </Drawer>
  );
};

//
//
//
//
//
//

export const Builder: Pick<ClientModule, "update" | "subscriptions" | "View"> =
  {
    update,
    subscriptions,
    View,
  };
