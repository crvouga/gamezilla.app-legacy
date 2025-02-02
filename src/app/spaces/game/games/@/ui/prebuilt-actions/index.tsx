import type { Translator } from '~/@/l18n/generated'
import { IconArrowCircle, IconArrowLeftOnRect, IconArrowRotateLeft, IconChevronLeft } from '~/@/ui'
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
  icon: (input) => <IconArrowLeftOnRect {...input} />,
  label: input.ctx.t('prebuilt-actions.exit'),
})

const next = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  // icon: (input) => <IconChevronRight {...input} />,
  icon: (input) => <IconArrowCircle {...input} />,
  label: input.ctx.t('prebuilt-actions.next'),
})

const reset = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  icon: (input) => <IconArrowRotateLeft {...input} />,
  label: input.ctx.t('prebuilt-actions.reset'),
})

const prev = (input: PrebuiltActionInput): ScreenAction => ({
  ...input,
  icon: (input) => <IconChevronLeft {...input} />,
  label: input.ctx.t('prebuilt-actions.prev'),
})

export const PrebuiltActions = {
  exit,
  next,
  reset,
  prev,
}
