import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Drawer,
  IconEllipsisVertical,
  IconPenToSquare,
  IconPlay,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import {
  FlowGridUI,
  FlowGridUIEdit,
  FlowGridUIPlay,
} from "../../../@SHARED/flow";
import { ViewProfileCard } from "../../../@SHARED/ui";
import { ClientModule, toCurrentGrid } from "../builder.core";
import { PuzzleDeleteForeverClient } from "../puzzle-delete-forever/puzzle-delete-forever.client";
import { PuzzleEditNameClient } from "../puzzle-edit-name/puzzle-edit-name.client";
import { PuzzleSaveChangesClient } from "../puzzle-save-changes/puzzle-save-changes.client";

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
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => PuzzleEditNameClient.update({ ...input, model }),
    (model) => PuzzleDeleteForeverClient.update({ ...input, model }),
    (model) => PuzzleSaveChangesClient.update({ ...input, model })
  );
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
      <PuzzleSaveChangesClient.ViewUnsavedChangesDrawer {...input} />
    </>
  );
};

const ViewMode: ClientModule["View"] = (input) => {
  const { model, gameState, dispatch, ctx } = input;

  if (gameState.t !== "build") {
    return null;
  }

  const { exit, save } = PuzzleSaveChangesClient.viewActionButtons({
    ...input,
    model,
  });

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
              dispatch={(c) =>
                dispatch({ t: "game-event", c: { t: "grid-ui-edit", c } })
              }
            />
          </div>

          <ViewBottomButtonBar
            actions={[
              exit,
              save,
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
              save,
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
      <PuzzleEditNameClient.View {...input} />
      <PuzzleDeleteForeverClient.View {...input} />
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

export const PuzzleBuilder = {
  update,
  subscriptions,
  View,
};
