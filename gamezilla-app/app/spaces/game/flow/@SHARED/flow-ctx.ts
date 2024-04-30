import { SpaceClientCtx } from "gamezilla-app/app/spaces/@shared/space"
import { ClientCmd, ClientCmdTypes } from "gamezilla-app/app/@shared/client"
import { FlowPuzzle } from "./flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "./flow-puzzle/flow-puzzle-id"

export type FlowClientCtx = SpaceClientCtx & {
  onQuit: () => void
}

export type FlowCmd = {
  t: "flow"
  c: {
    t: "add-puzzles"
    puzzles: {
      [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
    }
  }
}

export type FlowClientCmd<T extends ClientCmdTypes> = ClientCmd<T> | FlowCmd
