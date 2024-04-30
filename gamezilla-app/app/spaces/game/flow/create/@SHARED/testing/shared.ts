import { UserId } from "gamezilla-app/app/@shared/data"
import { Posix } from "gamezilla-app/@/core"
import { FlowPuzzle } from "../../../@shared/flow-puzzle/flow-puzzle"
import { samples } from "../../../@shared/flow/flow-variant/flow-grid/flow-grid-samples"

export const createFlowPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples["5x5"]["1"],
  })
}
