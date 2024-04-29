import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ModelSync, SyncReducer } from "./create.core"
import { ListTabsGame } from "./list-tabs/list-tabs.sync"
import { PackGame } from "./pack/pack.sync"
import { PuzzleBuilderGame } from "./puzzle/builder/puzzle-builder.sync"
import { PuzzleCreateGame } from "./puzzle/create/puzzle-create.sync"
import { PuzzleDeleteForeverGame } from "./puzzle/delete-forever/puzzle-delete-forever.sync"
import { PuzzleEditGame } from "./puzzle/edit/puzzle-edit.sync"
import { PuzzleListGame } from "./puzzle/list/puzzle-list.sync"
import { PuzzleSaveChangesGame } from "./puzzle/save-changes/puzzle-save-changes.sync"

export const initSync = (_input: { ctx: SpaceCtx }): ModelSync => {
  return {
    ...ListTabsGame.initSync,
    ...PackGame.initSync,
    opened: { t: "list" },
    packBuilder: null,
    puzzleBuilder: null,
  }
}

export const reducer: SyncReducer = (input) => {
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
    (acc, reducer) => reducer({ ...input, modelSync: acc }),
    input.modelSync,
  )
}
