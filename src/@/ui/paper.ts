import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'

export const PAPER_CLASS_NAME = 'bg-neutral-900 border border-neutral-800 rounded-lg'

export const Paper = (props: { class?: string; children?: VDom }) => {
  return v('div', { class: cn(PAPER_CLASS_NAME, props.class) }, [props.children])
}
