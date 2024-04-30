import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { EventId } from "gamezilla-app/app/@CHILD/spaces/@SHARED/event"
import { didPlaySound } from "gamezilla-app/app/@SHARED/client"
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { initial, testFlowClientCtx } from "../@SHARED/testing/client"
import { CreateClient } from "../create.client"
import { ModelClient } from "../create.core"
import { initSync } from "../create.sync"
import { ListTab } from "./list-tabs.core"

const userChangedListTab =
  (ctx: FlowClientCtx, listTab: ListTab) => (model: ModelClient) => {
    return CreateClient.update({
      ctx,
      model,
      modelSync: initSync({ ctx }),
      msgSync: {
        t: "user-changed-list-tab",
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        listTab,
      },
    })
  }

describe(import.meta.file, () => {
  it("play a sound when changing list tabs", async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(initial, userChangedListTab(ctx, "packs"))
    expect(didPlaySound(output)).toBe(true)
  })
})
