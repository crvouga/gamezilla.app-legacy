export type Sub<Msg> = {
  sub: (subscriber: (msg: Msg) => Promise<unknown> | unknown) => () => void
}

export type Pub<Msg> = {
  pub: (msg: Msg) => Promise<void>
  isSubbed: () => boolean
  once: (subscriber?: (msg: Msg) => void) => Promise<Msg>
}

export type PubSub<Msg> = Pub<Msg> & Sub<Msg>

const once = <Msg>(sub: Sub<Msg>): Promise<Msg> => {
  return new Promise<Msg>((resolve) => {
    const unsubscribe = sub.sub((a) => {
      resolve(a)
      unsubscribe()
    })
  })
}
const create = <Msg>(): PubSub<Msg> => {
  let runningId = 0
  const subscribers = new Map<number, (msg: Msg) => Promise<unknown> | unknown>()
  const queue: Msg[] = []
  return {
    isSubbed() {
      return subscribers.size > 0
    },
    sub(subscriber) {
      runningId++
      const id = runningId
      subscribers.set(id, subscriber)
      return () => {
        subscribers.delete(id)
      }
    },
    async pub(msg: Msg) {
      if (subscribers.size === 0) {
        queue.push(msg)
        return
      }
      queue.push(msg)
      await Promise.all(Array.from(subscribers.values()).flatMap((subscriber) => queue.map((msg) => subscriber(msg))))
      queue.length = 0
    },
    once(subscriber) {
      return new Promise<Msg>((resolve) => {
        const unsubscribe = this.sub((a) => {
          // NOTE: order matters here
          subscriber?.(a)
          resolve(a)
          unsubscribe()
        })
      })
    },
  }
}

const next = <A>(sub: Sub<A>) => {
  return new Promise<A>((resolve) => {
    const unsubscribe = sub.sub((a) => {
      resolve(a)
      unsubscribe()
    })
  })
}

const map = <A, B>(sub: Sub<A>, f: (a: A) => B): Sub<B> => {
  return {
    sub: (subscriber) => {
      return sub.sub((a) => {
        subscriber(f(a))
      })
    },
  }
}

const flatMap = <A, B>(sub: Sub<A>, fn: (value: A) => Sub<B>): Sub<B> => {
  return {
    sub: (subscriber: (msg: B) => void) => {
      const unsubscribeFunctions: Array<() => void> = []

      const unsubscribeA = sub.sub((msgA) => {
        const subB = fn(msgA)
        const unsubscribeB = subB.sub(subscriber)
        unsubscribeFunctions.push(unsubscribeB)
      })

      unsubscribeFunctions.push(unsubscribeA)

      return () => {
        unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
      }
    },
  }
}

const batch = <Msg>(arr: Sub<Msg>[]): Sub<Msg> => {
  return {
    sub: (subscriber) => {
      const unsubscribeList: (() => void)[] = []

      for (const sub of arr) {
        unsubscribeList.push(sub.sub(subscriber))
      }

      return () => {
        for (const unsubscribe of unsubscribeList) {
          unsubscribe()
        }
      }
    },
  }
}

const None: Sub<never> = {
  sub: () => () => {},
}

const flat = <A>(sub: Sub<A[]>): Sub<A> => {
  return {
    sub: (subscriber) => {
      return sub.sub((a) => {
        if (a) {
          for (const b of a) {
            subscriber(b)
          }
        }
      })
    },
  }
}
const lastKeyById = new Map<string, string>()
const deduplicate = <Msg>(id: string, keyFn: (msg: Msg) => string, sub: Sub<Msg>): Sub<Msg> => {
  return {
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

const tag = <Tag extends string, Msg>(t: Tag, sub: Sub<Msg>): Sub<{ t: Tag; c: Msg }> => {
  return Sub.map(sub, (c) => ({ t, c }))
}

const toSub = <Msg>(pubSub: PubSub<Msg>): Sub<Msg> => {
  return {
    sub: (subscriber) => {
      return pubSub.sub(subscriber)
    },
  }
}

const toPub = <Msg>(pubSub: PubSub<Msg>): Pub<Msg> => {
  return {
    pub(msg) {
      return pubSub.pub(msg)
    },
    once(subscriber) {
      return pubSub.once(subscriber)
    },
    isSubbed() {
      return pubSub.isSubbed()
    },
  }
}

const createSub = <Msg>(): Sub<Msg> => {
  const pubSub = create<Msg>()
  return toSub(pubSub)
}

const createPub = <Msg>(): Pub<Msg> => {
  const pubSub = create<Msg>()
  return toPub(pubSub)
}

export const Sub = {
  map,
  batch,
  create: createSub,
  None,
  flat,
  tag,
  next,
  flatMap,
  deduplicate,
  once,
}

export const Pub = {
  create: createPub,
}

export const PubSub = {
  map,
  batch,
  create,
  None,
  flatten: flat,
  tag,
  flatMap,
  toSub,
  next,
  toPub,
}
