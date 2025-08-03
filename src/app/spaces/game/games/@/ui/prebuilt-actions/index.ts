import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeftOnRect, IconArrowRightCircle, IconArrowRotateLeft, IconChevronLeft } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'

type PrebuiltActionInput = Partial<ScreenAction> & {
  onPress: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

const exit = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.exit'),
  renderIcon: (input) => h(IconArrowLeftOnRect, input),
  label: input.ctx.t('prebuilt-actions.exit'),
})

const next = (input: PrebuiltActionInput): ScreenAction => ({
  id: input.ctx.t('prebuilt-actions.next'),
  // icon: (input) => h(IconChevronRight, input),
  renderIcon: (input) => h(IconArrowRightCircle, input),
  label: input.ctx.t('prebuilt-actions.next'),
  ...input,
})

const reset = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.reset'),
  renderIcon: (input) => h(IconArrowRotateLeft, input),
  label: input.ctx.t('prebuilt-actions.reset'),
})

const prev = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  id: input.ctx.t('prebuilt-actions.prev'),
  renderIcon: (input) => h(IconChevronLeft, input),
  label: input.ctx.t('prebuilt-actions.prev'),
})

export const PrebuiltActions = {
  exit,
  next,
  reset,
  prev,
}
