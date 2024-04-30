import { WithEventId } from "gamezilla-app/app/spaces/@shared/event"
import { FlowClientCtx } from "../../../@shared/flow-ctx"
import { MsgSync } from "../../create.core"
import { initSync, reducer } from "../../create.sync"

export const deriveModelSync =
  (ctx: FlowClientCtx) => (input: { msgSync?: WithEventId<MsgSync>[] }) => {
    return (input.msgSync ?? []).reduce(
      (modelSync, msgSync) => reducer({ modelSync, msgSync, ctx }),
      initSync({ ctx }),
    )
  }
