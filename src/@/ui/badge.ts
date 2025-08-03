import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { sleep } from '../promise/sleep'
import { TimeSpan } from '../time/time-span'
import { Transition } from '../vdom/primitives/transition'
import { theme } from './theme/theme'

export const Badge = (input: { badgeContent: VDom; id: string; children: VDom[] }) => {
  return h(Box, { style: theme({ position: 'relative' }) }, [
    h(Transition, { onEnter: onEnterGrow, id: input.id, mode: 'in-out', onExit: onExitShrink }, [
      input.badgeContent &&
        h(
          Box,
          {
            style: theme({
              position: 'absolute',
              top: 0.5,
              right: 0.5,
              flexDirection: 'row',
              size: 5,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              rounded: 'full',
              backgroundColor: 'blue-500',
              textSize: 'xs',
              fontWeight: 'bold',
              textColor: 'white',
            }),
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
