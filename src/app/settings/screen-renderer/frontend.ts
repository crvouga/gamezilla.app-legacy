import { ListItem } from '~/@/ui/list-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h, VDomEngine } from '~/@/vdom/h'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import type { FrontendModule } from '../types'
import { ModelFrontend } from './types'

const TEST_ID = {
  RENDERER_SCREEN_OPEN_BUTTON: 'settings/renderer-screen-open-button',
  RENDERER_SCREEN: 'settings/renderer-screen',
  RENDERER_MENU_ITEM: (vDomImpl: VDomImpl) => `settings/renderer-menu-item-${vDomImpl}`,
}

const init = (): { model: ModelFrontend } => {
  const initialVDomImpl = VDomImpl.getUrl()

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
      return { model: input.model, msgOut: [BackScreenCmd.init()] }
    }

    case 'renderer.clicked-renderer': {
      const vDomImpl = input.msg.vDomImpl
      return {
        model: {
          ...input.model,
          renderVDomImpl: vDomImpl,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff() {
          VDomEngine.event.pub({ t: 'changed-vdom-impl', vdomImpl: vDomImpl })
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
    id: 'setting-renderer',
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
      h(
        'div',
        { class: 'flex flex-1 flex-col overflow-y-scroll' },
        VDomImpl.VISIBLE.map((vDomImpl) => {
          const isSelected = vDomImpl === input.model.renderVDomImpl
          const isDefault = vDomImpl === input.model.renderVDomImplInitial
          return h(ListItem, {
            key: vDomImpl,
            primary: VDomImpl.toName(vDomImpl),
            secondary: isDefault && false ? input.ctx.t('l18n.default') : undefined,
            dataTestId: TEST_ID.RENDERER_MENU_ITEM(vDomImpl),
            onClick: () => input.dispatch({ t: 'renderer.clicked-renderer', vDomImpl }),
            end: () => RadioInputIcon({ class: 'size-7', status: isSelected ? 'selected' : 'unselected' }),
            selected: isSelected,
          })
        }),
      ),
  })
}

export const ScreenRendererFrontend = {
  init,
  update,
  TEST_ID,
  View,
}
