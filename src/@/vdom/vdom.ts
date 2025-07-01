import { Brand } from '../brand/brand'

type Primitive = null | false | true | undefined | number | string | bigint | boolean | symbol | object | Function

export type VDom = Brand<unknown, 'VDom'> | Primitive
