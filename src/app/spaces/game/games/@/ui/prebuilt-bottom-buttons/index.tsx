import type { Translator } from '~/@/l18n/generated'
import { IconArrowCircle, IconArrowLeftOnRect, IconArrowRotateLeft, IconChevronLeft } from '~/app/@/ui'
import { BottomButtonInput } from '~/app/@/ui/bottom-buttons'

type PrebuiltBottomButtonInput = Partial<BottomButtonInput> & {
  onClick: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

const exit = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  icon: (input) => <IconArrowLeftOnRect {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.exit'),
})

const next = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  // icon: (input) => <IconChevronRight {...input} />,
  icon: (input) => <IconArrowCircle {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.next'),
})

const reset = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  icon: (input) => <IconArrowRotateLeft {...input} />,
  label: input.ctx.t('prebuilt-bottom-buttons.reset'),
})

const prev = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
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
