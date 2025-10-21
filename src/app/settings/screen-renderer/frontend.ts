import { Eff } from '~/@/eff'
import { MenuItem } from '~/@/ui/menu-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { sx } from '~/@/vdom/style/sx'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { APP_SOUND } from '../../@/frontend/app-sound'
import type { FrontendModule } from '../types'
import { isMsgFrontend, ModelFrontend, MsgFrontend } from './types'

const init = (input: { ctx: AppFrontendCtxBase }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      render_vDomImpl: input.ctx.vdomImpl,
      render_vDomImplInitial: input.ctx.vdomImpl,
    },
  }
}

const update = <T extends ModelFrontend>(input: {
  ctx: AppFrontendCtxBase
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  if (!isMsgFrontend(input.msg)) return { model: input.model }

  switch (input.msg?.t) {
    case 'renderer_clickedBackButton': {
      return { model: input.model, msgOut: [BackScreenCmd.init()] }
    }

    case 'renderer_clickedRenderer': {
      const vDomImpl = input.msg.vDomImpl
      return {
        model: {
          ...input.model,
          render_vDomImpl: vDomImpl,
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
        onPress: () => input.dispatch({ t: 'renderer_clickedBackButton' }),
      },
    },
    renderBody: () =>
      h(
        ScrollBox,
        { style: sx({ flexDirection: 'col', flex: 1 }) },
        VDomImplWeb.VISIBLE.map((vDomImpl) => {
          const isSelected = vDomImpl === input.model.render_vDomImpl
          const isDefault = vDomImpl === input.model.render_vDomImplInitial
          return h(MenuItem, {
            key: vDomImpl,
            primary: VDomImplWeb.toName(vDomImpl),
            secondary: isDefault && false ? input.ctx.t('l18n.default') : undefined,
            onPress: () => input.dispatch({ t: 'renderer_clickedRenderer', vDomImpl }),
            renderEnd: () =>
              h(RadioInputIcon, {
                style: sx({ size: 7, textColor: 'white' }),
                status: isSelected ? 'selected' : 'unselected',
              }),
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
