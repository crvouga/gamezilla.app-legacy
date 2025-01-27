import type { Translator } from '~/@/l18n/generated'
import { IconArrowCircle, IconArrowLeftOnRect, IconArrowRotateLeft, IconChevronLeft } from '~/app/@/ui'
import { ScreenAction } from '~/app/@/ui/screen/screen-actions'

type PrebuiltBottomButtonInput = Partial<ScreenAction> & {
  onClick: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

const exit = (input: PrebuiltBottomButtonInput): ScreenAction => ({
  ...input,
  icon: (input) => <IconArrowLeftOnRect {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.exit'),
})

const next = (input: PrebuiltBottomButtonInput): ScreenAction => ({
  ...input,
  // icon: (input) => <IconChevronRight {...input} />,
  icon: (input) => <IconArrowCircle {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.next'),
})

const reset = (input: PrebuiltBottomButtonInput): ScreenAction => ({
  ...input,
  icon: (input) => <IconArrowRotateLeft {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.reset'),
})

const prev = (input: PrebuiltBottomButtonInput): ScreenAction => ({
  ...input,
  icon: (input) => <IconChevronLeft {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.prev'),
})

export const PrebuiltBottomButtons = {
  exit,
  next,
  reset,
  prev,
}
