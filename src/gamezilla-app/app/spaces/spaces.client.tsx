import { Eff, NotAsked } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { isAnonymous } from '../@/client'
import { SpaceClientCmd } from './@/space-client-cmd'
import { type Input, type Output, SpaceClientModule } from './architecture/space-client'
import { EndSpaceClient } from './end-space/end-space.client'
import { JoinSpaceClient } from './join-space/join-space.client'
import { LeaveSpaceClient } from './leave-space/leave-space.client'
import { ListSpacesClient } from './list-spaces/list-spaces.client'
import { SpaceGameClient } from './game/space-game.client'
import { SpaceClient } from './spaces-client/space.client'
import { CurrentSpaceBottomBar } from './spaces-client/current-space-bottom-bar/current-space-bottom-bar'
import { GoHome } from './spaces-client/go-home/go-home'
import { Modals } from './spaces-client/modals/modals'
import * as SpacesCoreClient from './spaces-core/spaces-core-client/spaces-core.client'
import type { ClientModule, ModelClient } from './spaces.types'
import { StartSpaceClient } from './start-space/start-space.client'
import { SyncClient } from './sync/sync.client'
import { SpaceClientEvt } from './@/space-client-evt'

//
//
//
// Model
//
//
//

export const init: ClientModule['init'] = ({ ctx }) => {
  const model: ModelClient = {
    ...SpacesCoreClient.init,
    games: {},
    modal: null,
    modalPreviewUserId: null,
    listSpacesRequest: NotAsked
  }
  const listSpaces = ListSpacesClient.init({ ctx, model })
  return {
    model: {
      ...model,
      ...listSpaces.model
    },
    eff: Eff.batch([listSpaces.eff]),
    msgCmd: SpaceClientCmd.toClientCmd(listSpaces.msgCmd)
  }
}

//
//
//
// Update
//
//
//

export const update: ClientModule['update'] = (input) => {
  const updated = updateLoop(input)

  return {
    model: updated.model,
    eff: updated.eff,
    msgCmd: SpaceClientCmd.toClientCmd(updated.msgCmd),
    msgEvt: SpaceClientEvt.toClientEvt(updated.msgEvt)
  }
}

export const updateLoop = (input: Input, initial?: Output): Output => {
  const acc = initial ?? updateChild(input)

  const [coreEvt, ...coreEvtRest] = acc.msgCoreEvt ?? []

  if (coreEvt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCoreEvt: coreEvt
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCoreEvt: Msg.batch(coreEvtRest, updated.msgCoreEvt),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt)
    })
  }

  const [evt, ...evtRest] = SpaceClientEvt.toSpaceClientEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgEvt: evt
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCoreEvt: Msg.batch(acc.msgCoreEvt, updated.msgCoreEvt),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(evtRest, updated.msgEvt)
    })
  }

  const [cmd, ...cmdRest] = SpaceClientCmd.toSpaceClientCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCmd: cmd
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCoreEvt: Msg.batch(acc.msgCoreEvt, updated.msgCoreEvt),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt)
    })
  }

  return acc
}

const updateChild: SpaceClientModule['update'] = (input) => {
  if (input.msgCoreEvt && SpacesCoreClient.hasEvent(input.model, input.msgCoreEvt.spaceId, input.msgCoreEvt.eventId)) {
    return { model: input.model }
  }

  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => EndSpaceClient.update({ ...input, model }),
    (model) => LeaveSpaceClient.update({ ...input, model }),
    (model) => SpaceGameClient.update({ ...input, model }),
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => SyncClient.update({ ...input, model }),
    (model) => StartSpaceClient.update({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
    (model) => GoHome.update({ ...input, model }),
    (model) => CurrentSpaceBottomBar.update({ ...input, model }),
    (model) => Modals.update({ ...input, model })
  )
}

const updateSpacesFromSpaceEvent: SpaceClientModule['update'] = ({ msgCoreEvt: msgCoreEvt, model }) => {
  if (!msgCoreEvt) {
    return { model }
  }

  const updated = SpacesCoreClient.updateFromSpaceEvent({
    model,
    spaceEvent: msgCoreEvt
  })

  return { model: { ...model, ...updated.model } }
}

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions: ClientModule['subscriptions'] = (input) => {
  return SpaceGameClient.subscriptions(input)
}

//
//
//
//
// View
//
//
//
//

export const View: ClientModule['View'] = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'spaces': {
      switch (input.ctx.currentRoute.t) {
        case 'space-list': {
          return (
            <>
              <ListSpacesClient.View dispatch={input.dispatch} ctx={input.ctx} model={input.model} />

              {input.slots?.bottomBar(null)}
            </>
          )
        }
        case 'space': {
          if (isAnonymous(input.ctx)) {
            return null
          }

          return (
            <SpaceClient.View
              spaceId={input.ctx.currentRoute.spaceId}
              ctx={input.ctx}
              dispatch={input.dispatch}
              model={input.model}
            />
          )
        }
        default: {
          return null
        }
      }
    }
    default: {
      return null
    }
  }
}

export const ViewCurrentSpaceBar = CurrentSpaceBottomBar.View
