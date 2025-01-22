import { VDom } from '~/@/vdom/vdom'

export const PaginationDots = (input: { count: number; activeIndex: number }) => {
  const dots: VDom[] = []
  for (let i = 0; i < input.count; i++) {
    if (i === input.activeIndex) {
      dots.push(<div key={i} className='size-2 rounded-full bg-white' />)
      continue
    }
    dots.push(<div key={i} className='size-2 rounded-full bg-neutral-500' />)
  }
  return <div className='flex items-center justify-center space-x-2'>{dots}</div>
}
