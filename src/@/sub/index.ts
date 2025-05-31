import { eventChannel, TakeableChannel } from 'redux-saga'

export type Sub<Msg> = {
  sub: (subscriber: (msg: Msg) => Promise<unknown> | unknown) => () => void
  subscriberCount: () => number
  chan: () => TakeableChannel<Msg>
  where: <B extends Msg>(guard: (msg: Msg) => msg is B) => Sub<B>
}

export type Pub<Msg> = {
  pub: (msg: Msg) => Promise<void>
  once: (subscriber?: (msg: Msg) => void) => Promise<Msg>
  subscriberCount: () => number
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
    chan() {
      // @ts-ignore
      return eventChannel<Msg>((emit) => {
        const unsub = this.sub((msg: Msg) => {
          if (msg !== undefined) {
            emit(msg)
          }
        })
        return () => {
          unsub()
        }
      })
    },
    where<B extends Msg>(guard: (msg: Msg) => msg is B): Sub<B> {
      const self = this // 'this' is the PubSub<Msg> instance
      return {
        subscriberCount: self.subscriberCount, // Or a more accurate count for the filtered sub
        sub: (subscriberForB: (msg: B) => unknown): (() => void) => {
          return self.sub((originalMsg: Msg) => {
            if (guard(originalMsg)) {
              // After the guard, originalMsg is of type B.
              // subscriberForB expects a B. This should be correct.
              subscriberForB(originalMsg)
            }
          })
        },
        chan: (): TakeableChannel<B> => {
          // Assuming B can be undefined if Msg can be, mirroring the parent 'chan'
          // @ts-ignore
          return eventChannel<B>((emit) => {
            const unsub = self.sub((originalMsg: Msg) => {
              if (guard(originalMsg)) {
                emit(originalMsg) // originalMsg is B, emit expects B
              }
            })
            return unsub
          })
        },
        // The 'where' method for the new Sub<B>
        where: function <C extends B>(this: Sub<B>, deeperGuard: (msg: B) => msg is C): Sub<C> {
          // 'self' is the original PubSub<Msg>
          // We chain the guards: the original guard (Msg => B) and the new deeperGuard (B => C)
          return self.where((originalMsg: Msg): originalMsg is C => {
            if (guard(originalMsg)) {
              // originalMsg is now B (type-wise)
              return deeperGuard(originalMsg) // originalMsg is B, deeperGuard expects B
            }
            return false
          })
        },
      }
    },
    subscriberCount() {
      return subscribers.size
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
    subscriberCount: sub.subscriberCount,
    sub: (subscriber) => {
      return sub.sub((a) => {
        subscriber(f(a))
      })
    },
    chan: () => {
      // Proper implementation would map values from sub.chan()
      throw new Error('chan after map not implemented')
    },
    where: <C extends B>(_guard: (msg: B) => msg is C): Sub<C> => {
      // A full implementation would need to filter based on f(a)
      throw new Error('where after map not implemented')
    },
  }
}

const flatMap = <A, B>(sub: Sub<A>, fn: (value: A) => Sub<B>): Sub<B> => {
  return {
    subscriberCount: sub.subscriberCount, // This is an approximation
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
    chan: () => {
      throw new Error('chan after flatMap not implemented')
    },
    where: <C extends B>(_guard: (msg: B) => msg is C): Sub<C> => {
      throw new Error('where after flatMap not implemented')
    },
  }
}

const batch = <Msg extends {}>(arr: Sub<Msg>[]): Sub<Msg> => {
  return {
    subscriberCount: () => arr.reduce((acc, subItem) => acc + subItem.subscriberCount(), 0),
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
    chan: () => {
      return eventChannel<Msg>((emit) => {
        const unsubscribeList: (() => void)[] = []
        for (const subItem of arr) {
          const unsubscribe = subItem.sub((msg) => emit(msg))
          unsubscribeList.push(unsubscribe)
        }
        return () => {
          for (const unsubscribe of unsubscribeList) {
            unsubscribe()
          }
        }
      })
    },
    where: <C extends Msg>(_guard: (msg: Msg) => msg is C): Sub<C> => {
      throw new Error('where after batch not implemented')
    },
  }
}

const None: Sub<never> = {
  subscriberCount: () => 0,
  sub: () => () => {},
  chan: () => eventChannel<never>((_emit) => () => {}),
  where: <C extends never>(_guard: (msg: never) => msg is C): Sub<C> => {
    return None
  },
}

const flat = <A>(sub: Sub<A[]>): Sub<A> => {
  return {
    subscriberCount: sub.subscriberCount,
    sub: (subscriber) => {
      return sub.sub((a) => {
        if (a) {
          for (const b of a) {
            subscriber(b)
          }
        }
      })
    },
    chan: () => {
      throw new Error('chan after flat not implemented')
    },
    where: <C extends A>(_guard: (msg: A) => msg is C): Sub<C> => {
      throw new Error('where after flat not implemented')
    },
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

const tag = <Tag extends string, Msg>(t: Tag, sub: Sub<Msg>): Sub<{ t: Tag; c: Msg }> => {
  return Sub.map(sub, (c) => ({ t, c }))
}

const toSub = <Msg>(pubSub: PubSub<Msg>): Sub<Msg> => {
  return {
    ...pubSub,
    sub: (subscriber) => {
      return pubSub.sub(subscriber)
    },
  }
}

const toPub = <Msg>(pubSub: PubSub<Msg>): Pub<Msg> => {
  return {
    ...pubSub,
    pub(msg) {
      return pubSub.pub(msg)
    },
    once(subscriber) {
      return pubSub.once(subscriber)
    },
  }
}

const createSub = <Msg extends {}>(): Sub<Msg> => {
  const pubSub = create<Msg>()
  return toSub(pubSub)
}

const createPub = <Msg extends {}>(): Pub<Msg> => {
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
