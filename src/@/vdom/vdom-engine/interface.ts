import { Brand } from '~/@/brand/brand'
import { PrimitiveProps } from '../primitive-props'
import { VDom } from '../vdom'

export type Tag = Brand<string, 'Tag'>

export const tag = (value: string): Tag => value as Tag

export type ICreateElement = {
  <TProps extends Record<string, unknown>>(
    component: (props: TProps) => VDom,
    props: Omit<TProps, 'children'> & { key?: string | number | boolean | null | undefined },
    children?: VDom[],
  ): VDom

  (tag: Tag, props: PrimitiveProps & { key?: string | number | boolean | null | undefined }, children?: VDom[]): VDom
}

export type IRender = (vDom: VDom, root: HTMLElement | Element | HTMLBodyElement) => void

export type IVirtualDomEngine = {
  render: IRender
  createElement: ICreateElement
}
