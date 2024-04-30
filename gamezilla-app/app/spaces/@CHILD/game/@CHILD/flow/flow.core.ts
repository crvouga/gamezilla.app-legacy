import { UserId } from "gamezilla-app/app/@SHARED/data"
import { GameMainMenu } from "../../@SHARED/game"
import * as Create from "./@CHILD/create/create.core"
import * as Play from "./@CHILD/play/play.core"
import { FlowPuzzle } from "./@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "./@SHARED/flow-puzzle/flow-puzzle-id"
import { p } from "gamezilla-app/@SHARED/core/parser"

//
//
// Model
//
//

export type BaseModelClient = {
  puzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
}

export type VariantModelClient =
  | { t: "none" }
  | { t: "create"; c: Create.ModelClient }
  | { t: "play"; c: Play.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

export const ModelServer = p.or(
  p.obj({
    t: p.l("none"),
  }),
  p.obj({
    t: p.l("create"),
    c: Create.ModelServer,
  }),
  p.obj({
    t: p.l("play"),
    c: Play.ModelServer,
  }),
)

export type ModelServer = p.Infer<typeof ModelServer>

//
//
// Msg
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: "msgSync"; c: MsgSync }
  | { t: "create"; c: Create.MsgClient }
  | { t: "play"; c: Play.MsgClient }

export type MsgServer =
  | { t: "create"; c: Create.MsgServer }
  | { t: "play"; c: Play.MsgServer }

export type MsgToServer =
  | { t: "create"; c: Create.MsgToServer }
  | { t: "play"; c: Play.MsgToServer }

export type MsgToClient =
  | { t: "create"; c: Create.MsgToClient }
  | { t: "play"; c: Play.MsgToClient }

export type Mode = "create" | "play"

//
//
//
//
//
//
//

export type MsgSync =
  | { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
  | { t: "play"; c: Play.MsgSync }
  | { t: "create"; c: Create.MsgSync }

export type ModelSync =
  | { t: null }
  | { t: "create"; c: Create.ModelSync }
  | { t: "play"; c: Play.ModelSync }
