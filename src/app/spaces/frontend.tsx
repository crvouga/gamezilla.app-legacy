import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { NotAsked } from '~/@/result'
import { isAppFrontendCtx } from '../@/frontend/ctx'
import { type Input, type Output, SpaceFrontendModule } from './@/architecture/space-frontend'
import { SpaceFrontendCmd } from './@/frontend/cmd'
import { SpaceFrontendEvt } from './@/frontend/evt'
import { EndSpaceFrontend } from './end-space/frontend'
import { CurrentSpaceBottomBar } from './frontend/current-space-bottom-bar'
import { GoHome } from './frontend/go-home'
import { People } from './frontend/people'
import { SpaceFrontend } from './space/frontend'
import { GameFrontend } from './game/frontend'
import { JoinSpaceFrontend } from './join-space/frontend'
import { LeaveSpaceFrontend } from './leave-space/frontend'
import { ListSpacesFrontend } from './list-spaces/frontend'
import { SpacesCore } from './core/core'
import { StartSpaceFrontend } from './start-space/frontend'
import { SyncFrontend } from './sync/frontend'
import type { FrontendModule, ModelFrontend } from './types'

const init: FrontendModule['init'] = ({ ctx }) => {
  const model: ModelFrontend = {
    ...SpacesCore.init,
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

const update: FrontendModule['update'] = (input) => {
  const updated = updateLoop({
    ...input,
    ctx: {
      ...input.ctx,
      profiles: { ...input.ctx.profiles, ...input.msgBackend?.profiles },
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

  const [spaceEvt, ...spaceEvtRest] = acc.msgSpace ?? []

  if (spaceEvt) {
    const updated = updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgSpace: spaceEvt,
    })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(spaceEvtRest, updated.msgSpace),
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
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
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
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
    })
  }

  return acc
}

const updateChild: SpaceFrontendModule['update'] = (input) => {
  if (input.msgSpace && SpacesCore.hasEvent(input.model, input.msgSpace.spaceId, input.msgSpace.eventId)) {
    return { model: input.model }
  }

  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => EndSpaceFrontend.update({ ...input, model }),
    (model) => LeaveSpaceFrontend.update({ ...input, model }),
    (model) => GameFrontend.update({ ...input, model }),
    (model) => updateSpacesFromMsgSpace({ ...input, model }),
    (model) => SyncFrontend.update({ ...input, model }),
    (model) => StartSpaceFrontend.update({ ...input, model }),
    (model) => JoinSpaceFrontend.update({ ...input, model }),
    (model) => ListSpacesFrontend.update({ ...input, model }),
    (model) => GoHome.update({ ...input, model }),
    (model) => CurrentSpaceBottomBar.update({ ...input, model }),
    (model) => People.update({ ...input, model }),
  )
}

const updateSpacesFromMsgSpace: SpaceFrontendModule['update'] = ({ msgSpace, model }) => {
  if (!msgSpace) {
    return { model }
  }

  const updated = SpacesCore.update({ modelSpace: model, msgSpace })

  return { model: { ...model, ...updated.model } }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return GameFrontend.subscriptions(input)
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'spaces': {
      switch (input.ctx.currentScreen.t) {
        case 'space-list': {
          return <ListSpacesFrontend.View dispatch={input.dispatch} ctx={input.ctx} model={input.model} />
        }
        case 'space': {
          if (isAppFrontendCtx(input.ctx)) {
            return (
              <SpaceFrontend.View
                spaceId={input.ctx.currentScreen.spaceId}
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
