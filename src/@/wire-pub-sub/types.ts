import { p } from '~/@/parser'
import { Sub } from '~/@/sub'

export type Topic<TParams, TMsg> = {
  params: p.Parser<TParams>
  msg: p.Parser<TMsg>
}

export type Contract<TTopics extends Record<string, Topic<any, any> | Contract<any>>> = TTopics

export type Client<T extends Contract<any>> = {
  [K in keyof T]: T[K] extends Topic<unknown, unknown>
    ? {
        publish: (params: p.Infer<T[K]['params']>, msg: p.Infer<T[K]['msg']>) => void
        sub: (params: p.Infer<T[K]['params']>) => Sub<p.Infer<T[K]['msg']>>
      }
    : T[K] extends Contract<any>
      ? Client<T[K]>
      : never
}

export const initContract = <TTopics extends Record<string, Topic<any, any> | Contract<any>>>(
  endpoints: TTopics,
): Contract<TTopics> => endpoints

export const initClient = <T extends Contract<any>>(_contract: T): Client<T> => {
  // Implementation would go here
  return {} as Client<T>
}
