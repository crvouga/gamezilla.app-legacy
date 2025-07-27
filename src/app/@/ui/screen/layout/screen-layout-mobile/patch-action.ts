import { h } from '~/@/vdom/h'
import { CancelSubmitButtons } from '../../../form/cancel-submit-buttons'
import { ScreenLayoutProps } from '../screen-layout-props'

export const PatchAction = (input: ScreenLayoutProps) => {
  if (!input.patchAction) return null
  return h(CancelSubmitButtons, input.patchAction)
}
