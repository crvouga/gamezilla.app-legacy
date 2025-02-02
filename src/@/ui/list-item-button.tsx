import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { preventConsoleErrorWhenClosingDrawer } from './surface-drawer/drawer-shared'
import { DynamicElement } from './dynamic-element'

type Input = {
  className?: string
  icon: (input: { className: string }) => VDom
  end?: () => VDom
  label: TranslatedText
  onClick?: () => void
  color?: Color
}

export const ListItemButton = (input: Input) => {
  const element = input.onClick ? 'button' : 'div'
  return (
    <DynamicElement
      element={element}
      type={element === 'button' ? 'button' : undefined}
      role={element === 'button' ? 'button' : undefined}
      onClick={(event) => {
        preventConsoleErrorWhenClosingDrawer(event)
        input.onClick?.()
      }}
      aria-label={input.label}
      name={input.label}
      className={cn(input.className, BASE_CLASS, toColorClass(input))}
    >
      <div className='flex flex-1 items-center gap-3 truncate'>
        {input.icon({ className: 'size-6' })}

        {input.label}
      </div>
      {input.end && <div className='shrink-0'>{input.end()}</div>}
    </DynamicElement>
  )
}

const BASE_CLASS = 'clickable flex w-full shrink-0 items-center truncate p-4 text-lg font-bold'

type Color = 'default' | 'danger' | 'warning' | 'success' | 'inherit' | 'selected'

const toColorClass = (input: Input) => {
  switch (input.color ?? 'default') {
    case 'warning': {
      return 'text-orange-500'
    }
    case 'danger': {
      return 'text-red-500'
    }
    default: {
      return ''
    }
  }
}
