import { replaceQueryParam } from '~/@/browser/browser'
import { Gutter } from '~/@/ui/gutter'
import { ListItemButton } from '~/@/ui/list-item-button'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { ReplaceScreenCmd } from '../../@/frontend/replace-screen-cmd.$msg'
import type { FrontendModule } from '../types'
import { ModelFrontend } from './types'

const TEST_ID = {
  RENDERER_SCREEN_OPEN_BUTTON: 'settings/renderer-screen-open-button',
  RENDERER_SCREEN: 'settings/renderer-screen',
  RENDERER_MENU_ITEM: (vDomImpl: VDomImpl) => `settings/renderer-menu-item-${vDomImpl}`,
}

const init = (): { model: ModelFrontend } => {
  const initialVDomImpl = VDomImpl.readFromUrl({ fallback: 'snabbdom' })

  return {
    model: {
      renderVDomImpl: initialVDomImpl,
      renderVDomImplInitial: initialVDomImpl,
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg?.t) {
    case 'renderer.clicked-back-button': {
      return {
        model: input.model,
        msgOut: [ReplaceScreenCmd.init({ t: 'main', n: 'settings' }, true)],
      }
    }

    case 'renderer.clicked-renderer': {
      const vDomImpl = input.msg.vDomImpl
      return {
        model: {
          ...input.model,
          vDomImpl,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          replaceQueryParam('vdom', vDomImpl)(dispatch)
          await new Promise((resolve) => setTimeout(resolve, 100))
          window.location.reload()
        },
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const View: FrontendModule['View'] = (input) => {
  return ScreenLayout({
    id: 'setting-choose-renderer',
    dataTestId: TEST_ID.RENDERER_SCREEN,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.renderer'),
      back: {
        onClick: () => input.dispatch({ t: 'renderer.clicked-back-button' }),
      },
    },
    renderBody: () =>
      h('div', { class: 'flex flex-1 flex-col overflow-y-scroll' }, [
        ...VDomImpl.ALL.filter((vDomImpl) => !VDomImpl.HIDDEN.includes(vDomImpl)).map((vDomImpl) => {
          const isSelected = vDomImpl === input.model.renderVDomImpl
          const isDefault = vDomImpl === input.model.renderVDomImplInitial
          return h(ListItemButton, {
            key: vDomImpl,
            primary: VDomImpl.toName(vDomImpl),
            secondary: isDefault && false ? input.ctx.t('l18n.default') : undefined,
            dataTestId: TEST_ID.RENDERER_MENU_ITEM(vDomImpl),
            onClick: () => input.dispatch({ t: 'renderer.clicked-renderer', vDomImpl }),
            end: () => h(RadioInputIcon, { class: 'size-7', status: isSelected ? 'selected' : 'unselected' }),
          })
        }),
        Gutter({ variant: 'screen' }),
      ]),
  })
}

export const ScreenRendererFrontend = {
  init,
  update,
  TEST_ID,
  View,
}
