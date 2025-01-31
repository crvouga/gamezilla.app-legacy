import { VDom } from '~/@/vdom/vdom'
import { Transition } from './transition'

export const Badge = (input: { badgeContent: VDom; children: VDom; id: string }) => {
  return (
    <div className='relative h-fit w-fit'>
      <Transition onEnter={onEnterGrow} id={input.id} mode='in-out' onExit={onExitShrink}>
        {input.badgeContent && (
          <div className='absolute right-0.5 top-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
            {input.badgeContent}
          </div>
        )}
      </Transition>
      {input.children}
    </div>
  )
}

const onEnterGrow = async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.transform = 'scale(0.7)'
  node.style.opacity = '0'
  await new Promise((resolve) => setTimeout(resolve, 300))
  node.style.transform = 'scale(1)'
  node.style.opacity = '1'
}

const onExitShrink = async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.transform = 'scale(1)'
  node.style.opacity = '1'
  await new Promise((resolve) => setTimeout(resolve, 300))
  node.style.transform = 'scale(0.7)'
  node.style.opacity = '0'
}
