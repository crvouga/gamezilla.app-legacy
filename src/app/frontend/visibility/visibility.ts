import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'

export type Model = {
  documentVisibilityState: DocumentVisibilityState
}

export const init = (_input: { stored: Record<string, unknown> | null }): { model: Model } => {
  return {
    model: {
      documentVisibilityState: typeof window === 'undefined' ? 'visible' : document.visibilityState,
    },
  }
}

export type Msg = { t: 'document-became-hidden' } | { t: 'document-became-visible' }

export const update = ({
  msg,
  model,
}: {
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg) return updateFromMsg({ msg, model })

  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) return { model }

  switch (msg.t) {
    case 'document-became-hidden': {
      return { model: { ...model, documentVisibilityState: 'hidden' } }
    }

    case 'document-became-visible': {
      return { model: { ...model, documentVisibilityState: 'visible' } }
    }
  }
}

const visibilityStateSubscriptions: Sub<Msg> = Browser.onDocumentVisibilityState<Msg>((state) => {
  switch (state) {
    case 'hidden': {
      return {
        t: 'document-became-hidden',
      }
    }

    case 'visible': {
      return {
        t: 'document-became-visible',
      }
    }
  }
})

export const subscriptions: Sub<Msg> = visibilityStateSubscriptions
