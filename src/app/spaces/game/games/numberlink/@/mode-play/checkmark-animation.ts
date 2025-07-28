import { sleep } from '~/@/promise/sleep'
import { TimeSpan } from '~/@/time/time-span'
import { IconCheckmark } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Transition } from '~/@/vdom/primitives/transition/transition'

const defaultCheckmarkAnimationDuration = TimeSpan.seconds(1 / 2)

export const CheckmarkAnimation = (input: { open: boolean; duration?: TimeSpan | null | undefined }) => {
  const duration = input.duration ?? defaultCheckmarkAnimationDuration
  return h(
    Transition,
    {
      id: 'checkmark',
      onEnter: animateCheckmark({
        duration,
      }),
      onExit: async () => {},
      mode: 'out-in',
      class: 'pointer-events-none',
    },
    [
      input.open &&
        h(Box, { class: 'pointer-events-none absolute inset-0 flex flex-row items-center justify-center opacity-0' }, [
          h(IconCheckmark, { class: 'pointer-events-none aspect-square w-full opacity-50 text-white' }),
        ]),
    ],
  )
}

const animateCheckmark = (input: { duration: TimeSpan }) => async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
  await sleep(TimeSpan.milliseconds(50))
  node.style.opacity = '1'
  node.style.transform = 'scale(1)'
  await sleep(input.duration)
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
}
