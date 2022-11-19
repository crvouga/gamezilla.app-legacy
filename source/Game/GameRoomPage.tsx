import { Ctx } from "./Game.Shared"
import * as GameRoom from "./GameRoom.Frontend"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg = ["GameRoom", GameRoom.Msg]

type OutAction = GameRoom.Action

export const update = (msg: Msg, model: Model): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "GameRoom": {
      return [model, [["GameRoom", ["Msg", msg[1]]]]]
    }
  }
}

//
//
//
// View
//
//
//

export const View = ({ gameRoom, ctx, dispatch }: { gameRoom: GameRoom.Model; ctx: Ctx; model: Model; dispatch: (msg: Msg) => void }) => {
  return (
    <GameRoom.View ctx={ctx} model={gameRoom} dispatch={(msg) => dispatch(["GameRoom", msg])} />
  )
}
