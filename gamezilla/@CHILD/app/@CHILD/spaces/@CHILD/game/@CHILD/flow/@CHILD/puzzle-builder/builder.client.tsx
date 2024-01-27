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
import { ClientModule, toCurrentGrid } from "./puzzle-builder.core";

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
    (model) => showToastOnSave({ ...input, model })
  );
};

const showToastOnSave: ClientModule["update"] = (input) => {
  const { model, fromServer, ctx } = input;
  if (
    fromServer?.t === "put-puzzle" &&
    fromServer.source === "user-saved-puzzle" &&
    ctx.currentUserId === ctx.space.hostId
  ) {
    return {
      model,
      cmd: [showToast("Saved changes"), playSound(APP_SOUND.tap)],
    };
  }
  return { model };
};

const updateSound: ClientModule["update"] = (input) => {
  const { model, msg, gameState } = input;

  if (!msg) {
    return { model };
  }

  if (gameState.t !== "build") {
    return { model };
  }

  switch (msg.t) {
    case "user-exited-builder":
    case "user-changed-to-edit-mode": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navBackwardMin)],
      };
    }

    case "user-changed-to-play-mode": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navForwardMin)],
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: gameState.gridEdit,
        msg: msg.c,
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
  const { gameState, dispatch, ctx } = input;

  if (gameState.t !== "build") return null;

  const isSpectating = ctx.currentUserId !== ctx.space.hostId;

  if (isSpectating) {
    return <ViewSpectating {...input} />;
  }

  const exit = {
    label: "Exit",
    icon: <IconArrowLeftOnRect className="h-6 w-6" />,
    onClick: () =>
      dispatch({
        t: "user-exited-builder",
        userId: ctx.currentUserId,
      }),
  };

  const save = {
    label: "Save",
    icon: <IconFloppyDisk className="h-6 w-6" />,
    onClick: () =>
      dispatch({
        t: "user-saved-changes",
        userId: ctx.currentUserId,
        puzzle: {
          ...gameState.puzzle,
          puzzle: {
            t: "grid",
            c: FlowGridUIEdit.toGrid(gameState.gridEdit),
          },
        },
      }),
  };

  const more = {
    label: "More",
    icon: <IconEllipsisVertical className="h-6 w-6" />,
    onClick: () => {},
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
              dispatch={(c) => dispatch({ t: "grid-ui-edit", c })}
            />
          </div>

          {!isSpectating && (
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
                      t: "user-changed-to-play-mode",
                      userId: ctx.currentUserId,
                    }),
                },
                save,
                more,
              ]}
            />
          )}
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
              dispatch={(c) => dispatch({ t: "grid-ui-play", c })}
            />
          </div>

          {!isSpectating && (
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
                      t: "user-changed-to-edit-mode",
                      userId: ctx.currentUserId,
                    }),
                },
                save,
                more,
              ]}
            />
          )}
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

export const Builder: Pick<ClientModule, "update" | "subscriptions" | "View"> =
  {
    update,
    subscriptions,
    View,
  };
