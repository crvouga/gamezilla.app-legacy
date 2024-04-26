import { describe, expect, it } from "bun:test"
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { EventId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { didPlaySound } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock"
import {
  defaultModelSync,
  initial,
  testFlowClientCtx,
} from "../@SHARED/testing/client"
import { CreateClient } from "../create.client"
import { ModelClient } from "../create.core"
import { ListTab } from "./list-tabs.core"

const userChangedListTab = (listTab: ListTab) => (model: ModelClient) => {
  return CreateClient.update({
    ctx: testFlowClientCtx(),
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

describe(import.meta.file, () => {
  it("play a sound when changing list tabs", async () => {
    const output = await andThen(initial, userChangedListTab("packs"))
    expect(didPlaySound(output)).toBe(true)
  })
})
