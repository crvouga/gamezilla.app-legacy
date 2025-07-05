import { Clickable } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { CloseAppBarCmd } from '~/app/@/frontend/close-app-bar-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { AuthFrontend } from '~/app/auth/frontend'
import { SettingsFrontend } from '~/app/settings/frontend'
import { WireFrontend } from '~/app/wire/frontend'
import { AppFrontendCtxBase } from '../../@/frontend/ctx'
import { SurfaceLayout } from '../../@/ui/surface/layout/surface-layout'
import { SoundFrontend } from '../../settings/sound'
import * as AppTypes from '../../types'

export const TEST_ID = {
  OPEN_BUTTON: 'app-bar/open-button',
  DROP_DOWN_SURFACE: 'app-bar/drop-down-surface',
}

export type Msg = { t: 'clicked-app-bar' } | { t: 'closed-surface' }

export type Model = {
  isOpen: boolean
}

export const init = (): { model: Model } => {
  return { model: { isOpen: false } }
}

export const update = (input: {
  ctx: AppFrontendCtxBase
  model: Model
  msg: Msg | null
  msgIn?: unknown
}): { model: Model; msgOut?: unknown[] } => {
  if (CloseAppBarCmd.is(input.msgIn)) {
    return { model: { isOpen: false } }
  }

  switch (input.msg?.t) {
    case 'clicked-app-bar': {
      const isOpenNew = !input.model.isOpen
      return { model: { isOpen: isOpenNew }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }
    case 'closed-surface': {
      return { model: { isOpen: false } }
    }
    default: {
      return { model: input.model }
    }
  }
}

export const View = (props: {
  ctx: AppFrontendCtxBase
  model: AppTypes.ModelFrontend
  dispatch: (c: AppTypes.MsgFrontend) => void
}) => {
  const iconSize = props.ctx.screenSize === 'mobile' ? 'size-3' : 'size-4'

  return h('div', { class: cn(props.ctx.screenSize === 'mobile' ? 'w-full' : 'fixed top-0 right-0 z-10 w-fit') }, [
    SurfaceLayout({
      ctx: props.ctx,
      ariaLabel: props.ctx.t('status-bar.status-bar'),
      drawer: {
        position: 'top',
      },
      id: 'status-bar-drawer',
      open: props.model.frontend.appBar.isOpen,
      onClose: () => props.dispatch({ t: 'frontend', c: { t: 'app-bar', c: { t: 'closed-surface' } } }),
      dropDown: {
        reference: {
          render: () =>
            h(
              Clickable,
              {
                dataTestId: TEST_ID.OPEN_BUTTON,
                class: cn(
                  props.ctx.screenSize === 'mobile'
                    ? 'flex w-full items-center justify-end gap-3 px-3 py-1'
                    : 'flex w-fit justify-center gap-4 px-6 py-3 pl-8',
                ),
                'aria-label': props.ctx.t('app.open-settings'),
                onClick: () => props.dispatch({ t: 'frontend', c: { t: 'app-bar', c: { t: 'clicked-app-bar' } } }),
              },
              [
                h(WireFrontend.ViewDot, { ctx: props.ctx, model: props.model.wire, class: iconSize }),
                h(SoundFrontend.ViewIcon, { model: props.model.settings.sound, class: iconSize }),
                h(AuthFrontend.ViewLogoutIcon, { model: props.model.auth, ctx: props.ctx, class: iconSize }),
              ],
            ),
        },
      },
      body: {
        render: () =>
          h('div', { 'data-testid': TEST_ID.DROP_DOWN_SURFACE }, [
            h(WireFrontend.ViewListItem, {
              model: props.model.wire,
              dispatch: (c) => props.dispatch({ t: 'wire', c }),
              ctx: props.ctx,
            }),

            h(SoundFrontend.ViewSoundListItem, {
              ctx: props.ctx,
              model: props.model.settings.sound,
              dispatch: (c) => props.dispatch({ t: 'settings', c: { t: 'sound', c } }),
            }),

            h(AuthFrontend.ViewLogoutListItem, {
              model: props.model.auth,
              dispatch: (c) => props.dispatch({ t: 'auth', c }),
              ctx: props.ctx,
            }),

            h(SettingsFrontend.ViewLangListItem, {
              ctx: props.ctx,
              dispatch: (c) => props.dispatch({ t: 'settings', c }),
              model: props.model.settings,
            }),

            h(SettingsFrontend.ViewSettingsListItem, {
              ctx: props.ctx,
              dispatch: (c) => props.dispatch({ t: 'settings', c }),
              model: props.model.settings,
            }),
          ]),
      },
    }),
  ])
}
