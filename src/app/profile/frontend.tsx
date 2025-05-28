import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppFrontendCmd, pushScreen } from '../@/frontend/cmd'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { ProfileFrontendCmd } from './@/frontend/cmd'
import { ProfileFrontendCtx } from './@/frontend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db'
import { ScreenProfileFrontend } from './screen-profile/frontend'
import { ScreenUpdateUsernameFrontend } from './screen-update-username/frontend'
import { UpdateAvatarScreen } from './screen-update/update-avatar-screen'
import { UpdateProfileScreen } from './screen-update/update-profile-screen'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgToBackend } from './types'

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

const update = (
  input: Parameters<FrontendModule['update']>[0],
): ReturnType<FrontendModule['update']> & {
  msgCmd?: AppFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>[]
} => {
  const acc = updateChild(input)
  const updated = updateLoop(input, acc)
  return {
    ...updated,
    msgCmd: updated.msgCmd,
  }
}

const updateLoop = (
  _input: Parameters<FrontendModule['update']>[0],
  acc: ReturnType<FrontendModule['update']>,
): ReturnType<FrontendModule['update']> => {
  // const currentCmds = acc.msgCmd || []
  // const [cmd, ...restCmd] = ProfileFrontendCmd.toProfileFrontendCmdInternal(currentCmds)

  // if (cmd) {
  //   // const updated = updateChild({ ctx: input.ctx, model: acc.model, msgCmd: cmd })

  //   return updateLoop(input, {
  //     model: updated.model,
  //     msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
  //     eff: Eff.batch(acc.eff, updated.eff),
  //     // msgCmd: Msg.batch(restCmd, updated.msgCmd, acc.msgCmd ? acc.msgCmd.slice(1) : []),
  //   })
  // }

  return acc
}

const updateChild: FrontendModule['update'] = (input): ReturnType<FrontendModule['update']> => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromCmd: FrontendModule['update'] = (input): ReturnType<FrontendModule['update']> => {
  if (!input.msgCmd) return { model: input.model }

  switch (input.msgCmd.c.t) {
    case 'add-profiles': {
      return {
        model: { ...input.model, profilesByUserId: { ...input.model.profilesByUserId, ...input.msgCmd.c.profiles } },
      }
    }
    case 'open-profile': {
      return {
        model: input.model,
        msgCmd: [pushScreen({ t: 'profile', n: 'profile', userId: input.msgCmd.c.userId })],
      }
    }
  }
}

const updateFromMsg: FrontendModule['update'] = (
  input,
): ReturnType<FrontendModule['update']> & {
  msgCmd?: ProfileFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>[]
} => {
  if (!input.msg) return { model: input.model }
  switch (input.msg.t) {
    case 'got-profile-screen-msg': {
      const updated = ScreenProfileFrontend.update({
        ctx: input.ctx,
        msg: input.msg.c,
        model: input.model.screenProfile,
      })

      return {
        model: { ...input.model, screenProfile: updated.model },
        eff: Eff.tag('got-profile-screen-msg', updated.eff),
        msgCmd: ProfileFrontendCmd.tag('got-profile-screen-msg', updated.msgCmd),
      }
    }
    default: {
      return { model: input.model }
    }
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
