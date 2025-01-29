import { cn, IconGear } from '~/@/ui'
import * as LangFrontend from '~/app/lang/frontend'
import { type ModelFrontend, type MsgFrontend } from '~/app/types'
import * as WireFrontend from '~/app/wire/frontend'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../@/frontend/ctx'
import { Sound, StatusBar } from './index'

export const ViewAppStatusBar = (input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: ModelFrontend
  dispatch: (c: MsgFrontend) => void
}) => {
  return (
    <StatusBar.View
      ctx={input.ctx}
      model={input.model.statusBar}
      dispatch={(c) => input.dispatch({ t: 'status-bar', c })}
      slots={{
        topBar: (props) => {
          const SIZE_CLASS = input.ctx.screenSize === 'mobile' ? 'size-3' : 'size-4'
          const SPACING_CLASS = input.ctx.screenSize === 'mobile' ? 'gap-3 px-3 py-1' : 'gap-4 px-6 py-3'
          return (
            <div className='flex w-full items-center justify-end'>
              <button
                {...props}
                type='button'
                className={cn('flex w-fit items-center justify-center pl-8', SPACING_CLASS)}
                aria-label={input.ctx.t('app.open-settings')}
              >
                <WireFrontend.ViewDot ctx={input.ctx} model={input.model.wire} className={SIZE_CLASS} />
                {/* <Sound.ViewIcon model={input.model.sound} className={SIZE_CLASS} /> */}
                <IconGear className={SIZE_CLASS} />
              </button>
            </div>
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

            <Sound.ViewSoundListItem
              ctx={input.ctx}
              model={input.model.sound}
              dispatch={(c) => input.dispatch({ t: 'sound', c })}
            />
          </>
        ),
      }}
    />
  )
}
