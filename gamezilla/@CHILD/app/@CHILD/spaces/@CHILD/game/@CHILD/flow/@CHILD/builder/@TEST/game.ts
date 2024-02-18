import { WithEventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { MsgGame, initGame, reducer } from "../builder.core"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"

export const deriveModelGame = (input: {
  msgGame?: WithEventId<MsgGame>[]
}) => {
  return (input.msgGame ?? []).reduce(
    (modelGame, msgGame) =>
      reducer({ modelGame, msgGame, ctx: testSpaceClientCtx }),
    initGame({ ctx: testSpaceClientCtx }),
  )
}
