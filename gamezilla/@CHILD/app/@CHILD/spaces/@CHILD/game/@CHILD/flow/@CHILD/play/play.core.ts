import { GameCore } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-core"
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { FlowGrid, FlowGridUIPlay } from "../../@SHARED/flow"
import { samples } from "../../@SHARED/flow/flow-grid/flow-grid-samples"

//
//
//
//
//
//

export type ModelClient = {
  gridPlay: FlowGridUIPlay.Model
  grid: FlowGrid.Model
}

export type ModelServer = {}

//
//
//
//
//
//

export type MsgClient =
  | {
      t: "msgSync"
      c: MsgSync
    }
  | {
      t: "grid"
      c: FlowGridUIPlay.Msg
    }

export type MsgServer = { t: null }

export type MsgToServer = { t: null }

export type MsgToClient = { t: null }

export type MsgSync = {
  t: "grid"
  c: FlowGridUIPlay.Msg
}

export type ModelSync = {
  gridPlay: FlowGridUIPlay.Model
  grid: FlowGrid.Model
}

type Module = GameCore<{
  Ctx: SpaceCtx
  ModelSync: ModelSync
  MsgSync: MsgSync
}>

export const initSync: Module["initSync"] = () => {
  const grid = samples["8x8"][1]
  return {
    gridPlay: FlowGridUIPlay.init({ grid }),
    grid,
  }
}

export const reducer: Module["reducer"] = ({ modelGame, msgSync }) => {
  switch (msgSync.t) {
    case "grid": {
      const gridPlayNew = FlowGridUIPlay.update({
        msg: msgSync.c,
        model: modelGame.gridPlay,
        grid: modelGame.grid,
      })
      return { gridPlay: gridPlayNew, grid: modelGame.grid }
    }
  }
}
