import { WithEventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { MsgSync, initSync, reducer } from "../builder.core"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"

export const deriveModelSync = (input: {
  msgSync?: WithEventId<MsgSync>[]
}) => {
  return (input.msgSync ?? []).reduce(
    (modelGame, msgSync) =>
      reducer({ modelGame, msgSync, ctx: testSpaceClientCtx }),
    initSync({ ctx: testSpaceClientCtx }),
  )
}
