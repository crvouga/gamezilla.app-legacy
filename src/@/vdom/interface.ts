import { VDom } from './vdom'

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
  | (string & {})

export type Props = Record<string, unknown>

export type ICreateElement = <TProps extends Props = Props>(
  tag: Tag | ((props: TProps) => VDom),
  props: Omit<TProps, 'children'> & { key?: unknown },
  children?: VDom[],
) => VDom

export type RenderNode = Element | HTMLBodyElement | HTMLElement

export type IRender = (vDom: VDom) => void

export type ICreatePortal = (vDom: VDom, container: RenderNode) => VDom

export type VirtualDomEngine = {
  render: (node: RenderNode) => IRender
  createPortal: ICreatePortal
  createElement: ICreateElement
}
