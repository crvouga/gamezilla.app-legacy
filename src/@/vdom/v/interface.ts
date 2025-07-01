import { VDom } from '../vdom'

export type Tag = 'div' | (string & {})

export type Props = Record<string, unknown> | null

export type V = <TProps extends Props = Props>(
  tag: Tag | ((props: TProps) => VDom),
  props?: TProps | null,
  children?: VDom[],
) => VDom
