import type { VDom } from 'gamezilla-app/@/vdom'
import { cn } from './cn'
import { TranslatedText } from 'gamezilla-app/@/l18n'

export const ListItemButton = ({
  label,
  icon,
  onClick,
  color = 'default',
  end,
  className
}: {
  className?: string
  icon: (input: { className: string }) => VDom
  end?: () => VDom
  label: TranslatedText
  onClick?: () => void
  color?: 'default' | 'danger' | 'warning' | 'success' | 'inherit'
}) => {
  return (
    <button
      type='button'
      role='button'
      onClick={onClick}
      aria-label={label}
      name={label}
      className={cn(
        className,
        'flex w-full shrink-0 items-center truncate p-4 text-lg font-bold',
        color === 'warning' && 'text-orange-500',
        color === 'danger' && 'text-red-500'
      )}
    >
      <div className='flex flex-1 items-center gap-3 truncate'>
        {icon({
          className: 'h-6 w-6'
        })}

        {label}
      </div>
      {end && <div className='shrink-0'>{end()}</div>}
    </button>
  )
}
