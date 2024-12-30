import { describe, expect, it, test } from 'bun:test'
import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { RequestResponse, isRequesting, isResponseOk } from '~/@/request-response/request-response'
import type { Route } from '~/@/routing/generated/routes'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, didPlaySound, didPushRoute } from '~/app/@/client'
import { SpaceId } from '~/app/@/data/space-id'
import { EMPTY_STATE_TEST_ID, SPINNER_TEST_ID } from '~/app/@/ui'
import { FixtureSpacesClient } from '../@/fixture/client'
import { SpacesClient } from '../client'
import { SpaceCore } from '../core'

const Fixture = async (input?: { currentRoute?: Route }) => {
  const f = await FixtureSpacesClient(input)

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
    const output = SpacesClient.init({
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
    const output = SpacesClient.init({
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

  it('should be ok when server responds with a list of spaces even when it timed out', async () => {
    const f = await Fixture()
    const updated = f.update(f.initial, [
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
      },
      {
        msgServer: {
          t: 'listed-spaces',
          spaces: [SpaceCore.random(), SpaceCore.random(), SpaceCore.random()],
          causedBy: null
        }
      }
    ])

    expect(isResponseOk(updated.model.listSpacesRequest)).toBe(true)
  })

  it('should navigate to space screen after clicking a space card', async () => {
    const f = await Fixture()

    const space = SpaceCore.random()
    const spaceId = SpaceCore.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
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
          spaces: [space],
          causedBy: null
        }
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId
        }
      }
    ])

    expect(didPushRoute(updated)).toBe(true)
  })

  it('should make a nav forward sound when opening a space screen', async () => {
    const f = await Fixture()

    const space = SpaceCore.random()
    const spaceId = SpaceCore.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
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
          spaces: [space],
          causedBy: null
        }
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId
        }
      }
    ])

    expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBe(true)
  })

  it('should make a sound when closing room screen', async () => {
    const f = await Fixture()

    const space = SpaceCore.random()
    const spaceId = SpaceCore.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
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
          spaces: [space],
          causedBy: null
        }
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId
        }
      },
      {
        msg: {
          t: 'clicked-go-home-button'
        }
      }
    ])
    expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBe(true)
  })

  test('listing stale space should not override current state', async () => {
    const f = await Fixture()

    const spaceId = SpaceId.generate()
    const hostId = f.currentUser.userId

    const space = pipe(SpaceCore.random({ spaceId, hostId }), (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-inputted-game', game: 'flow', spaceId, userId: hostId } as const)
      )
    )

    const listedSpace = EventSourced.startFromLatestSnapshot(space)
    const updated = f.update(f.initial, [
      { msgServer: { t: 'listed-spaces', spaces: [listedSpace] } },
      { msg: { t: 'game', c: { t: 'flow', c: { t: 'game-main-menu/clicked-exit-game-button' } }, spaceId } },
      { msgServer: { t: 'listed-spaces', spaces: [listedSpace] } },
      { msgServer: { t: 'current-user-space', currentUser: f.currentUser, space: listedSpace } }
    ])

    const before = SpaceCore.toSpaceStarted(space)
    const after = SpaceCore.toSpaceStarted(updated.model.spaces[spaceId])

    expect(before?.game?.t ?? null).toEqual('flow')
    expect(after?.game?.t ?? null).toEqual(null)
  })

  test('render spinner when listing spaces', async () => {
    const f = await Fixture()

    const initial = f.update(f.initial, [{ msgServer: { t: 'listed-spaces', spaces: [] } }])

    const updated = f.update(initial, [
      { msgEvt: { t: 'routing/route-changed', route: { n: 'spaces', t: 'space-list' } } }
    ])
    expect(f.view(initial).getByTestId(SPINNER_TEST_ID)).toBeFalsy()
    expect(f.view(updated).getByTestId(SPINNER_TEST_ID)).toBeTruthy()
  })

  test('render empty state', async () => {
    const f = await Fixture()
    const initial = f.update(f.initial, [{ msgServer: { t: 'listed-spaces', spaces: [] } }])
    const updated = f.update(initial, [
      { msgEvt: { t: 'routing/route-changed', route: { n: 'spaces', t: 'space-list' } } }
    ])
    expect(f.view(initial).getByTestId(EMPTY_STATE_TEST_ID)).toBeTruthy()
    expect(f.view(updated).getByTestId(EMPTY_STATE_TEST_ID)).toBeFalsy()
  })
})
