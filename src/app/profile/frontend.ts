import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { OpenProfileCmd } from '~/app/@/frontend/open-profile-cmd.$msg'
import { AddProfilesCmd } from '../@/frontend/add-profiles-cmd$msg'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd.$msg'
import { ProfileDb } from './@/user-profile/user-profile-db'
import { ScreenProfileFrontend } from './screen-profile'
import { ScreenUpdateUsernameFrontend } from './screen-update-username/frontend'
import { UpdateAvatarScreen } from './screen-update/update-avatar-screen'
import { UpdateProfileScreen } from './screen-update/update-profile-screen'
import type { FrontendCtxModule, FrontendModule, ModelFrontend, MsgFrontend } from './types'

const initCtx = (input: { ctx: AppFrontendCtxBase }): FrontendCtxModule => {
  return {
    ...input.ctx,
    profileDb: ProfileDb({
      t: 'sql',
      logger: input.ctx.logger,
      sqlDb: input.ctx.sqlDb,
      migrationPolicy: input.ctx.migrationPolicy,
    }),
  }
}

const init: FrontendModule['init'] = ({ ctx }) => {
  const screenUpdateUsername = ScreenUpdateUsernameFrontend.init({ ctx })
  const screenProfile = ScreenProfileFrontend.init({ ctx })
  const model: ModelFrontend = {
    profiles_profilesByUserId: {},
    ...screenProfile.model,
    ...screenUpdateUsername.model,
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
      model: {
        ...input.model,
        profiles_profilesByUserId: { ...input.model.profiles_profilesByUserId, ...msgIn.profiles },
      },
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
  return ScreenProfileFrontend.update(input)
}

const subscriptions: FrontendModule['subscriptions'] = (input): Sub<MsgFrontend> => {
  return ScreenProfileFrontend.subscriptions(input)
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'profile': {
      switch (input.ctx.currentScreen.t) {
        case 'profile':
          return h(ScreenProfileFrontend.View, input)
        case 'profile-edit':
          return h(UpdateProfileScreen.View, input)
        case 'profile-edit-avatar':
          return h(UpdateAvatarScreen.View, input)
        case 'profile-edit-username':
          return h(ScreenUpdateUsernameFrontend.View, input)
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
