import { IconLanguage } from '~/@/ui/icon/icon-language'
import { cn } from '~/@/ui/cn'
import * as LangFrontend from '~/app/lang/frontend'
import { type ModelFrontend, type MsgFrontend } from '~/app/types'
import * as WireFrontend from '~/app/wire/frontend'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../../@/frontend/ctx'
import { StatusBarFrontend } from '../status-bar/index'
import { SoundFrontend } from '../sound'

export const ViewAppStatusBar = (input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: ModelFrontend
  dispatch: (c: MsgFrontend) => void
}) => {
  return (
    <div className={cn(input.ctx.screenSize === 'mobile' ? 'w-full' : 'fixed right-0 top-0 z-10 w-fit')}>
      <StatusBarFrontend.View
        ctx={input.ctx}
        model={input.model.frontend.statusBar}
        dispatch={(c) => input.dispatch({ t: 'frontend', c: { t: 'status-bar', c } })}
        slots={{
          topBar: (props) => {
            const iconSize = input.ctx.screenSize === 'mobile' ? 'size-3' : 'size-4'
            return (
              <button
                {...props}
                type='button'
                className={cn(
                  input.ctx.screenSize === 'mobile'
                    ? 'flex w-full items-center justify-end gap-3 px-3 py-1'
                    : 'flex w-fit justify-center gap-4 px-6 py-3 pl-8',
                )}
                aria-label={input.ctx.t('app.open-settings')}
              >
                <WireFrontend.ViewDot ctx={input.ctx} model={input.model.wire} className={iconSize} />
                <IconLanguage className={iconSize} />
                <SoundFrontend.ViewIcon model={input.model.frontend.sound} className={iconSize} />
                {/* <IconGear className={iconSize} /> */}
              </button>
            )
          },
          surfaceContent: (
            <>
              <WireFrontend.ViewConnectionStatusListItem
                model={input.model.wire}
                dispatch={(c) => input.dispatch({ t: 'wire', c })}
                ctx={input.ctx}
              />

              <LangFrontend.ViewLangListItem
                ctx={input.ctx}
                dispatch={(c) => input.dispatch({ t: 'lang', c })}
                model={input.model.lang}
              />

              <SoundFrontend.ViewSoundListItem
                ctx={input.ctx}
                model={input.model.frontend.sound}
                dispatch={(c) => input.dispatch({ t: 'frontend', c: { t: 'sound', c } })}
              />
            </>
          ),
        }}
      />
    </div>
  )
}
