import type { VDom } from '~/@/vdom/vdom'
import { APP_SOUND, AppFrontendCmd, playSound, StatusBarCmd } from '../../@/frontend/cmd'
import { Drawer } from '../../@/ui'
import { Translator } from '~/@/l18n/generated'

export type Model = {
  isDrawerOpen: boolean
}

export const init = (_input: { stored: Record<string, unknown> | null }): { model: Model } => {
  return {
    model: {
      isDrawerOpen: false,
    },
  }
}

export type Msg = { t: 'clicked-status-bar' } | { t: 'closed-status-bar-drawer' }

export const update = (input: {
  model: Model
  msg?: Msg | null
  msgCmd?: StatusBarCmd | null
}): {
  model: Model
  msgCmd?: AppFrontendCmd<never>[]
} => {
  switch (input.msg?.t) {
    case 'clicked-status-bar': {
      return {
        model: {
          ...input.model,
          isDrawerOpen: true,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'closed-status-bar-drawer': {
      return {
        model: {
          ...input.model,
          isDrawerOpen: false,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
  }

  switch (input.msgCmd?.t) {
    case 'status-bar': {
      switch (input.msgCmd.c.t) {
        case 'close': {
          return {
            model: {
              ...input.model,
              isDrawerOpen: false,
            },
          }
        }
      }
    }
  }

  return { model: input.model }
}

export const View = ({
  model,
  dispatch,
  slots,
  ctx,
}: {
  slots: {
    barLeft: VDom
    barRight: VDom
    drawerContent: VDom
  }
  ctx: {
    t: Translator
  }
  model: Model
  dispatch: (m: Msg) => void
}) => {
  return (
    <div className='w-full'>
      <button
        type='button'
        aria-label='open status bar'
        className='text-secondary flex w-full items-center gap-2 p-0.5 px-2 text-xs'
        onClick={() => dispatch({ t: 'clicked-status-bar' })}
      >
        {slots.barLeft}

        <div className='flex-1' />

        {slots.barRight}
      </button>

      <Drawer
        ariaLabel={ctx.t('status-bar.status-bar')}
        position='top'
        id='status-bar-drawer'
        open={model.isDrawerOpen}
        onClose={() =>
          dispatch({
            t: 'closed-status-bar-drawer',
          })
        }
      >
        {slots.drawerContent}
      </Drawer>
    </div>
  )
}
