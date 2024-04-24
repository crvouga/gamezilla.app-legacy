import { SyncReducer } from "../create.core"
import { PackBuilderGame } from "./builder/pack-builder.sync"
import { PackCreateGame } from "./create/pack-create.sync"
import { PackListGame } from "./list/pack-list.sync"
import { ModelSync } from "./pack.core"
import { RemovePuzzleGame } from "./remove-puzzle/remove-puzzle.sync"

const initSync: ModelSync = {
  ...RemovePuzzleGame.initSync,
}

const reducer: SyncReducer = (input) => {
  return [
    PackCreateGame.reducer,
    PackBuilderGame.reducer,
    PackListGame.reducer,
  ].reduce(
    (modelSync, reducer) => reducer({ ...input, modelSync }),
    input.modelSync,
  )
}

export const PackGame = {
  initSync,
  reducer,
}
