import { h } from '~/@/vdom/h'
import './columns-element'
import { type ColumnsInput, columnsInputSub } from './shared'

export const ViewColumns = (input: ColumnsInput) => {
  columnsInputSub.pub(input)
  return h(
    'connect-four-columns',
    {
      'initial-columns-json': JSON.stringify(input.columns),
    },
    [],
  )
}
