import { sleep } from '~/@/promise/sleep'
import { TimeSpan } from '~/@/time/time-span'
import { IconCheckmark } from '~/@/ui/icon'
import { sx } from '~/@/vdom/style/sx'
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
    },
    [
      input.open &&
        h(
          Box,
          {
            style: sx({
              position: 'absolute',
              inset: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              pointerEvents: 'none',
            }),
          },
          [h(IconCheckmark, { style: sx({ aspectRatio: 1, width: 'full', opacity: 0.5, textColor: 'white' }) })],
        ),
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
