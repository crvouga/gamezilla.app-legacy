import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { samples } from "../../../../@SHARED/flow/flow-variant/flow-grid/flow-grid-samples"

export const createFlowPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples["5x5"]["1"],
  })
}
