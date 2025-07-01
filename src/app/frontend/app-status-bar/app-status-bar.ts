import { Clickable } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { Frag } from '~/@/ui/frag'
import { v } from '~/@/vdom/v'
import { AuthFrontend } from '~/app/auth/frontend'
import { LangFrontend } from '~/app/lang/frontend'
import { type ModelFrontend, type MsgFrontend } from '~/app/types'
import { WireFrontend } from '~/app/wire/frontend'
import { AppFrontendCtxBase } from '../../@/frontend/ctx'
import { SoundFrontend } from '../sound'
import { StatusBarFrontend } from '../status-bar/index'

export const ViewAppStatusBar = (input: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (c: MsgFrontend) => void
}) => {
  return v(
    'div',
    {
      class: cn(input.ctx.screenSize === 'mobile' ? 'w-full' : 'fixed top-0 right-0 z-10 w-fit'),
    },
    [
      v(StatusBarFrontend.View, {
        ctx: input.ctx,
        model: input.model.frontend.statusBar,
        dispatch: (c) => input.dispatch({ t: 'frontend', c: { t: 'status-bar', c } }),
        slots: {
          topBar: (props) => {
            const iconSize = input.ctx.screenSize === 'mobile' ? 'size-3' : 'size-4'
            return v(
              Clickable,
              {
                ...props,
                class: cn(
                  input.ctx.screenSize === 'mobile'
                    ? 'flex w-full items-center justify-end gap-3 px-3 py-1'
                    : 'flex w-fit justify-center gap-4 px-6 py-3 pl-8',
                ),
                'aria-label': input.ctx.t('app.open-settings'),
              },
              [
                v(WireFrontend.ViewDot, {
                  ctx: input.ctx,
                  model: input.model.wire,
                  class: iconSize,
                }),
                v(SoundFrontend.ViewIcon, {
                  model: input.model.frontend.sound,
                  class: iconSize,
                }),
                v(AuthFrontend.ViewLogoutIcon, {
                  model: input.model.auth,
                  ctx: input.ctx,
                  class: iconSize,
                }),
              ],
            )
          },
          surfaceContent: v(Frag, null, [
            v(WireFrontend.ViewListItem, {
              model: input.model.wire,
              dispatch: (c) => input.dispatch({ t: 'wire', c }),
              ctx: input.ctx,
            }),

            v(AuthFrontend.ViewLogoutListItem, {
              model: input.model.auth,
              dispatch: (c) => input.dispatch({ t: 'auth', c }),
              ctx: input.ctx,
            }),

            v(LangFrontend.ViewLangListItem, {
              ctx: input.ctx,
              dispatch: (c) => input.dispatch({ t: 'lang', c }),
              model: input.model.lang,
            }),

            v(SoundFrontend.ViewSoundListItem, {
              ctx: input.ctx,
              model: input.model.frontend.sound,
              dispatch: (c) => input.dispatch({ t: 'frontend', c: { t: 'sound', c } }),
            }),
          ]),
        },
      }),
    ],
  )
}
