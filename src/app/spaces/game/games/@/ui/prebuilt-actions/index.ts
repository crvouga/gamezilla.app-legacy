import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeftOnRect, IconArrowRightCircle, IconArrowRotateLeft, IconChevronLeft } from '~/@/ui/icon'
import { v } from '~/@/vdom/v'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'

type PrebuiltActionInput = Partial<ScreenAction> & {
  onClick: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

const exit = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.exit'),
  icon: (input) => v(IconArrowLeftOnRect, input),
  label: input.ctx.t('prebuilt-actions.exit'),
})

const next = (input: PrebuiltActionInput): ScreenAction => ({
  id: input.ctx.t('prebuilt-actions.next'),
  // icon: (input) => h(IconChevronRight, input),
  icon: (input) => v(IconArrowRightCircle, input),
  label: input.ctx.t('prebuilt-actions.next'),
  ...input,
})

const reset = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.reset'),
  icon: (input) => v(IconArrowRotateLeft, input),
  label: input.ctx.t('prebuilt-actions.reset'),
})

const prev = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.prev'),
  icon: (input) => v(IconChevronLeft, input),
  label: input.ctx.t('prebuilt-actions.prev'),
})

export const PrebuiltActions = {
  exit,
  next,
  reset,
  prev,
}
