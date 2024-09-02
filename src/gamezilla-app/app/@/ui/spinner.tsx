import { IconSpinner } from './icon'
import { cn } from './cn'

export const Spinner = (input: { className?: string }) => {
  return (
    <IconSpinner
      aria-label='Loading...'
      className={cn('animate-spin', input.className ? input.className : 'h-12 w-12')}
    />
  )
}
