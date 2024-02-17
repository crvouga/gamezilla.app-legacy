import { describe, expect, it } from "bun:test"
import { FlowPackListClient } from "."
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { ModelClient, initClient } from "./flow-pack-list.core"
import { spaceClientCtx } from "../../../../@SHARED/testing/client"
import { Posix, RequestResponse, TimeSpan } from "gamezilla/@SHARED/core"
import { didSendToServer } from "gamezilla/@CHILD/app/@SHARED/client"

const initial = {
  model: initClient,
}

const observedEndOfList = (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: spaceClientCtx,
    model,
    msg: {
      t: "user-observed-end-of-list",
    },
  })
}

const elasped = (timeSpan: TimeSpan) => (model: ModelClient) => {
  return FlowPackListClient.update({
    ctx: { ...spaceClientCtx, now: Posix.add(spaceClientCtx.now, timeSpan) },
    model,
    msg: { t: "elapsed" },
  })
}

describe("flow puzzle list client", () => {
  it("should be request when user observes end of list", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
    )
    expect(RequestResponse.isRequesting(output.model.request)).toBeTrue()
  })

  it("should send request to server when user observes end of list", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
    )
    expect(didSendToServer(output, (msg) => msg.t === "list-packs")).toBeTrue()
  })

  it("should timeout request", async () => {
    const output = await AppClientModule.chainUpdates(
      initial,
      observedEndOfList,
      elasped(TimeSpan.fromSeconds(10)),
    )
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBeTrue()
  })
})
