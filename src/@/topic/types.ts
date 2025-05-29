import { s } from '~/@/schema'
import { Sub } from '~/@/sub'

export type Topic<TParams, TMsg> = {
  params: s.Parser<TParams>
  msg: s.Parser<TMsg>
}

export type Contract<TTopics extends Record<string, Topic<any, any> | Contract<any>>> = TTopics

export type Client<T extends Contract<any>> = {
  [K in keyof T]: T[K] extends Topic<unknown, unknown>
    ? {
        publish: (params: s.Infer<T[K]['params']>, msg: s.Infer<T[K]['msg']>) => void
        subscribe: (params: s.Infer<T[K]['params']>) => Sub<s.Infer<T[K]['msg']>>
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
