import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../@SHARED/flow";
import { ModelGame, MsgGame } from "../builder.core";

const reducer = ({
  modelGame,
  msgGame,
  ctx,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}): ModelGame => {
  if (modelGame.t !== "puzzle-editor") {
    return modelGame;
  }

  switch (msgGame.t) {
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
