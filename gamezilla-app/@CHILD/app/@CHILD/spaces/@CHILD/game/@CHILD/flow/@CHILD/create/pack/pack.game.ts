import { SyncReducer } from "../create.core"
import { PackBuilderGame } from "./builder"
import { PackCreateGame } from "./create"
import { PackListGame } from "./list/pack-list.game"

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
  reducer,
}
