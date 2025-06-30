import { VDom } from '../vdom'

export type Tag = 'div' | (string & {})

export type Props = Record<string, unknown> | null

export type H = <TProps extends Props = Props>(
  tag: Tag | ((props: TProps) => VDom),
  props: TProps | null,
  ...children: VDom[]
) => VDom

export let h: H

export const view = (props: { message: string }) => {
  return h('div', null, `Hello ${props.message}`)
}
