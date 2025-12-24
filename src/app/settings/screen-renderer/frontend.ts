import { Eff } from '~/@/eff'
import { MenuItem } from '~/@/ui/menu-item'
import { RadioInputIcon } from '~/@/ui/radio-input'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { sx } from '~/@/vdom/style/sx'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { back } from '~/app/frontend/current-screen/current-screen-cmd'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { type ModelFrontend, type MsgFrontend } from './types'

const init = (input: { ctx: AppFrontendCtxBase }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      render_vDomImpl: input.ctx.vdomImpl,
      render_vDomImplInitial: input.ctx.vdomImpl,
    },
  }
}

const update = (input: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg?.t) {
    case 'renderer_clickedBackButton': {
      return { model: input.model, eff: back() }
    }

    case 'renderer_clickedRenderer': {
      const vDomImpl = input.msg.vDomImpl
      return {
        model: {
          ...input.model,
          render_vDomImpl: vDomImpl,
        },
        eff: Eff.batch([
          playSound(APP_SOUND.tap),
          () => {
            VDomImplWeb.swapVDomEngine.pub(vDomImpl)
          },
        ]),
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

const View = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
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
