import { Posix } from "gamezilla/@SHARED/core"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { samples } from "../../../@SHARED/flow/flow-grid/flow-grid-samples"

export const createFlowPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt,
    createdBy,
    puzzle: {
      t: "grid",
      c: samples["5x5"]["1"],
    },
  })
}
