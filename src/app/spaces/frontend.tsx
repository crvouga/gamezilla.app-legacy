import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { NotAsked } from '~/@/result'
import { isAppFrontendCtx } from '../@/frontend/ctx'
import { type Input, type Output, SpaceFrontendModule } from './@/architecture/space-frontend'
import { SpaceFrontendCmd } from './@/space-frontend/cmd'
import { SpaceFrontendEvt } from './@/space-frontend/evt'
import { CurrentSpaceBottomBar } from './frontend/current-space-bottom-bar'
import { GoHome } from './frontend/go-home'
import { People } from './frontend/people'
import { SpaceFrontend } from './frontend/space'
import { SpacesCoreFrontend } from './core/frontend'
import { EndSpaceFrontend } from './end-space/end-space.frontend'
import { GameFrontend } from './game/frontend'
import { JoinSpaceFrontend } from './join-space/frontend'
import { LeaveSpaceFrontend } from './leave-space/frontend'
import { ListSpacesFrontend } from './list-spaces/frontend'
import { StartSpaceFrontend } from './start-space/frontend'
import { SyncFrontend } from './sync/frontend'
import type { FrontendModule, ModelFrontend } from './types'

//
//
//
// Model
//
//
//

const init: FrontendModule['init'] = ({ ctx }) => {
  const model: ModelFrontend = {
    ...SpacesCoreFrontend.init,
    games: {},
    modal: null,
    modalPreviewUserId: null,
    listSpacesRequest: NotAsked,
  }
  const listSpaces = ListSpacesFrontend.init({ ctx, model })
  return {
    model: {
      ...model,
      ...listSpaces.model,
    },
    eff: Eff.batch([listSpaces.eff]),
    msgCmd: SpaceFrontendCmd.toFrontendCmd(listSpaces.msgCmd),
  }
}

//
//
//
// Update
//
//
//

const update: FrontendModule['update'] = (input) => {
  const updated = updateLoop({
    ...input,
    ctx: {
      ...input.ctx,
      profiles: {
        ...input.ctx.profiles,
        ...input.msgBackend?.profiles,
      },
    },
  })

  return {
    model: updated.model,
    eff: updated.eff,
    msgCmd: SpaceFrontendCmd.toFrontendCmd(updated.msgCmd),
    msgEvt: SpaceFrontendEvt.toFrontendEvt(updated.msgEvt),
  }
}

const updateLoop = (input: Input, initial?: Output): Output => {
  const acc = initial ?? updateChild(input)

  const [coreEvt, ...coreEvtRest] = acc.msgCore ?? []

  if (coreEvt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCore: coreEvt,
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(coreEvtRest, updated.msgCore),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
    })
  }

  const [evt, ...evtRest] = SpaceFrontendEvt.toSpaceFrontendEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgEvt: evt,
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(evtRest, updated.msgEvt),
    })
  }

  const [cmd, ...cmdRest] = SpaceFrontendCmd.toSpaceFrontendCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCmd: cmd,
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
    })
  }

  return acc
}

const updateChild: SpaceFrontendModule['update'] = (input) => {
  if (input.msgCore && SpacesCoreFrontend.hasEvent(input.model, input.msgCore.spaceId, input.msgCore.eventId)) {
    return { model: input.model }
  }

  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => EndSpaceFrontend.update({ ...input, model }),
    (model) => LeaveSpaceFrontend.update({ ...input, model }),
    (model) => GameFrontend.update({ ...input, model }),
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => SyncFrontend.update({ ...input, model }),
    (model) => StartSpaceFrontend.update({ ...input, model }),
    (model) => JoinSpaceFrontend.update({ ...input, model }),
    (model) => ListSpacesFrontend.update({ ...input, model }),
    (model) => GoHome.update({ ...input, model }),
    (model) => CurrentSpaceBottomBar.update({ ...input, model }),
    (model) => People.update({ ...input, model }),
  )
}

const updateSpacesFromSpaceEvent: SpaceFrontendModule['update'] = ({ msgCore, model }) => {
  if (!msgCore) {
    return { model }
  }

  const updated = SpacesCoreFrontend.update({
    model,
    msgCore: msgCore,
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

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return GameFrontend.subscriptions(input)
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

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'spaces': {
      switch (input.ctx.currentRoute.t) {
        case 'space-list': {
          return (
            <>
              <ListSpacesFrontend.View dispatch={input.dispatch} ctx={input.ctx} model={input.model} />

              {input.slots?.bottomBar(null)}
            </>
          )
        }
        case 'space': {
          if (isAppFrontendCtx(input.ctx)) {
            return (
              <SpaceFrontend.View
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

const ViewCurrentSpaceBar = CurrentSpaceBottomBar.View

export const SpacesFrontend = {
  init,
  update,
  updateLoop,
  subscriptions,
  View,
  ViewCurrentSpaceBar,
}
