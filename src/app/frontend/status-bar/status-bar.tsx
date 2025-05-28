import { Translator as StatusBarFrontend } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { APP_SOUND, StatusBarCmd } from '../../@/frontend/cmd'

export type Model = {
  isOpen: boolean
}

export const init = (_input: { stored: Record<string, unknown> | null }): { model: Model } => {
  return {
    model: {
      isOpen: false,
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
  msgOut?: unknown[]
} => {
  switch (input.msg?.t) {
    case 'clicked-status-bar': {
      return { model: { ...input.model, isOpen: !input.model.isOpen }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'closed-status-bar-drawer': {
      return { model: { ...input.model, isOpen: false }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }
  }

  switch (input.msgCmd?.t) {
    case 'status-bar': {
      switch (input.msgCmd.c.t) {
        case 'close': {
          return { model: { ...input.model, isOpen: false } }
        }
      }
    }
  }

  return { model: input.model }
}

export const View = (props: {
  slots: {
    topBar: (props: { onClick: () => void }) => VDom
    surfaceContent: VDom
  }
  ctx: {
    t: StatusBarFrontend
    screenSize: ScreenSize
  }
  model: Model
  dispatch: (m: Msg) => void
}) => {
  return (
    <SurfaceLayout
      ctx={props.ctx}
      ariaLabel={props.ctx.t('status-bar.status-bar')}
      drawer={{
        position: 'top',
      }}
      dropDown={{
        reference: props.slots.topBar({ onClick: () => props.dispatch({ t: 'clicked-status-bar' }) }),
      }}
      id='status-bar-drawer'
      open={props.model.isOpen}
      onClose={() => props.dispatch({ t: 'closed-status-bar-drawer' })}
      body={{
        render: () => props.slots.surfaceContent,
      }}
    />
  )
}
