import { SyncReducer } from "../create.core"
import { PackBuilderGame } from "./builder/pack-builder.game"
import { PackCreateGame } from "./create/pack-create.game"
import { PackListGame } from "./list/pack-list.game"
import { ModelSync } from "./pack.core"
import { RemovePuzzleGame } from "./remove-puzzle/remove-puzzle.game"

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
