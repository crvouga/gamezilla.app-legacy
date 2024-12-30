import { Eff } from '../program/eff'

export type Id = string | number | null | undefined | boolean

export type Config<T> = {
  mode?: 'out-in' | 'in-out'
  toId: (item: T) => Id
  enter: (item: T) => Promise<void>
  exit: (item: T) => Promise<void>
}

export const config = <T>(config: Config<T>): Config<T> => {
  return config
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 */

export type TransitionItem<T> = {
  id: Id
  state: TransitionState
  item: T
}

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited'

export type Model<T> = TransitionItem<T>[]

export const init = <T>(toId?: Config<T>['toId'], items?: T[]): Model<T> => {
  if (!toId) {
    return []
  }

  if (!items) {
    return []
  }

  return items.map((item): TransitionItem<T> => {
    return {
      id: toId(item),
      state: 'entered',
      item
    }
  })
}

/**
 *
 *
 *
 *
 *
 *
 * */

export type Msg = { t: 'entered'; ids: Id[] } | { t: 'exited'; ids: Id[] }

/**
 * @description
 * This needs to run on every state change
 */
export function watch<T>(config: Config<T>, model: Model<T>, list?: T[]): { model: Model<T>; eff?: Eff<Msg> } {
  if (!list) {
    return {
      model: init(config.toId, [])
    }
  }

  const prevKeys = new Map<Id, TransitionItem<T>>()
  const nextKeys = new Map<Id, T>()
  const entering = new Map<Id, TransitionItem<T>>()
  const exiting = new Map<Id, TransitionItem<T>>()

  for (const item of model) {
    prevKeys.set(item.id, item)
  }

  for (const item of list) {
    nextKeys.set(config.toId(item), item)
  }

  for (const [key, prevItem] of prevKeys) {
    if (!nextKeys.has(key) && prevItem.state !== 'exiting' && prevItem.item !== 'exited') {
      exiting.set(key, {
        id: key,
        item: prevItem.item,
        state: 'entering'
      })
    }
  }

  for (const [key, nextItem] of nextKeys) {
    if (!prevKeys.has(key)) {
      entering.set(key, {
        id: key,
        item: nextItem,
        state: 'exiting'
      })
    }
  }

  //
  //
  //
  //

  const eff: Eff<Msg> = async (dispatch) => {
    const mode = config.mode ?? 'out-in'

    const promisesIn: Promise<void>[] = []
    const promisesOut: Promise<void>[] = []

    for (const item of entering.values()) {
      promisesIn.push(config.enter(item.item))
    }

    for (const item of exiting.values()) {
      promisesOut.push(config.exit(item.item))
    }

    const promiseOut = Promise.all(promisesOut)

    const promiseIn = Promise.all(promisesIn)

    switch (mode) {
      case 'out-in': {
        await promiseOut
        await promiseIn
        break
      }
      case 'in-out': {
        await promiseIn
        await promiseOut
        break
      }
    }

    if (exiting.size > 0) {
      dispatch({
        t: 'exited',
        ids: Array.from(exiting.values()).map((x) => x.id)
      })
    }

    if (entering.size > 0) {
      dispatch({
        t: 'entered',
        ids: Array.from(entering.values()).map((x) => x.id)
      })
    }
  }

  //
  //
  //
  //

  const modelNew: Model<T> = []

  for (const item of model) {
    if (exiting.has(item.id)) {
      modelNew.push({
        id: item.id,
        state: 'exiting',
        item: item.item
      })
      continue
    }
    modelNew.push(item)
  }

  for (const item of entering.values()) {
    modelNew.push(item)
  }

  return {
    model: modelNew,
    eff
  }
}

/**
 *
 */
export function update<T>(model: Model<T>, msg?: Msg): Model<T> {
  if (msg?.t === 'entered') {
    return model.map((x) => {
      if (msg.ids.some((y) => x.id === y)) {
        return {
          ...x,
          state: 'entered'
        }
      }
      return x
    })
  }

  if (msg?.t === 'exited') {
    return model.filter((x) => msg.ids.every((y) => x.id !== y))
  }

  return model
}

/**
 *
 */
export function waitForElementById(htmlId: Id, parentHtmlId?: string, maxWait = 5000) {
  const element = document.getElementById(String(htmlId))

  if (element) {
    // If the element is already available, resolve the promise immediately
    return Promise.resolve(element)
  }

  const parentElement = document.getElementById(String(parentHtmlId)) ?? document.body

  return new Promise<HTMLElement | null>((resolve) => {
    const timeout = setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, maxWait)
    const observer = new MutationObserver(() => {
      const targetElement = document.getElementById(String(htmlId))
      if (targetElement) {
        observer.disconnect()
        clearTimeout(timeout)
        resolve(targetElement)
      }
    })

    observer.observe(parentElement, {
      childList: true,
      subtree: true
    })
  })
}
