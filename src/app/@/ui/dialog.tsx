import type { VDomChildren } from '~/@/vdom/vdom'
import { cn } from './cn'
import { styles } from '~/@/vdom/style'
import { TimeSpan } from '~/@/time/time-span'

export const Dialog = (input: { children: VDomChildren; open: boolean; onClose: () => void; delay?: TimeSpan }) => {
  const delayMs = input.delay ? TimeSpan.toMilliseconds(input.delay) : null
  const style = styles({
    'transition-delay': input.open && delayMs ? `${delayMs}ms` : undefined
  })
  return (
    <div
      role='dialog'
      style={style}
      className={cn(
        'absolute left-0 top-0 grid h-full w-full place-items-center transition-all duration-300 ease-in-out',
        input.open ? 'scale-100 opacity-100' : 'pointer-events-none scale-0 opacity-0'
      )}
      onClick={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        input.onClose()
      }}
      onKeyDown={(e) => {
        switch (e.key) {
          case 'Escape': {
            input.onClose()
            return
          }
          default: {
            return
          }
        }
      }}
    >
      {input.children}
    </div>
  )
}

export const DialogSurface = (input: { children: VDomChildren }) => {
  return (
    <div className='bg-surface flex w-80 flex-col gap-6 rounded-lg border p-6 shadow-2xl drop-shadow-2xl'>
      {input.children}
    </div>
  )
}

export const DialogHeader = (input: { title: string }) => {
  return (
    <h1 role='heading' aria-level={1} title={input.title} className='text-center text-xl font-semibold'>
      {input.title}
    </h1>
  )
}
