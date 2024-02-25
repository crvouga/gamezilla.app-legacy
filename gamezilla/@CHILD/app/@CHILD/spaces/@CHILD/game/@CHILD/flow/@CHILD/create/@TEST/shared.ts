import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla/@SHARED/core"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { samples } from "../../../@SHARED/flow/flow-variant-grid/flow-grid-samples"

export const createFlowPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples["5x5"]["1"],
  })
}
