import { Brand } from '../brand/brand'
import { type ReactNode } from 'react'

export type VDom =
  | null
  | false
  | true
  | undefined
  | ReactNode
  | React.Component<unknown, unknown>
  | React.JSX.Element
  | Brand<unknown, 'VDom'>
