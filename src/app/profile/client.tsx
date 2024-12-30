import { TranslatedText } from '~/@/l18n'
import { Loading, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { AppClientModule } from '~/app/@/architecture/app-client'
import {
  type AnonymousClientCtx,
  type AppClientCmd,
  type AppClientCtx,
  type ClientEvt,
  type ProfileCmd,
  back,
  logout,
  pushRoute,
  replaceRoute,
  sendToServer
} from '~/app/@/client'
import { Avatar, Button, IconChevronRight, TopBar, Typography } from '~/app/@/ui'
import { ProfileAvatar } from '../@/data/profile-avatar'
import { UserId } from '../@/data/user-id'
import { ViewProfileScreen } from './profile-client/profile-client-view-profile-screen'
import { ViewUpdateAvatarScreen } from './profile-client/profile-client-view-update-avatar-screen'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from './types'
import * as UpdateUsernameClient from './update-username/update-username.client'

//
//
//
//
//
//
//

type Ctx = AppClientCtx | AnonymousClientCtx

type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: Ctx
  MsgCmdIn: ProfileCmd
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgEvtOut: ClientEvt
  ViewSlot: {
    bottomBar: null
  }
}>

//
//
//
// Model
//
//
//

export const init: ClientModule['init'] = ({ ctx }) => {
  const initialModel: ModelClient = {
    profiles: {},
    requests: {},
    draft: {}
  }

  const model = initialModel

  if (ctx.currentRoute.n === 'profile' && ctx.currentRoute.t === 'profile') {
    return loadProfile(ctx.currentRoute.userId, model)
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

export const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    (model) =>
      UpdateUsernameClient.update({
        ctx: input.ctx,
        msg: input.msg && 'n' in input?.msg && input.msg.n === 'profile.update-username' ? input.msg : null,
        model,
        msgEvt: input.msgEvt
      }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromMsg({ ...input, model })
  )
}

const updateFromCmd: ClientModule['update'] = (input) => {
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
            ...msgCmd.c.profiles
          }
        }
      }
    }
    case 'open-profile': {
      return {
        model,
        msgCmd: [
          pushRoute({
            t: 'profile',
            n: 'profile',
            userId: msgCmd.c.userId
          })
        ]
      }
    }
  }
}

const updateFromEvent: ClientModule['update'] = (input) => {
  const { msgEvt, model } = input

  if (!msgEvt) {
    return { model }
  }

  switch (msgEvt.t) {
    case 'routing/route-changed': {
      if (msgEvt.route.n === 'profile' && msgEvt.route.t === 'profile') {
        return loadProfile(msgEvt.route.userId, model)
      }
      return {
        model
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromServer: ClientModule['update'] = (input) => {
  const { model, msgServer } = input

  if (!msgServer) {
    return { model }
  }

  switch (msgServer.t) {
    case 'current-user-profile': {
      if (isErr(msgServer.result)) {
        return {
          model
        }
      }

      const profile = msgServer.result.value

      const modelNew: ModelClient = {
        ...model,
        profiles: {
          ...model.profiles,
          [profile.userId]: profile
        }
      }

      return {
        model: modelNew,
        msgEvt: [
          {
            t: 'profile/current-user-profile',
            profile
          }
        ]
      }
    }

    case 'profile.update-username.updated-username': {
      return { model }
    }

    default: {
      if (isErr(msgServer.result)) {
        return {
          model: {
            ...model,
            requests: {
              ...model.requests,
              [msgServer.t]: msgServer.result
            }
          }
        }
      }

      const profilesNew = msgServer.result.value.reduce<ModelClient['profiles']>((acc, profile) => {
        return {
          ...acc,
          [profile.userId]: profile
        }
      }, model.profiles)

      const modelNew: ModelClient = {
        ...model,
        profiles: profilesNew
      }

      return {
        model: modelNew
      }
    }
  }
}

const updateFromMsg: ClientModule['update'] = (input) => {
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
            username: msg.username
          }
        }
      }
    }

    case 'inputted-avatar-seed': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            avatarSeed: ProfileAvatar.toSeed(msg.seed)
          }
        }
      }
    }

    case 'inputted-avatar-style': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            avatarStyle: msg.style
          }
        }
      }
    }

    case 'clicked-generate-random-seed': {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft
          }
        }
      }
    }

    case 'clicked-back-button': {
      switch (msg.from.t) {
        case 'profile': {
          return {
            model,
            msgCmd: [back()]
          }
        }

        case 'profile-update': {
          return {
            model,
            msgCmd: [
              replaceRoute({
                n: 'profile',
                t: 'profile',
                userId: ctx.currentUserId
              })
            ]
          }
        }

        case 'profile-avatar': {
          return {
            model,
            msgCmd: [
              replaceRoute({
                n: 'profile',
                t: 'profile-edit'
              })
            ]
          }
        }

        case 'profile-update-username': {
          return {
            model,
            msgCmd: [
              replaceRoute({
                n: 'profile',
                t: 'profile-edit'
              })
            ]
          }
        }
      }
    }

    case 'clicked-logout-button': {
      return {
        model,
        msgCmd: [logout()]
      }
    }

    case 'clicked-update-username-button': {
      return {
        model,
        msgCmd: [
          pushRoute(
            {
              n: 'profile',
              t: 'profile-edit-username'
            },
            true
          )
        ]
      }
    }

    case 'clicked-edit-profile-button': {
      return {
        model,
        msgCmd: [
          pushRoute(
            {
              n: 'profile',
              t: 'profile-edit'
            },
            true
          )
        ]
      }
    }

    case 'clicked-avatar':
    case 'clicked-change-avatar-button': {
      return {
        model,
        msgCmd: [
          pushRoute(
            {
              n: 'profile',
              t: 'profile-edit-avatar'
            },
            true
          )
        ]
      }
    }

    default: {
      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg.t]: {
              t: 'loading'
            }
          }
        },
        toServer: [msg]
      }
    }
  }
}

const loadProfile = (userId: UserId, model: ModelClient): ReturnType<ClientModule['update']> => {
  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
        'find-one': Loading
      }
    },
    msgCmd: [
      sendToServer({
        t: 'find-one',
        userId
      })
    ]
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: ClientModule['subscriptions'] = (_input) => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View: ClientModule['View'] = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'profile': {
      switch (input.ctx.currentRoute.t) {
        case 'profile': {
          return (
            <div className='relative flex h-full w-full flex-col'>
              <ViewProfileScreen
                model={input.model}
                ctx={input.ctx}
                dispatch={input.dispatch}
                userId={input.ctx.currentRoute.userId}
              />

              {input.slots?.bottomBar(null)}
            </div>
          )
        }

        case 'profile-edit': {
          return <ViewUpdateScreen ctx={input.ctx} dispatch={input.dispatch} />
        }

        case 'profile-edit-avatar': {
          return <ViewUpdateAvatarScreen ctx={input.ctx} model={input.model} dispatch={input.dispatch} />
        }

        case 'profile-edit-username': {
          return <UpdateUsernameClient.View {...input} />
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

const ViewUpdateScreen = (input: { ctx: Ctx; dispatch: (m: MsgClient) => void }) => {
  if (!input.ctx.currentUserId) {
    return null
  }

  const profile = input.ctx.profiles[input.ctx.currentUserId]

  if (!profile) {
    return null
  }

  return (
    <div className='flex h-full w-full flex-col items-center'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'clicked-back-button',
            from: {
              t: 'profile-update'
            }
          })
        }
        title={input.ctx.t('profile.update-profile')}
      />

      <div className='flex w-full flex-col items-center gap-4 p-4'>
        <Avatar
          src={profile?.avatarUrl}
          className='h-28 w-28'
          alt='profile avatar'
          onClick={() =>
            input.dispatch({
              t: 'clicked-avatar'
            })
          }
        />

        <Button
          size='sm'
          color='primary'
          variant='text'
          className='block'
          onClick={() =>
            input.dispatch({
              t: 'clicked-change-avatar-button'
            })
          }
          text={input.ctx.t('profile.update-avatar')}
        />
      </div>

      <ViewField
        onClick={() =>
          input.dispatch({
            t: 'clicked-update-username-button'
          })
        }
        label={input.ctx.t('username-title')}
        value={input.ctx.t('username', profile.username)}
      />
    </div>
  )
}

const ViewField = ({
  label,
  value,
  onClick
}: {
  label: TranslatedText
  value: TranslatedText
  onClick?: () => void
}) => (
  <button onClick={onClick} className='flex w-full items-center justify-start px-4 py-2'>
    <div className='flex flex-1 flex-col items-start'>
      <Typography variant='label' text={label} />
      {value && <Typography variant='body' text={value} />}
    </div>

    <IconChevronRight className='h-6 w-6' />
  </button>
)

// const ViewUpdateUsernameScreen = (input: { model: ModelClient; dispatch: (msg: MsgClient) => void; ctx: Ctx }) => {
//   const currentUsername = input.ctx.currentUserId ? input.model.profiles[input.ctx.currentUserId]?.username : null

//   const inputVal = input.model.draft?.username ?? currentUsername ?? ''
//   return (
//     <div className='flex h-full w-full flex-col'>
//       <TopBar
//         onBack={() =>
//           input.dispatch({
//             t: 'clicked-back-button',
//             from: {
//               t: 'profile-update-username'
//             }
//           })
//         }
//         title={input.ctx.t('username-title')}
//         ctx={input.ctx}
//       />

//       <div className='w-full p-4'>
//         <TextField
//           label='Username'
//           value={inputVal}
//           id={'username'}
//           onChange={(username) =>
//             input.dispatch({
//               t: 'inputted-username',
//               username
//             })
//           }
//         />
//       </div>
//     </div>
//   )
// }
