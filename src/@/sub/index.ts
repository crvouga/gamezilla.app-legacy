import { TimeSpan } from '../time/time-span'

/**
 * A subscription type that allows subscribing to messages of type Msg
 * @template Msg The type of messages that can be subscribed to
 * @example
 * ```ts
 * type Message = { text: string }
 * const sub: Sub<Message> = ...
 * const unsubscribe = sub.sub(msg => console.log(msg.text))
 * // Later:
 * unsubscribe()
 * ```
 */
export type Sub<Msg> = {
  sub: (subscriber: (msg: Msg) => Promise<unknown> | unknown) => () => void
}

/**
 * A publish-subscribe type that allows both publishing and subscribing to messages
 * @template Msg The type of messages that can be published and subscribed to
 * @example
 * ```ts
 * const pubSub = Sub.init<string>()
 * pubSub.sub(msg => console.log(msg))
 * pubSub.pub("Hello") // Logs "Hello"
 * console.log(pubSub.subscriberCount()) // Logs 1
 * ```
 */
export type PubSub<Msg> = Sub<Msg> & {
  pub: (msg: Msg) => unknown
  subscriberCount: () => number
}

/**
 * Takes a single message from a subscription and resolves a promise with that message
 * @template A The type of message to take
 * @example
 * ```ts
 * const sub = Sub.init<number>()
 * const msg = await Sub.take(sub)
 * sub.pub(42) // msg will be 42
 * ```
 */
const take = <A>(sub: Sub<A>, abortSignal?: AbortSignal) => {
  return new Promise<A>((resolve, _reject) => {
    let unsubscribe: (() => void) | undefined

    unsubscribe = sub.sub((a) => {
      unsubscribe?.()
      resolve(a)
    })

    abortSignal?.addEventListener('abort', () => {
      unsubscribe?.()
    })
  })
}

/**
 * Subscribes to all messages until the abort signal is triggered
 * @template A The type of messages to take
 * @example
 * ```ts
 * const controller = new AbortController()
 * const sub = Sub.init<string>()
 * Sub.takeEvery(controller.signal, sub, msg => console.log(msg))
 * sub.pub("hello") // Logs "hello"
 * controller.abort() // Stops listening
 * ```
 */
const takeEvery = <A>(abortSignal: AbortSignal, sub: Sub<A>, callback: (a: A) => void) => {
  const unsub = sub.sub((a) => {
    callback(a)
  })
  abortSignal.addEventListener(
    'abort',
    () => {
      unsub()
    },
    {
      once: true,
    },
  )
}

/**
 * Filters messages using a type guard
 * @template A The source message type
 * @template B The filtered message type
 * @example
 * ```ts
 * type Msg = string | number
 * const sub = Sub.init<Msg>()
 * const numberSub = Sub.where(sub, (msg): msg is number => typeof msg === 'number')
 * numberSub.sub(num => console.log(num * 2))
 * ```
 */
const where = <A, B extends A>(sub: Sub<A>, guard: (msg: A) => msg is B): Sub<B> => {
  return {
    ...sub,
    sub: (subscriber) => {
      return sub.sub((msg) => {
        if (guard(msg)) {
          subscriber(msg)
        }
      })
    },
  }
}

/**
 * Creates a PubSub that queues messages when there are no subscribers
 * @template Msg The type of messages
 * @example
 * ```ts
 * const pubSub = Sub.queued<string>()
 * pubSub.pub("first")
 * pubSub.pub("second")
 * pubSub.sub(msg => console.log(msg)) // Logs "first" then "second"
 * ```
 */
const queued = <Msg>(): PubSub<Msg> => {
  const subscribers = new Set<(msg: Msg) => Promise<unknown> | unknown>()
  let queue: Msg[] = []

  return {
    subscriberCount() {
      return subscribers.size
    },
    sub(subscriber) {
      subscribers.add(subscriber)

      for (const msg of queue) {
        subscriber(msg)
      }
      queue = []

      return () => {
        subscribers.delete(subscriber)
      }
    },
    async pub(msg: Msg) {
      queue.push(msg)

      for (const msg of queue) {
        for (const subscriber of subscribers) {
          subscriber(msg)
        }
      }

      if (subscribers.size > 0) {
        queue = []
      }
    },
  }
}

/**
 * Creates a simple PubSub
 * @template Msg The type of messages
 * @example
 * ```ts
 * const pubSub = Sub.init<number>()
 * pubSub.sub(n => console.log(n))
 * pubSub.pub(42) // Logs 42
 * ```
 */
const init = <Msg>(): PubSub<Msg> => {
  const subscribers: ((msg: Msg) => unknown)[] = []
  return {
    subscriberCount() {
      return subscribers.length
    },
    sub(subscriber) {
      subscribers.push(subscriber)
      return () => subscribers.splice(subscribers.indexOf(subscriber), 1)
    },
    pub(msg: Msg) {
      subscribers.forEach((subscriber) => subscriber(msg))
    },
  }
}

/**
 * Maps messages from one type to another
 * @template A Source message type
 * @template B Target message type
 * @example
 * ```ts
 * const numberSub = Sub.init<number>()
 * const stringSub = Sub.map(numberSub, n => n.toString())
 * stringSub.sub(s => console.log(s)) // s will be a string
 * ```
 */
const map = <A, B>(sub: Sub<A>, f: (a: A) => B): Sub<B> => {
  return { sub: (s) => sub.sub((a) => s(f(a))) }
}

/**
 * Combines multiple subscriptions into one
 * @template Msg The type of messages
 * @example
 * ```ts
 * const sub1 = Sub.init<string>()
 * const sub2 = Sub.init<string>()
 * const combined = Sub.batch([sub1, sub2])
 * combined.sub(msg => console.log(msg)) // Receives from both subs
 * ```
 */
const batch = <Msg extends {}>(arr: Sub<Msg>[]): Sub<Msg> => {
  return {
    sub(subscriber) {
      const unsubscribeList: (() => void)[] = []
      for (const subItem of arr) {
        unsubscribeList.push(subItem.sub(subscriber))
      }
      return () => {
        for (const unsubscribe of unsubscribeList) {
          unsubscribe()
        }
      }
    },
  }
}

/**
 * A subscription that never emits any messages
 * @example
 * ```ts
 * const emptySub = Sub.none<string>()
 * emptySub.sub(msg => console.log(msg)) // Never called
 * ```
 */
const NONE: Sub<any> = {
  sub() {
    return () => {}
  },
}
const none = <T>(): Sub<T> => {
  return NONE
}

const lastKeyById = new Map<string, string>()
/**
 * Deduplicates messages based on a key function
 * @template Msg The type of messages
 * @example
 * ```ts
 * const sub = Sub.init<{id: number, value: string}>()
 * const deduped = Sub.deduplicate('myId', msg => msg.id.toString(), sub)
 * deduped.sub(msg => console.log(msg)) // Only logs when id changes
 * ```
 */
const deduplicate = <Msg>(id: string, keyFn: (msg: Msg) => string, sub: Sub<Msg>): Sub<Msg> => {
  return {
    ...sub,
    sub(subscriber) {
      return sub.sub((msg) => {
        const newKey = keyFn(msg)
        const lastKey = lastKeyById.get(id)
        if (lastKey !== newKey) {
          lastKeyById.set(id, newKey)
          subscriber(msg)
        }
      })
    },
  }
}

/**
 * Throttles messages to only emit at most once per time period
 * @template Msg The type of messages
 * @example
 * ```ts
 * const pubSub = Sub.init<string>()
 * const throttled = Sub.throttle(pubSub, TimeSpan.milliseconds(1000))
 * throttled.sub(msg => console.log(msg)) // At most once per second
 * ```
 */
const throttle = <Msg>(sub: PubSub<Msg>, throttle: TimeSpan): PubSub<Msg> => {
  return {
    ...sub,
    sub: (subscriber) => {
      let lastCallTime = 0
      return sub.sub((msg) => {
        const now = Date.now()
        if (now - lastCallTime >= TimeSpan.toMilliseconds(throttle)) {
          lastCallTime = now
          subscriber(msg)
        }
      })
    },
  }
}

const filterMap = <A, B>(sub: Sub<A>, f: (a: A) => B | null): Sub<B> => {
  return {
    sub: (subscriber) => {
      return sub.sub((a) => {
        const b = f(a)
        if (b !== null) {
          subscriber(b)
        }
      })
    },
  }
}

export const Sub = {
  throttle,
  map,
  filterMap,
  batch,
  take,
  deduplicate,
  none,
  where,
  init,
  queued,
  takeEvery,
}
