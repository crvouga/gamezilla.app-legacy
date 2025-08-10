import { RequestResponse } from '~/@/request-response/request-response'
import { TextField } from '~/@/ui/text-field'
import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FrontendModule } from './types'

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
        onPress: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
      },
    },
    actionEdit: {
      onSubmit: () => input.dispatch({ t: 'profile.update-username.clicked-save' }),
      submitText: input.ctx.t('app.save'),
      cancelText: input.ctx.t('app.cancel'),
      onCancel: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
      submitLoading: input.model['profile-update-username.request']?.t === 'loading',
      submitDisabled: false,
      cancelDisabled: false,
    },
    renderBody: () =>
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 4, padding: 4 }) }, [
        h(TextField, {
          id: 'username',
          label: input.ctx.t('username.username-label'),
          value: input.model['profile.update-username.username'] ?? '',
          onChangeText: (username) => input.dispatch({ t: 'profile.update-username.inputted-username', username }),
        }),
      ]),
  })
}

export const ScreenUpdateUsernameFrontend = {
  init,
  update,
  View,
}
