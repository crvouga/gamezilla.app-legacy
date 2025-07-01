import { RequestResponse } from '~/@/request-response/request-response'
import { TextField } from '~/@/ui/text-field'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FrontendModule } from './types'
import { h } from '~/@/vdom/h'

const init: FrontendModule['init'] = (input) => {
  return {
    model: {
      'profile.update-username.username': input.ctx.currentUser?.userId
        ? (input.ctx.profilesByUserId[input.ctx.currentUser?.userId]?.username ?? '')
        : '',
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'profile.update-username.clicked-back': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ t: 'profile-edit', n: 'profile' })],
      }
    }

    case 'profile.update-username.clicked-save': {
      return {
        model: {
          ...input.model,
          'profile-update-username.request': RequestResponse.startedRequest(input.ctx.now),
        },
      }
    }

    case 'profile.update-username.inputted-username': {
      return {
        model: {
          ...input.model,
          'profile.update-username.username': input.msg.username,
        },
      }
    }
  }

  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'profile-update-username',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('profile.update-username.update-username'),
      back: {
        onClick: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
      },
    },
    patchAction: {
      onSubmit: () => input.dispatch({ t: 'profile.update-username.clicked-save' }),
      submitText: input.ctx.t('app.save'),
      cancelText: input.ctx.t('app.cancel'),
      onCancel: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
      submitLoading: input.model['profile-update-username.request']?.t === 'loading',
      submitDisabled: false,
      cancelDisabled: false,
    },
    renderBody: () =>
      h('div', { className: 'flex w-full flex-col gap-4 p-4' }, [
        h(TextField, {
          id: 'username',
          label: input.ctx.t('username.username-label'),
          value: input.model['profile.update-username.username'] ?? '',
          onChange: (username) => input.dispatch({ t: 'profile.update-username.inputted-username', username }),
        }),
      ]),
  })
}

export const ScreenUpdateUsernameFrontend = {
  init,
  update,
  View,
}
