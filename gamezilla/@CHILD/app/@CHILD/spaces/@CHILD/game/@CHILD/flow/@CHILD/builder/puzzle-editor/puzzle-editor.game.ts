import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { MsgGame, ModelGame } from "../builder.core";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../@SHARED/flow";
import { isErr } from "gamezilla/@SHARED/core";

export const reducer = ({
  modelGame,
  msgGame,
  ctx,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}): ModelGame => {
  if (modelGame.t === "list") {
    return modelGame;
  }

  switch (msgGame.t) {
    case "user-created-puzzle": {
      if (isErr(msgGame.created)) {
        return modelGame;
      }
      const puzzleNew = msgGame.created.value;
      return {
        tab: "puzzles",
        t: "build",
        mode: { t: "edit" },
        gridEdit: FlowGridUIEdit.init({ grid: puzzleNew.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: puzzleNew.puzzle.c }),
        puzzle: puzzleNew,
      };
    }

    case "user-opened-puzzle": {
      return {
        tab: "puzzles",
        t: "build",
        gridEdit: FlowGridUIEdit.init({ grid: msgGame.puzzle.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: msgGame.puzzle.puzzle.c }),
        mode: { t: "edit" },
        puzzle: msgGame.puzzle,
      };
    }

    case "grid-ui-play": {
      const currentGrid = FlowGridUIEdit.toCurrentGrid({
        model: modelGame.gridEdit,
      });

      const updated = FlowGridUIPlay.update({
        model: modelGame.gridPlay,
        msg: msgGame.c,
        grid: currentGrid,
      });

      return {
        ...modelGame,
        gridPlay: updated,
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: modelGame.gridEdit,
        msg: msgGame.c,
        grid: modelGame.puzzle.puzzle.c,
      });

      return {
        ...modelGame,
        gridEdit: updated.model,
      };
    }

    case "user-changed-to-edit-mode": {
      if (msgGame.userId !== ctx.space.hostId) {
        return modelGame;
      }

      return { ...modelGame, mode: { t: "edit" } };
    }

    case "user-changed-to-play-mode": {
      const initial = FlowGridUIPlay.init({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelGame.gridEdit,
        }),
      });
      return {
        ...modelGame,
        gridPlay: initial,
        mode: { t: "play" },
      };
    }

    case "user-exited-editor": {
      if (msgGame.userId !== ctx.space.hostId) {
        return modelGame;
      }

      return { ...modelGame, t: "list" };
    }
    default: {
      return modelGame;
    }
  }
};

export const PuzzleEditorGame = {
  reducer,
};
