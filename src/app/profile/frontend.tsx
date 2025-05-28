import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { OpenProfileCmd } from '~/app/@/frontend/open-profile-cmd'
import { AddProfilesCmd } from '../@/frontend/add-profiles-cmd'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd'
import { ProfileFrontendCtx } from './@/frontend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db'
import { ScreenProfileFrontend } from './screen-profile/frontend'
import { ScreenUpdateUsernameFrontend } from './screen-update-username/frontend'
import { UpdateAvatarScreen } from './screen-update/update-avatar-screen'
import { UpdateProfileScreen } from './screen-update/update-profile-screen'
import type { FrontendModule, ModelFrontend } from './types'

const initCtx = (input: { ctx: AppFrontendCtxBase }): ProfileFrontendCtx => {
  return {
    ...input.ctx,
    profileDb: ProfileDb({
      t: 'sql',
      logger: input.ctx.logger,
      dbConnSql: input.ctx.dbConnSql,
    }),
  }
}

const init: FrontendModule['init'] = ({ ctx }) => {
  const screenUpdateUsername = ScreenUpdateUsernameFrontend.init({ ctx })
  const screenProfile = ScreenProfileFrontend.init({ ctx })
  const model: ModelFrontend = {
    profilesByUserId: {},
    screenProfile: screenProfile.model,
    screenUpdateUsername: screenUpdateUsername.model,
  }

  return { model }
}

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  const { msgIn } = input

  if (AddProfilesCmd.is(msgIn)) {
    return {
      model: { ...input.model, profilesByUserId: { ...input.model.profilesByUserId, ...msgIn.profiles } },
    }
  }

  if (OpenProfileCmd.is(msgIn)) {
    return {
      model: input.model,
      msgOut: [PushScreenCmd.init({ t: 'profile', n: 'profile', userId: msgIn.userId })],
    }
  }

  return { model: input.model }
}

const updateFromMsg: FrontendModule['update'] = (input): ReturnType<FrontendModule['update']> => {
  const updated = ScreenProfileFrontend.update({
    ctx: input.ctx,
    msg: input.msg?.t === 'got-profile-screen-msg' ? input.msg.c : null,
    model: input.model.screenProfile,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, screenProfile: updated.model },
    eff: Eff.tag('got-profile-screen-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.tag(
    'got-profile-screen-msg',
    ScreenProfileFrontend.subscriptions({
      ctx: input.ctx,
      model: input.model,
    }),
  )
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'profile': {
      switch (input.ctx.currentScreen.t) {
        case 'profile': {
          return (
            <ScreenProfileFrontend.View
              model={input.model}
              ctx={input.ctx}
              dispatch={(c) => input.dispatch({ t: 'got-profile-screen-msg', c })}
            />
          )
        }

        case 'profile-edit': {
          return <UpdateProfileScreen.View {...input} />
        }

        case 'profile-edit-avatar': {
          return <UpdateAvatarScreen.View ctx={input.ctx} model={input.model} dispatch={input.dispatch} />
        }

        case 'profile-edit-username': {
          return (
            <ScreenUpdateUsernameFrontend.View
              ctx={input.ctx}
              model={input.model.screenUpdateUsername}
              dispatch={(c) => input.dispatch({ t: 'got-update-username-screen-msg', c })}
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

export const ProfileFrontend = {
  init,
  update,
  subscriptions,
  View,
  initCtx,
}
