import { VDom } from './vdom'

export type Tag = 'div' | (string & {})

export type Props = Record<string, unknown> | null

export type V = <TProps extends Props = Props>(
  tag: Tag | ((props: TProps) => VDom),
  props?: TProps | null,
  children?: VDom[],
) => VDom

export type RenderNode = Element | HTMLBodyElement | HTMLElement

export type IRender = (vDom: VDom) => void

export type ICreatePortal = (vDom: VDom, container: RenderNode) => VDom

export type VirtualDomEngine = {
  render: (node: RenderNode) => IRender
  createPortal: ICreatePortal
  v: V
}
