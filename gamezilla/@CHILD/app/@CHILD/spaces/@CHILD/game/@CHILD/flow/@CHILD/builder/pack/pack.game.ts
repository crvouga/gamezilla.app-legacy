import { SyncReducer } from "../builder.core"
import { PackBuilderGame } from "./builder"
import { PackCreateGame } from "./create"
import { PackListGame } from "./list/pack-list.game"

const reducer: SyncReducer = (input) => {
  return [
    PackCreateGame.reducer,
    PackBuilderGame.reducer,
    PackListGame.reducer,
  ].reduce(
    (modelGame, reducer) => reducer({ ...input, modelGame }),
    input.modelGame,
  )
}

export const PackGame = {
  reducer,
}
