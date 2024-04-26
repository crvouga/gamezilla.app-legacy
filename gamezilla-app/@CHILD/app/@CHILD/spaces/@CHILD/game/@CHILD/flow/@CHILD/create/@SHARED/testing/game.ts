import { WithEventId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { FlowClientCtx } from "../../../../@SHARED/flow-ctx"
import { MsgSync } from "../../create.core"
import { initSync, reducer } from "../../create.sync"

export const deriveModelSync =
  (ctx: FlowClientCtx) => (input: { msgSync?: WithEventId<MsgSync>[] }) => {
    return (input.msgSync ?? []).reduce(
      (modelSync, msgSync) => reducer({ modelSync, msgSync, ctx }),
      initSync({ ctx }),
    )
  }
