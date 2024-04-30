import { GameCore } from "gamezilla-app/app/spaces/@shared/architecture/game-core"
import { SpaceCtx } from "gamezilla-app/app/spaces/@shared/space"
import { FlowVariant, FlowVariantUIPlay } from "../@shared/flow"
import { samples } from "../@shared/flow/flow-variant/flow-grid/flow-grid-samples"
import { p } from "gamezilla-app/@shared/core/parser"

//
//
//
//
//
//

export type ModelClient = {
  play: FlowVariantUIPlay.Model
  flow: FlowVariant.Model
}

export const ModelServer = p.obj({})
export type ModelServer = p.Infer<typeof ModelServer>

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
      c: FlowVariantUIPlay.Msg
    }

export type MsgServer = { t: null }

export type MsgToServer = { t: null }

export type MsgToClient = { t: null }

export type MsgSync = {
  t: "grid"
  c: FlowVariantUIPlay.Msg
}

export type ModelSync = {
  play: FlowVariantUIPlay.Model
  flow: FlowVariant.Model
}

type Module = GameCore<{
  Ctx: SpaceCtx
  ModelSync: ModelSync
  MsgSync: MsgSync
}>

export const initSync: Module["initSync"] = () => {
  const flow = samples["8x8"][1]
  return {
    play: FlowVariantUIPlay.init({
      flow,
    }),
    flow,
  }
}

export const reducer: Module["reducer"] = ({ modelSync, msgSync }) => {
  switch (msgSync.t) {
    case "grid": {
      const gridPlayNew = FlowVariantUIPlay.update({
        msg: msgSync.c,
        model: modelSync.play,
        flow: modelSync.flow,
      })
      return { play: gridPlayNew, flow: modelSync.flow }
    }
  }
}
