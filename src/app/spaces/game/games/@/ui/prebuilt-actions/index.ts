import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeftOnRect, IconArrowRightCircle, IconArrowRotateLeft, IconChevronLeft } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'

type PrebuiltActionInput = Partial<ScreenAction> & {
  onPressDown: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

const exit = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.exit'),
  icon: (input) => h(IconArrowLeftOnRect, input),
  label: input.ctx.t('prebuilt-actions.exit'),
})

const next = (input: PrebuiltActionInput): ScreenAction => ({
  id: input.ctx.t('prebuilt-actions.next'),
  // icon: (input) => h(IconChevronRight, input),
  icon: (input) => h(IconArrowRightCircle, input),
  label: input.ctx.t('prebuilt-actions.next'),
  ...input,
})

const reset = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.reset'),
  icon: (input) => h(IconArrowRotateLeft, input),
  label: input.ctx.t('prebuilt-actions.reset'),
})

const prev = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.prev'),
  icon: (input) => h(IconChevronLeft, input),
  label: input.ctx.t('prebuilt-actions.prev'),
})

export const PrebuiltActions = {
  exit,
  next,
  reset,
  prev,
}
