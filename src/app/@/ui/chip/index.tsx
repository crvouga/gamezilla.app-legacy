import { TranslatedText } from '~/@/l18n'
import { VDom } from '~/@/vdom/vdom'
import { cn } from '../cn'

export type ChipSize = 'sm' | 'lg'

export type ChipProps = {
  renderStartIcon?: (input: { className: string }) => VDom
  label: TranslatedText
  size: ChipSize
}

const toSizeClass = (input: ChipProps): string => {
  switch (input.size) {
    case 'sm':
      return 'text-xs px-2 py-1 rounded-xl'
    case 'lg':
      return 'text-base px-2.5 py-1.5 rounded-2xl'
  }
}

const toIconSizeClass = (input: ChipProps): string => {
  switch (input.size) {
    case 'sm':
      return 'size-4'
    case 'lg':
      return 'size-5'
  }
}

export const Chip = (input: ChipProps) => {
  return (
    <div className={cn('bg-paper flex items-center gap-1 font-semibold', toSizeClass(input))}>
      {input.renderStartIcon?.({
        className: toIconSizeClass(input),
      })}
      {input.label}
    </div>
  )
}
