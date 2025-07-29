import { h } from '../vdom'
import { IconCheckmarkCircle, IconCircle } from './icon'
import { Spinner } from './spinner'

export type RadioInputStatus = 'loading' | 'selected' | 'unselected'

export const RadioInputIcon = (input: { fill?: string; stroke?: string; class: string; status: RadioInputStatus }) => {
  switch (input.status) {
    case 'loading': {
      return h(Spinner, { ...input, iconClass: input.class })
    }
    case 'selected': {
      return h(IconCheckmarkCircle, input)
    }
    case 'unselected': {
      return h(IconCircle, input)
    }
  }
}
