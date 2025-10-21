import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
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

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const screenUpdateUsername = ScreenUpdateUsernameFrontend.init(input)
  const screenProfile = ScreenProfileFrontend.init(input)
  return {
    model: {
      profiles_profilesByUserId: {},
      screenUpdateUsername: screenUpdateUsername.model,
      screenProfile: screenProfile.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('screenUpdateUsername', screenUpdateUsername.eff),
      Eff.tag('screenProfile', screenProfile.eff),
    ]),
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'screenUpdateUsername': {
      const updated = ScreenUpdateUsernameFrontend.update({
        ctx: input.ctx,
        model: input.model.screenUpdateUsername,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, screenUpdateUsername: updated.model },
        eff: Eff.tag('screenUpdateUsername', updated.eff),
      }
    }
    case 'screenProfile': {
      const updated = ScreenProfileFrontend.update({
        ctx: input.ctx,
        model: input.model.screenProfile,
        msg: input.msg.c,
      })
      return { model: { ...input.model, screenProfile: updated.model }, eff: Eff.tag('screenProfile', updated.eff) }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    Sub.map(ScreenProfileFrontend.subscriptions({ ctx: input.ctx, model: input.model.screenProfile }), (c) => ({
      t: 'screenProfile',
      c,
    })),
    Sub.map(
      ScreenUpdateUsernameFrontend.subscriptions({ ctx: input.ctx, model: input.model.screenUpdateUsername }),
      (c) => ({ t: 'screenUpdateUsername', c }),
    ),
  ])
}

const View = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  switch (input.ctx.currentScreen.t) {
    case 'profile_profile':
      return h(ScreenProfileFrontend.View, {
        ctx: input.ctx,
        model: input.model.screenProfile,
        dispatch: (msg) => input.dispatch({ t: 'screenProfile', c: msg }),
      })
    case 'profile_profileEdit':
      return h(UpdateProfileScreen.View, {
        ctx: input.ctx,
        model: input.model,
        dispatch: input.dispatch,
      })
    case 'profile_profileEditAvatar':
      return h(UpdateAvatarScreen.View, {
        ctx: input.ctx,
        model: input.model,
        dispatch: input.dispatch,
      })
    case 'profile_profileEditUsername':
      return h(ScreenUpdateUsernameFrontend.View, {
        ctx: input.ctx,
        model: input.model.screenUpdateUsername,
        dispatch: (msg) => input.dispatch({ t: 'screenUpdateUsername', c: msg }),
      })
    default:
      return null
  }
}

export const ProfileFrontend = {
  init,
  update,
  subscriptions,
  View,
  initCtx,
}
