import { VDom } from '~/@/vdom/vdom'
import { Box } from '~/@/vdom/box'
import { h } from '~/@/vdom/h'
import { sleep } from '../promise/sleep'
import { TimeSpan } from '../time/time-span'
import { Transition } from './transition'

export const Badge = (input: { badgeContent: VDom; id: string; children: VDom[] }) => {
  return h(Box, { class: 'relative h-fit w-fit' }, [
    h(Transition, { onEnter: onEnterGrow, id: input.id, mode: 'in-out', onExit: onExitShrink }, [
      input.badgeContent &&
        h(
          Box,
          {
            class:
              'absolute top-0.5 right-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white',
          },
          [input.badgeContent],
        ),
    ]),
    ...input.children,
  ])
}

const onEnterGrow = async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.transform = 'scale(0.7)'
  node.style.opacity = '0'
  await sleep(TimeSpan.milliseconds(300))
  node.style.transform = 'scale(1)'
  node.style.opacity = '1'
}

const onExitShrink = async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.transform = 'scale(1)'
  node.style.opacity = '1'
  await sleep(TimeSpan.milliseconds(300))
  node.style.transform = 'scale(0.7)'
  node.style.opacity = '0'
}
