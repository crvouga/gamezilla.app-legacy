import { Eff } from '~/@/eff'
import { exhaustive } from '~/@/function/exhaustive'
import { pipe } from '~/@/function/pipe'
import { RemoteResult, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import type { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtx } from '../@/frontend/ctx'
import { Mic } from './mic'
import type { ModelFrontend, MsgFrontend, MsgToFrontend } from './party.types'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init = (): [Model, Eff<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      //
      requests: {},
      volume: 0,
    },
    Eff.None,
  ]
}

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'clicked-banner': {
      return [model, Eff.None]
    }

    case 'MicSound': {
      return [
        {
          ...model,
          volume: msg[1].volume,
        },
        Eff.None,
      ]
    }

    case 'MicUnload':
    case 'MicLoad': {
      return [model, Eff.None]
    }

    case 'party-get':
    case 'PartyCreate':
    case 'PartyDestroy':
    case 'PartyLeave':
    case 'PartyJoin': {
      return [
        {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteResult.Loading,
          },
        },
        Eff.None,
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  { currentUserId }: { currentUserId: UserId },
  msg: MsgToFrontend,
  model: Model,
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'party-get':
    case 'PartyDestroy':
    case 'PartyCreate':
    case 'PartyJoin':
    case 'PartyLeave': {
      const requestsNew: Model['requests'] = {
        ...model.requests,
        [msg[0]]: RemoteResult.map(msg[2], () => null),
      }

      if (isErr(msg[2])) {
        return [
          {
            ...model,
            requests: requestsNew,
          },
          Eff.None,
        ]
      }

      const modelNext: Model = {
        ...model,
        requests: requestsNew,
        ...msg[2].value,
      }

      const eff = toLifecycleEff({
        currentUserId,
        modelNext: modelNext,
        modelPrev: model,
      })

      return [modelNext, eff]
    }
    default: {
      return exhaustive(msg[0])
    }
  }
}

const toLifecycleEff = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId
  modelPrev: Model
  modelNext: Model
}): Eff<Msg> => {
  const userPrev = modelPrev.users[currentUserId]
  const userNext = modelNext.users[currentUserId]

  // did user just leave party?
  if (userPrev && !userNext) {
    return pipe(
      Mic.unload,
      Eff.perform((result) => ['MicUnload', result]),
    )
  }

  // did user just join party?
  if (!userPrev && userNext) {
    return pipe(
      Mic.load,
      Eff.perform((result) => ['MicLoad', result]),
    )
  }

  return Eff.None
}

//
//
//
// View
//
//
//

export const ViewPage = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: AppFrontendCtx
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const user = model.users[ctx.currentUser.userId]

  if (!user) {
    return h(ViewNotInParty, { ctx, model, dispatch })
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return h(ViewNotInParty, { ctx, model, dispatch })
  }

  return null
}

const ViewNotInParty = (_input: { ctx: AppFrontendCtx; model: Model; dispatch: (msg: Msg) => void }) => {
  return h('div', {}, ['ViewNotInParty'])
}

export const ViewBanner = ({
  model,
  ctx,
}: {
  ctx: AppFrontendCtx

  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const user = model.users[ctx.currentUser.userId]

  if (!user) {
    return null
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return null
  }

  return h('div', {}, ['ViewBanner'])
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.none()
}
