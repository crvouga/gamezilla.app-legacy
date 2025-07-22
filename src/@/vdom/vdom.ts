import { Brand } from '../brand/brand'

type Primitive = null | false | true | undefined
export type VDom = Brand<unknown, 'VDom'> | Primitive
