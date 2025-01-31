import { describe, expect, it, test } from 'bun:test'
import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { isRequesting, isResponseOk } from '~/@/request-response/request-response'
import type { Screen } from '~/@/screen/generated/screens'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND, didPlaySound, didPushScreen } from '~/app/@/frontend/cmd'
import { FixtureSpacesFrontend } from '../@/fixture/frontend'
import { Space } from '../core/space'
import { SpacesFrontend } from '../frontend'

const Fixture = async (input?: { currentScreen?: Screen }) => {
  const f = await FixtureSpacesFrontend(input)

  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  it('should request spaces on init if on space list screen', async () => {
    const f = await Fixture({
      currentScreen: {
        n: 'spaces',
        t: 'space-list',
      },
    })
    const output = SpacesFrontend.init({
      ctx: f.ctx,
    })
    expect(
      isRequesting(output.model.listSpacesRequest) && output.model.listSpacesRequest.requestedAt === f.ctx.now,
    ).toBe(true)
  })

  it('should send list space request to backend initially', async () => {
    const f = await Fixture({
      currentScreen: {
        n: 'spaces',
        t: 'space-list',
      },
    })
    const output = SpacesFrontend.init({ ctx: f.ctx })
    expect(output.msgCmd?.some((msgCmd) => msgCmd.t === 'wire' && msgCmd.c.toBackend?.t === 'list-spaces')).toBe(true)
  })

  it('should request spaces on space list screen change', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgEvt: {
          t: 'screen-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
    ])
    expect(output.model.listSpacesRequest.t === 'loading').toBe(true)
  })

  it('should be ok when backend responds with a list of spaces', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgEvt: {
          t: 'screen-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
      {
        msgBackend: {
          t: 'listed-spaces',
          spaces: [Space.random(), Space.random(), Space.random()],
          causedBy: null,
        },
      },
    ])
    expect(isResponseOk(output.model.listSpacesRequest)).toBe(true)
  })

  it('should navigate to space screen after clicking a space card', async () => {
    const f = await Fixture()

    const space = Space.random()
    const spaceId = Space.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
      {
        msgEvt: {
          t: 'screen-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
      {
        msgBackend: {
          t: 'listed-spaces',
          spaces: [space],
          causedBy: null,
        },
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId,
        },
      },
    ])

    expect(didPushScreen(updated)).toBe(true)
  })

  it('should make a nav forward sound when opening a space screen', async () => {
    const f = await Fixture()

    const space = Space.random()
    const spaceId = Space.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
      {
        msgEvt: {
          t: 'screen-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
      {
        msgBackend: {
          t: 'listed-spaces',
          spaces: [space],
          causedBy: null,
        },
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId,
        },
      },
    ])

    expect(didPlaySound(updated, APP_SOUND.navForwardMin)).toBe(true)
  })

  it('should make a sound when closing room screen', async () => {
    const f = await Fixture()

    const space = Space.random()
    const spaceId = Space.toSpaceId(space)
    if (!spaceId) throw new Error('SpaceId is null')

    const updated = f.update(f.initial, [
      {
        msgEvt: {
          t: 'screen-evt.screen-changed',
          screen: {
            n: 'spaces',
            t: 'space-list',
          },
        },
      },
      {
        msgBackend: {
          t: 'listed-spaces',
          spaces: [space],
          causedBy: null,
        },
      },
      {
        msg: {
          t: 'clicked-space-card',
          spaceId,
        },
      },
      {
        msg: {
          t: 'clicked-exit-space-button',
        },
      },
    ])
    expect(didPlaySound(updated, APP_SOUND.navBackwardMin)).toBe(true)
  })

  test('listing stale space should not override current state', async () => {
    const f = await Fixture()

    const spaceId = SpaceId.generate()
    const hostId = f.currentUser.userId

    const space = pipe(Space.random({ spaceId, hostId }), (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-inputted-game', game: 'flow', spaceId, userId: hostId } as const),
      ),
    )

    const listedSpace = EventSourced.startFromLatestSnapshot(space)
    const updated = f.update(f.initial, [
      { msgBackend: { t: 'listed-spaces', spaces: [listedSpace] } },
      { msg: { t: 'game', c: { t: 'flow', c: { t: 'game-main-menu.clicked-exit-game-button' } }, spaceId } },
      { msgBackend: { t: 'listed-spaces', spaces: [listedSpace] } },
      { msgBackend: { t: 'current-user-space', currentUser: f.currentUser, space: listedSpace } },
    ])

    const before = Space.toSpaceStarted(space)
    const after = Space.toSpaceStarted(updated.model.spaces.spaces[spaceId])

    expect(before?.game?.t ?? null).toEqual('flow')
    expect(after?.game?.t ?? null).toEqual(null)
  })
})
