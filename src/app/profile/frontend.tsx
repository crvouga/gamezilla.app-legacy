import { Eff } from '~/@/eff'
import { Loading, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { ProfileAvatar } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { AppFrontendCmd, back, logout, pushScreen, replaceScreen, sendToBackend } from '../@/frontend/cmd'
import { ProfileScreen } from './profile-frontend/profile-screen'
import { UpdateAvatarScreen } from './profile-frontend/update-avatar-screen'
import { UpdateProfileScreen } from './profile-frontend/update-profile-screen'
import type { FrontendModule, ModelFrontend } from './types'
import { UpdateUsernameFrontend } from './update-username/frontend'

//
//
//
// Model
//
//
//

export const init: FrontendModule['init'] = ({ ctx }) => {
  const updateUsername = UpdateUsernameFrontend.init({ ctx })
  const initialModel: ModelFrontend = {
    profiles: {},
    requests: {},
    draft: {},
    updateUsername: updateUsername.model,
  }
  const model = initialModel

  if (ctx.currentScreen.n === 'profile' && ctx.currentScreen.t === 'profile') {
    return loadProfile(ctx.currentScreen.userId, model)
  }

  return { model }
}

//
//
//
// Update
//
//
//

export const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => {
      const updated = UpdateUsernameFrontend.update({
        ctx: input.ctx,
        msg: input.msg?.t === 'got-update-username-msg' ? input.msg.c : null,
        msgBackend: input.msgBackend?.t === 'got-update-username-msg' ? input.msgBackend.c : null,
        model: model.updateUsername,
        msgEvt: input.msgEvt,
      })
      return {
        model: { ...model, updateUsername: updated.model },
        msgCmd: AppFrontendCmd.tag('got-update-username-msg', updated.msgCmd),
        msgEvt: updated.msgEvt,
        eff: Eff.tag('got-update-username-msg', updated.eff),
      }
    },
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateFromBackend({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  const { model, msgCmd } = input

  if (!msgCmd) {
    return { model }
  }

  switch (msgCmd.c.t) {
    case 'add-profiles': {
      return {
        model: {
          ...model,
          profiles: {
            ...model.profiles,
            ...msgCmd.c.profiles,
          },
        },
      }
    }
    case 'open-profile': {
      return {
        model,
        msgCmd: [
          pushScreen({
            t: 'profile',
            n: 'profile',
            userId: msgCmd.c.userId,
          }),
        ],
      }
    }
  }
}

const updateFromEvent: FrontendModule['update'] = (input) => {
  const { msgEvt, model } = input

  if (!msgEvt) {
    return { model }
  }

  switch (msgEvt.t) {
    case 'screen-evt.screen-changed': {
      if (msgEvt.screen.n === 'profile' && msgEvt.screen.t === 'profile') {
        return loadProfile(msgEvt.screen.userId, model)
      }
      return {
        model,
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateFromBackend: FrontendModule['update'] = (input) => {
  const { model, msgBackend } = input

  if (!msgBackend) {
    return { model }
  }

  switch (msgBackend.t) {
    case 'current-user-profile': {
      if (isErr(msgBackend.result)) {
        return {
          model,
        }
      }

      const profile = msgBackend.result.value

      const modelNew: ModelFrontend = {
        ...model,
        profiles: {
          ...model.profiles,
          [profile.userId]: profile,
        },
      }

      return {
        model: modelNew,
        msgEvt: [
          {
            t: 'profile-evt.current-user-profile',
            profile,
          },
        ],
      }
    }

    case 'got-update-username-msg': {
      return { model: input.model }
    }

    default: {
      if (isErr(msgBackend.result)) {
        return {
          model: {
            ...model,
            requests: {
              ...model.requests,
              [msgBackend.t]: msgBackend.result,
            },
          },
        }
      }

      const profilesNew = msgBackend.result.value.reduce<ModelFrontend['profiles']>((acc, profile) => {
        return {
          ...acc,
          [profile.userId]: profile,
        }
      }, model.profiles)

      const modelNew: ModelFrontend = {
        ...model,
        profiles: profilesNew,
      }

      return {
        model: modelNew,
      }
    }
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  const { msg, model, ctx } = input

  if (!msg) {
    return { model }
  }

  if (!ctx.currentUserId) {
    return { model }
  }

  switch (msg.t) {
    case 'inputted-username': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            username: msg.username,
          },
        },
      }
    }

    case 'inputted-avatar-seed': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            avatarSeed: ProfileAvatar.toSeed(msg.seed),
          },
        },
      }
    }

    case 'inputted-avatar-style': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            avatarStyle: msg.style,
          },
        },
      }
    }

    case 'clicked-generate-random-seed': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
          },
        },
      }
    }

    case 'clicked-back-button': {
      switch (msg.from.t) {
        case 'profile': {
          return {
            model,
            msgCmd: [back()],
          }
        }

        case 'profile-update': {
          return {
            model,
            msgCmd: [
              replaceScreen({
                n: 'profile',
                t: 'profile',
                userId: ctx.currentUserId,
              }),
            ],
          }
        }

        case 'profile-avatar': {
          return {
            model,
            msgCmd: [
              replaceScreen({
                n: 'profile',
                t: 'profile-edit',
              }),
            ],
          }
        }

        case 'profile-update-username': {
          return {
            model,
            msgCmd: [
              replaceScreen({
                n: 'profile',
                t: 'profile-edit',
              }),
            ],
          }
        }
      }
    }

    case 'clicked-logout-button': {
      return {
        model,
        msgCmd: [logout()],
      }
    }

    case 'clicked-update-username-button': {
      return {
        model,
        msgCmd: [
          pushScreen(
            {
              n: 'profile',
              t: 'profile-edit-username',
            },
            true,
          ),
        ],
      }
    }

    case 'clicked-edit-profile-button': {
      return {
        model,
        msgCmd: [
          pushScreen(
            {
              n: 'profile',
              t: 'profile-edit',
            },
            true,
          ),
        ],
      }
    }

    case 'clicked-avatar':
    case 'clicked-change-avatar-button': {
      return {
        model,
        msgCmd: [
          pushScreen(
            {
              n: 'profile',
              t: 'profile-edit-avatar',
            },
            true,
          ),
        ],
      }
    }

    default: {
      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg.t]: {
              t: 'loading',
            },
          },
        },
        toBackend: [msg],
      }
    }
  }
}

const loadProfile = (userId: UserId, model: ModelFrontend): ReturnType<FrontendModule['update']> => {
  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
        'find-one': Loading,
      },
    },
    msgCmd: [
      sendToBackend({
        t: 'find-one',
        userId,
      }),
    ],
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'profile': {
      switch (input.ctx.currentScreen.t) {
        case 'profile': {
          return (
            <ProfileScreen.View
              model={input.model}
              ctx={input.ctx}
              dispatch={input.dispatch}
              userId={input.ctx.currentScreen.userId}
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
            <UpdateUsernameFrontend.View
              ctx={input.ctx}
              model={input.model.updateUsername}
              dispatch={(c) => input.dispatch({ t: 'got-update-username-msg', c })}
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
