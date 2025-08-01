import { MenuItem } from '~/@/ui/menu-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import type { FrontendModule } from '../types'
import { ModelFrontend } from './types'

const init = (input: { ctx: AppFrontendCtxBase }): { model: ModelFrontend } => {
  return {
    model: {
      renderVDomImpl: input.ctx.vdomImpl,
      renderVDomImplInitial: input.ctx.vdomImpl,
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
          VDomImplWeb.swapVDomEngine.pub(vDomImpl)
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

export const TEST_ID_RENDERER_SCREEN = 'settings/renderer-screen'

const View: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    id: 'setting-renderer',
    dataTestId: TEST_ID_RENDERER_SCREEN,
    ctx: input.ctx,
    parentScreen: input.ctx.parentScreen,
    navBar: {
      title: input.ctx.t('l18n.renderer'),
      back: {
        onPress: () => input.dispatch({ t: 'renderer.clicked-back-button' }),
      },
    },
    renderBody: () =>
      h(
        ScrollBox,
        { class: 'flex flex-1 flex-col' },
        VDomImplWeb.VISIBLE.map((vDomImpl) => {
          const isSelected = vDomImpl === input.model.renderVDomImpl
          const isDefault = vDomImpl === input.model.renderVDomImplInitial
          return h(MenuItem, {
            key: vDomImpl,
            primary: VDomImplWeb.toName(vDomImpl),
            secondary: isDefault && false ? input.ctx.t('l18n.default') : undefined,
            onPress: () => input.dispatch({ t: 'renderer.clicked-renderer', vDomImpl }),
            end: () =>
              h(RadioInputIcon, { class: 'size-7 text-white', status: isSelected ? 'selected' : 'unselected' }),
            selected: isSelected,
          })
        }),
      ),
  })
}

export const ScreenRendererFrontend = {
  init,
  update,
  View,
}
