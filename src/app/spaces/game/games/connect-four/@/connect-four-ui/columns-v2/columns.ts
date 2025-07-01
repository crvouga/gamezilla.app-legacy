import { v } from '~/@/vdom/v'
import './columns-element'
import { type ColumnsInput, columnsInputSub } from './shared'

export const ViewColumns = (input: ColumnsInput) => {
  columnsInputSub.pub(input)
  return v(
    'connect-four-columns',
    {
      'initial-columns-json': JSON.stringify(input.columns),
    },
    [],
  )
}
