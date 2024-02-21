import { describe, expect, it } from "bun:test"
import { chainUpdates } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { EventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"
import { defaultModelSync, initial, testFlowClientCtx } from "../@TEST/client"
import { BuildClient } from "../build.client"
import { ModelClient } from "../build.core"
import { didPlaySound } from "gamezilla/@CHILD/app/@SHARED/client"
import { ListTab } from "./list-tabs.core"

const userChangedListTab = (listTab: ListTab) => (model: ModelClient) => {
  return BuildClient.update({
    ctx: testFlowClientCtx,
    model,
    modelSync: defaultModelSync,
    msgSync: {
      t: "user-changed-list-tab",
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0),
      listTab,
    },
  })
}

describe("flow builder list abs", () => {
  it("play a sound when changing list tabs", async () => {
    const output = await chainUpdates(initial, userChangedListTab("packs"))
    expect(didPlaySound(output)).toBeTrue()
  })
})
