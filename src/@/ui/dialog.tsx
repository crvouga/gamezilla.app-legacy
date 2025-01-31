import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { styles } from '~/@/vdom/style'
import { TimeSpan } from '~/@/time/time-span'

export const Dialog = (input: { children: VDom; open: boolean; onClose: () => void; delay?: TimeSpan }) => {
  const delayMs = input.delay ? TimeSpan.toMilliseconds(input.delay) : null
  const style = styles({
    'transition-delay': input.open && delayMs ? `${delayMs}ms` : undefined,
  })
  return (
    <div
      role='dialog'
      // @ts-expect-error I don't know how to fix this type error
      style={style}
      className={cn(
        'fixed left-0 top-0 z-50 grid h-full w-full place-items-center bg-black/50 transition-opacity duration-300 ease-in-out',
        input.open ? 'opacity-100' : 'pointer-events-none opacity-0',
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

export const DialogSurface = (input: { children: VDom }) => {
  return (
    <div className='bg-surface border-surface relative z-50 flex w-full max-w-[400px] scale-0 flex-col rounded-lg border shadow-2xl drop-shadow-2xl transition-transform duration-300 ease-in-out [.opacity-100_&]:scale-100'>
      {input.children}
    </div>
  )
}

export const DialogHeader = (input: { title: string }) => {
  return (
    <h1 role='heading' aria-level={1} title={input.title} className='px-6 pb-4 pt-6 text-center text-xl font-semibold'>
      {input.title}
    </h1>
  )
}
