import { eventChannel, TakeableChannel } from 'redux-saga'

export type Sub<Msg> = {
  pub: (msg: Msg) => Promise<void>
  sub: (subscriber: (msg: Msg) => unknown) => () => void
}

const once = <Msg>(sub: Sub<Msg>): Promise<Msg> => {
  return new Promise<Msg>((resolve) => {
    const unsubscribe = sub.sub((a) => {
      resolve(a)
      unsubscribe()
    })
  })
}

const chan = <Msg extends {} | null>(sub: Sub<Msg>): TakeableChannel<Msg> => {
  return eventChannel<Msg>((emit) => {
    const unsubscribe = sub.sub((msg) => {
      emit(msg)
    })
    return unsubscribe
  })
}

const where = <A, B extends A>(sub: Sub<A>, guard: (msg: A) => msg is B): Sub<B> => {
  return {
    ...sub,
    sub(subscriber) {
      return sub.sub((msg) => {
        if (guard(msg)) {
          subscriber(msg)
        }
      })
    },
  }
}

const create = <Msg>(): Sub<Msg> => {
  const subscribers = new Set<(msg: Msg) => unknown>()

  return {
    sub(subscriber) {
      subscribers.add(subscriber)
      return () => {
        subscribers.delete(subscriber)
      }
    },
    async pub(msg: Msg) {
      await Promise.all(Array.from(subscribers).map((s) => s(msg)))
    },
  }
}

const map = <A, B>(sub: Sub<A>, f: (a: A) => B): Sub<B> => {
  return {
    pub: async (_b) => {
      throw new Error('not implemented')
    },
    sub: (subscriber) => sub.sub((a) => subscriber(f(a))),
  }
}

const batch = <Msg>(subs: Sub<Msg>[]): Sub<Msg> => {
  return {
    pub: async (msg) => {
      await Promise.all(subs.map((sub) => sub.pub(msg)))
    },
    sub: (subscriber) => {
      const unsubs: (() => void)[] = []
      for (const sub of subs) {
        unsubs.push(sub.sub(subscriber))
      }
      return () => {
        Promise.all(unsubs.map((unsub) => unsub()))
      }
    },
  }
}

const none = <Msg>(): Sub<Msg> => {
  return {
    sub: () => () => {},
    pub: async () => {},
  }
}

const lastKeyById = new Map<string, string>()
const deduplicate = <Msg>(id: string, keyFn: (msg: Msg) => string, sub: Sub<Msg>): Sub<Msg> => {
  return Sub.where(sub, (msg): msg is Msg => {
    const newKey = keyFn(msg)
    const lastKey = lastKeyById.get(id)
    if (lastKey !== newKey) {
      lastKeyById.set(id, newKey)
      return true
    }
    return false
  })
}
export const Sub = {
  map,
  batch,
  create,
  none,
  deduplicate,
  once,
  chan,
  where,
}
