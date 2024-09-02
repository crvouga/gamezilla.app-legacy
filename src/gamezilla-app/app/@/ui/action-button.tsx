import { TranslatedText } from 'gamezilla-app/@/l18n'
import type { VDom } from 'gamezilla-app/@/vdom'
import { Typography } from './typography'
import { cn } from './cn'

export const ActionButton = ({
  label,
  icon,
  onClick,
  disabled = false,
  color
}: {
  color?: 'error' | 'success'
  label: TranslatedText
  icon: VDom
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-1 flex-col items-center p-1 text-sm active:opacity-50',
        disabled && 'opacity-50',
        color === 'error' && 'text-red-500',
        color === 'success' && 'text-green-500'
      )}
    >
      {icon}
      <Typography variant='label' text={label} />
    </button>
  )
}
