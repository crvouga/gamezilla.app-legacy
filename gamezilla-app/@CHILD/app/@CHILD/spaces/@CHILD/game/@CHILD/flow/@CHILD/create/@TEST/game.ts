import { WithEventId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { MsgSync } from "../create.core"
import { initSync, reducer } from "../create.game"

export const deriveModelSync = (input: {
  msgSync?: WithEventId<MsgSync>[]
}) => {
  const ctx = testSpaceClientCtx()
  return (input.msgSync ?? []).reduce(
    (modelSync, msgSync) => reducer({ modelSync, msgSync, ctx }),
    initSync({ ctx }),
  )
}
