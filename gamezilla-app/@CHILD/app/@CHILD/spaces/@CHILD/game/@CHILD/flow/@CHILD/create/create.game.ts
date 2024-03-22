import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ModelSync, SyncReducer } from "./create.core"
import { ListTabsGame } from "./list-tabs/list-tabs.game"
import { PackGame } from "./pack/pack.game"
import { PuzzleBuilderGame } from "./puzzle/builder/puzzle-builder.game"
import { PuzzleCreateGame } from "./puzzle/create/puzzle-create.game"
import { PuzzleDeleteForeverGame } from "./puzzle/delete-forever/puzzle-delete-forever.game"
import { PuzzleEditGame } from "./puzzle/edit/puzzle-edit.game"
import { PuzzleListGame } from "./puzzle/list/puzzle-list.game"
import { PuzzleSaveChangesGame } from "./puzzle/save-changes/puzzle-save-changes.game"

export const initSync = (_input: { ctx: SpaceCtx }): ModelSync => {
  return {
    ...ListTabsGame.initSync,
    ...PackGame.initSync,
    opened: { t: "list" },
    packBuilder: null,
    puzzleBuilder: null,
  }
}

export const reducer: SyncReducer = ({ modelSync, msgSync, ctx }) => {
  return [
    PuzzleDeleteForeverGame.reducer,
    PuzzleBuilderGame.reducer,
    PuzzleCreateGame.reducer,
    PuzzleListGame.reducer,
    PuzzleEditGame.reducer,
    PuzzleSaveChangesGame.reducer,
    //
    PackGame.reducer,
    //
    ListTabsGame.reducer,
  ].reduce(
    (acc, reducer) => reducer({ ctx, msgSync, modelSync: acc }),
    modelSync,
  )
}
