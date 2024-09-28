import { describe, expect, it } from 'bun:test'
import { Posix, RequestResponse, TimeSpan, isRequesting, isResponseOk } from 'gamezilla-app/@/core'
import type { Route } from 'gamezilla-app/@/routing/generated/routes'
import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { APP_SOUND, type ClientCtx, didPlaySound, didPushRoute } from 'gamezilla-app/app/@/client'
import { SpaceId } from 'gamezilla-app/app/@/data'
import {
  Ctx,
  FixtureSpaceClient,
  changeRoute,
  clickSpaceCard,
  clickedGoHomeButton,
  elapsed,
  init,
  serverListedSpaces
} from '../@/fixture/client'
import { SpaceCore } from '../spaces-core'
import * as SpaceClient from '../spaces.client'

const changeRouteToSpaceList = (ctx: ClientCtx) => {
  return changeRoute(ctx, { n: 'spaces', t: 'space-list' })
}

const Fixture = async (input?: { currentRoute?: Route }) => {
  const f = await FixtureSpaceClient(input)
  return {
    ...f
  }
}

describe(import.meta.file, () => {
  it('should request spaces on init if on space list route', async () => {
    const f = await Fixture({
      currentRoute: {
        n: 'spaces',
        t: 'space-list'
      }
    })
    const output = SpaceClient.init({
      ctx: f.ctx
    })
    expect(
      isRequesting(output.model.listSpacesRequest) && output.model.listSpacesRequest.requestedAt === f.ctx.now
    ).toBe(true)
  })

  it('should send list space request to server initially', async () => {
    const f = await Fixture({
      currentRoute: {
        n: 'spaces',
        t: 'space-list'
      }
    })
    const output = SpaceClient.init({
      ctx: f.ctx
    })
    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'wire' && msgCmd.c.toServer?.t === 'list-spaces')).toBe(true)
  })

  it('should request spaces on space list route change', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgEvt: {
          t: 'routing/route-changed',
          route: {
            n: 'spaces',
            t: 'space-list'
          }
        }
      }
    ])
    expect(output.model.listSpacesRequest.t === 'loading').toBe(true)
  })

  it('should timeout request', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgEvt: {
          t: 'routing/route-changed',
          route: {
            n: 'spaces',
            t: 'space-list'
          }
        }
      },
      {
        ctx: {
          ...f.ctx,
          now: Posix.future(f.ctx.now, TimeSpan.minutes(5))
        },
        msg: {
          t: 'time-passed'
        }
      }
    ])
    expect(RequestResponse.didRequestTimeout(output.model.listSpacesRequest)).toBe(true)
  })

  it('should be ok when server responds with a list of spaces', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgEvt: {
          t: 'routing/route-changed',
          route: {
            n: 'spaces',
            t: 'space-list'
          }
        }
      },
      {
        msgServer: {
          t: 'listed-spaces',
          spaces: [SpaceCore.random(), SpaceCore.random(), SpaceCore.random()],
          causedBy: null
        }
      }
    ])
    expect(isResponseOk(output.model.listSpacesRequest)).toBe(true)
  })

  it('should be ok when server responds with a list of spaces even when it timed out', () => {
    const ctx = Ctx()
    const updated = AppClientModule.andThen(
      init(ctx),
      changeRouteToSpaceList(ctx),
      elapsed(ctx, TimeSpan.seconds(10)),
      serverListedSpaces(ctx)
    )

    expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true)
  })

  it('should navigate to space screen after clicking a space card', () => {
    const SpaceA = SpaceId.generate()
    const ctx = Ctx()
    const updated = AppClientModule.andThen(init(ctx), serverListedSpaces(ctx, [SpaceA]), clickSpaceCard(ctx, SpaceA))

    expect(didPushRoute(updated)).toBe(true)
  })

  it('should make a nav forward sound when opening a space screen', () => {
    const SpaceA = SpaceId.generate()
    const ctx = Ctx()
    const updated = AppClientModule.andThen(init(ctx), serverListedSpaces(ctx, [SpaceA]), clickSpaceCard(ctx, SpaceA))
    expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBe(true)
  })

  it('should make a sound when closing room screen', () => {
    const SpaceA = SpaceId.generate()
    const ctx = Ctx()
    const updated = AppClientModule.andThen(
      init(ctx),
      serverListedSpaces(ctx, [SpaceA]),
      clickSpaceCard(ctx, SpaceA),
      clickedGoHomeButton(ctx)
    )
    expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBe(true)
  })
})
