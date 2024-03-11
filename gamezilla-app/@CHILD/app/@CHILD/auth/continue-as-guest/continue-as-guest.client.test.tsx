import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  AnonymousClientCtx,
  didPlaySound,
  didSendToServer,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  Posix,
  err,
  isRequesting,
  isResponseErr,
  isResponseOk,
  ok,
} from "gamezilla-app/@SHARED/core"
import * as AuthClient from "../auth.client"
import { ModelClient } from "../auth.core"
import { getTranslator } from "gamezilla-app/@CHILD/app/@SHARED/client/translator"
import { AuthRoutes } from "../@SHARED/auth-routes"

const ctx: AnonymousClientCtx = {
  currentRouteV2: AuthRoutes.Login(),
  navigatorLanguage: "en",
  t: getTranslator("en"),
  currentRoute: { t: "auth", c: { t: "login" } },
  documentVisibilityState: "visible",
  now: Posix.now(),
  profiles: {},
  currentUserId: null,
}

const clickedContinueAsGuestButton = (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msg: { t: "guest.clicked-continue-as-guest-button" },
  })

const continueAsGuestResultedOk = (userId: UserId) => (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msgServer: {
      t: "guest.continue-as-guest-result",
      result: ok(userId),
    },
  })

const continueAsGuestResultedErr = () => (model: ModelClient) =>
  AuthClient.update({
    model,
    ctx,
    msgServer: {
      t: "guest.continue-as-guest-result",
      result: err("some error happened"),
    },
  })

describe(import.meta.file, () => {
  it("should request to continue as guest when button is clicked", async () => {
    const output = await AppClientModule.andThen(
      AuthClient.init({ ctx, stored: {} }),
      clickedContinueAsGuestButton,
    )

    expect(
      isRequesting(output.model.guestRequest) &&
        output.model.guestRequest.requestedAt === ctx.now,
    ).toBeTrue()
  })

  it("should request to continue as guest when button is clicked", async () => {
    const output = await AppClientModule.andThen(
      AuthClient.init({ ctx, stored: {} }),
      clickedContinueAsGuestButton,
    )

    expect(
      didSendToServer(
        output,
        (msg) => msg.t === "guest.clicked-continue-as-guest-button",
      ),
    ).toBeTrue()
  })

  it("should resolve request as ok when resulted in ok", async () => {
    const output = await AppClientModule.andThen(
      AuthClient.init({ ctx, stored: {} }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedOk(UserId.generate()),
    )
    expect(isResponseOk(output.model.guestRequest)).toBeTrue()
  })

  it("should resolve request as err when resulted in err", async () => {
    const output = await AppClientModule.andThen(
      AuthClient.init({ ctx, stored: {} }),
      clickedContinueAsGuestButton,
      continueAsGuestResultedErr(),
    )
    expect(isResponseErr(output.model.guestRequest)).toBeTrue()
  })

  it("should play sound after continuing as guest", async () => {
    const output = await AppClientModule.andThen(
      AuthClient.init({ ctx, stored: {} }),
      clickedContinueAsGuestButton,
    )
    expect(didPlaySound(output)).toBeTrue()
  })
})
