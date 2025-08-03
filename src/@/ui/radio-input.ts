import { h } from '../vdom'
import { IconCheckmarkCircle, IconCircle } from './icon'
import { Spinner } from './spinner'

export type RadioInputStatus = 'loading' | 'selected' | 'unselected'

export const RadioInputIcon = (props: { style: Record<string, unknown>; status: RadioInputStatus }) => {
  switch (props.status) {
    case 'loading': {
      return h(Spinner, props)
    }
    case 'selected': {
      return h(IconCheckmarkCircle, props)
    }
    case 'unselected': {
      return h(IconCircle, props)
    }
  }
}
