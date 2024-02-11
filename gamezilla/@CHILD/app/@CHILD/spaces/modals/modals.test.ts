import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  clickedPeopleButton,
  init,
  clickedUser,
  changeRoute,
  ctx,
} from "../@TEST/client.ts"
import { UserId } from "../../../@SHARED/data/user-id.ts"
import { Modals } from "./modals.tsx"
import { SpaceClientModule } from "../architechure/space-client.tsx"
import { openUserDetails } from "../@SHARED/space-client-cmd.ts"

describe("space client modals", () => {
  it("should start with no modals open", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      //
    )
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open users modal when user clicks on users button", async () => {
    const output = await AppClientModule.chainUpdates(
      await init(),
      clickedPeopleButton,
      //
    )
    expect(output.model.modal === "users").toBeTrue()
  })

  it("should open user details when click user", async () => {
    const someUserId = UserId.generate()
    const output = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedUser(model, someUserId),
      //
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })

  it("should close modal when the current route changes", async () => {
    const someUserId = UserId.generate()
    const output = await AppClientModule.chainUpdates(
      await init(),
      (model) => clickedUser(model, someUserId),
      (model) => changeRoute(model, { t: "spaces", c: { t: "space-list" } }),
    )
    expect(output.model.modal === null).toBeTrue()
  })

  it("should open user details corresponding cmd", async () => {
    const someUserId = UserId.generate()
    const initial = await init()
    const output = await SpaceClientModule.chainUpdates(
      { model: initial.model },
      (model) =>
        Modals.update({ model, ctx, msgCmd: openUserDetails(someUserId) }),
    )
    expect(
      output.model.modal === "user-preview" &&
        output.model.modalPreviewUserId === someUserId,
    ).toBeTrue()
  })
})
