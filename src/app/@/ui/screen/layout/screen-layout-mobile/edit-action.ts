import { h } from '~/@/vdom/h'
import { CancelSubmitButtons } from '../../../form/cancel-submit-buttons'
import { ScreenLayoutProps } from '../screen-layout-props'

export const EditAction = (input: ScreenLayoutProps) => {
  if (!input.actionEdit) return null
  return h(CancelSubmitButtons, input.actionEdit)
}
