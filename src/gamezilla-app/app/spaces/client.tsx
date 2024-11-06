import { Eff, NotAsked } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { isAppClientCtx } from '../@/client'
import { type Input, type Output, SpaceClientModule } from './@/architecture/space-client'
import { SpaceClientCmd } from './@/space-client-cmd'
import { SpaceClientEvt } from './@/space-client-evt'
import { CurrentSpaceBottomBar } from './client/current-space-bottom-bar'
import { GoHome } from './client/go-home'
import { People } from './client/people'
import { SpaceClient } from './client/space'
import * as SpacesCoreClient from './core/client/spaces-core.client'
import { EndSpaceClient } from './end-space/end-space.client'
import { GameClient } from './game/client'
import { JoinSpaceClient } from './join-space/client'
import { LeaveSpaceClient } from './leave-space/client'
import { ListSpacesClient } from './list-spaces/client'
import { StartSpaceClient } from './start-space/client'
import { SyncClient } from './sync/client'
import type { ClientModule, ModelClient } from './types'

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
  const updated = updateLoop({
    ...input,
    ctx: {
      ...input.ctx,
      profiles: {
        ...input.ctx.profiles,
        ...input.msgServer?.profiles
      }
    }
  })

  return {
    model: updated.model,
    eff: updated.eff,
    msgCmd: SpaceClientCmd.toClientCmd(updated.msgCmd),
    msgEvt: SpaceClientEvt.toClientEvt(updated.msgEvt)
  }
}

export const updateLoop = (input: Input, initial?: Output): Output => {
  const acc = initial ?? updateChild(input)

  const [coreEvt, ...coreEvtRest] = acc.msgCore ?? []

  if (coreEvt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCore: coreEvt
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(coreEvtRest, updated.msgCore),
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt)
    })
  }

  return acc
}

const updateChild: SpaceClientModule['update'] = (input) => {
  if (input.msgCore && SpacesCoreClient.hasEvent(input.model, input.msgCore.spaceId, input.msgCore.eventId)) {
    return { model: input.model }
  }

  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => EndSpaceClient.update({ ...input, model }),
    (model) => LeaveSpaceClient.update({ ...input, model }),
    (model) => GameClient.update({ ...input, model }),
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => SyncClient.update({ ...input, model }),
    (model) => StartSpaceClient.update({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
    (model) => GoHome.update({ ...input, model }),
    (model) => CurrentSpaceBottomBar.update({ ...input, model }),
    (model) => People.update({ ...input, model })
  )
}

const updateSpacesFromSpaceEvent: SpaceClientModule['update'] = ({ msgCore, model }) => {
  if (!msgCore) {
    return { model }
  }

  const updated = SpacesCoreClient.update({
    model,
    msgCore: msgCore
  })

  return { model: { ...model, ...updated.model } }
}

//
//
//
//
//
//
//
//
//

export const subscriptions: ClientModule['subscriptions'] = (input) => {
  return GameClient.subscriptions(input)
}

//
//
//
//
//
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
          if (isAppClientCtx(input.ctx)) {
            return (
              <SpaceClient.View
                spaceId={input.ctx.currentRoute.spaceId}
                ctx={input.ctx}
                dispatch={input.dispatch}
                model={input.model}
              />
            )
          }
          return null
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
