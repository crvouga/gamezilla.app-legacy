import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { OpenProfileCmd } from '~/app/@/frontend/open-profile-cmd.$msg'
import { AddProfilesCmd } from '../@/frontend/add-profiles-cmd$msg'
import { andThen } from '../@/frontend/and-then'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd.$msg'
import { ProfileDb } from './@/user-profile/user-profile-db'
import { ScreenProfileFrontend } from './screen-profile'
import { ScreenUpdateUsernameFrontend } from './screen-update-username/frontend'
import { UpdateAvatarScreen } from './screen-update/update-avatar-screen'
import { UpdateProfileScreen } from './screen-update/update-profile-screen'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from './types'

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

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen(
    input,
    (model) => ScreenProfileFrontend.update({ ...input, model }),
    (model) => ScreenUpdateUsernameFrontend.update({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromCmd: typeof update = (input) => {
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
      msgOut: [PushScreenCmd.init({ n: 'profile', t: 'profile_profile', userId: msgIn.userId })],
    }
  }

  return { model: input.model }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return ScreenProfileFrontend.subscriptions(input)
}

const View = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  switch (input.ctx.currentScreen.t) {
    case 'profile_profile':
      return h(ScreenProfileFrontend.View, input)
    case 'profile_profileEdit':
      return h(UpdateProfileScreen.View, input)
    case 'profile_profileEditAvatar':
      return h(UpdateAvatarScreen.View, input)
    case 'profile_profileEditUsername':
      return h(ScreenUpdateUsernameFrontend.View, input)
    default:
      return null
  }
}

export const ProfileFrontend = {
  update,
  subscriptions,
  View,
  initCtx,
}
