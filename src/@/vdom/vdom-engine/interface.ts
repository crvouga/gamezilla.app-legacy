import { AriaRole } from '../../html/aria-role'
import { VDom } from '../vdom'

export type Tag =
  | 'div'
  | 'button'
  | 'input'
  | 'p'
  | 'a'
  | 'svg'
  | 'label'
  | 'form'
  | 'span'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'g'
  | 'line'
  | 'circle'
  | 'rect'
  | 'path'
  | 'polygon'
  | 'polyline'
  | 'defs'
  | 'pattern'
  | 'title'
  | 'mask'
  | 'stop'
  | 'linearGradient'
  | 'radialGradient'
  | 'canvas'
  | 'clipPath'
  | 'text'

export type StyleAttribute =
  | string
  | {
      [key: string]: string | number | boolean | null | undefined
    }

export type IntrinsicAttributes = {
  class?: string
  style?: StyleAttribute
  role?: AriaRole
  'aria-label'?: string
  'aria-selected'?: 'true' | 'false'
  'aria-hidden'?: 'true' | 'false'
  'aria-disabled'?: 'true' | 'false'
  'aria-role'?: AriaRole
  children?: VDom[]
  onClick?: (event: MouseEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onMouseOut?: (event: MouseEvent) => void
  onMouseOver?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type ICreateElement = {
  <TProps extends Record<string, unknown>>(
    component: (props: TProps) => VDom,
    props: Omit<TProps, 'children'> & { key?: string | number | boolean | null | undefined },
    children?: VDom[],
  ): VDom

  (
    tag: Tag,
    props: IntrinsicAttributes & { key?: string | number | boolean | null | undefined },
    children?: VDom[],
  ): VDom
}

export type RenderNode = Element | HTMLBodyElement | HTMLElement

export type IRender = (vDom: VDom, node: RenderNode) => void

export type ICreatePortal = (vDom: VDom, container: RenderNode) => VDom

export type IVirtualDomEngine = {
  render: IRender
  createPortal: ICreatePortal
  createElement: ICreateElement
}
