import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { IconArrowCircle, IconArrowLeftOnRect, IconArrowRotateLeft, IconChevronLeft, IconLightbulb } from '~/app/@/ui'

export type BottomButtonInput = {
  label: TranslatedText
  disabled?: boolean
  icon: (input: { className: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: 'danger' | 'success' | 'inherit'
  hidden?: boolean
}

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
  label: input.ctx.t('app.exit')
})

const next = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  // icon: (input) => <IconChevronRight {...input} />,
  icon: (input) => <IconArrowCircle {...input} />,
  label: input.ctx.t('app.next')
})

const reset = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  icon: (input) => <IconArrowRotateLeft {...input} />,
  label: input.ctx.t('app.reset')
})

const prev = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  icon: (input) => <IconChevronLeft {...input} />,
  label: input.ctx.t('app.prev')
})

const hint = (input: PrebuiltBottomButtonInput): BottomButtonInput => ({
  ...input,
  icon: (input) => <IconLightbulb {...input} />,
  label: input.ctx.t('game.hint')
})

export const PrebuiltBottomButtons = {
  exit,
  next,
  reset,
  prev,
  hint
}
