import { eventChannel, TakeableChannel } from 'redux-saga'

export type Sub<Msg> = {
  sub: (subscriber: (msg: Msg) => Promise<unknown> | unknown) => () => void
}

export type PubSub<Msg> = Sub<Msg> & {
  pub: (msg: Msg) => Promise<void>
  subscriberCount: () => number
}

const take = <A>(sub: Sub<A>, abortSignal?: AbortSignal) => {
  return new Promise<A>((resolve, reject) => {
    const unsubscribe = sub.sub((a) => {
      resolve(a)
      unsubscribe()
    })

    abortSignal?.addEventListener('abort', () => {
      unsubscribe()
      reject(new Error('Subscription aborted'))
    })
  })
}

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

const chan = <Msg extends {} | null>(sub: Sub<Msg>): TakeableChannel<Msg> => {
  return eventChannel<Msg>((emit) => sub.sub(emit))
}

const where = <A, B extends A>(sub: Sub<A>, guard: (msg: A) => msg is B): Sub<B> => {
  return {
    ...sub,
    sub: (subscriber) => sub.sub((msg) => (guard(msg) ? subscriber(msg) : undefined)),
  }
}

const create = <Msg>(): PubSub<Msg> => {
  const subscribers = new Set<(msg: Msg) => Promise<unknown> | unknown>()

  return {
    subscriberCount() {
      return subscribers.size
    },
    sub(subscriber) {
      subscribers.add(subscriber)

      return () => {
        subscribers.delete(subscriber)
      }
    },
    async pub(msg: Msg) {
      for (const subscriber of subscribers) {
        subscriber(msg)
      }
    },
  }
}

const map = <A, B>(sub: Sub<A>, f: (a: A) => B): Sub<B> => {
  return {
    ...sub,
    sub: (subscriber) => sub.sub((a) => subscriber(f(a))),
  }
}

const batch = <Msg extends {}>(arr: Sub<Msg>[]): Sub<Msg> => {
  return {
    sub: (subscriber) => {
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

const none = <T>(): Sub<T> => {
  return {
    sub: () => () => {},
  }
}

const lastKeyById = new Map<string, string>()
const deduplicate = <Msg>(id: string, keyFn: (msg: Msg) => string, sub: Sub<Msg>): Sub<Msg> => {
  return {
    ...sub,
    sub: (subscriber) => {
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

export const Sub = {
  map,
  batch,
  take,
  deduplicate,
  none,
  where,
  chan,
  create,
  takeEvery,
}
