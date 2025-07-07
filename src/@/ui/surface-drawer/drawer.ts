import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { DrawerComponent } from './drawer-component'
import type { DrawerPropsPrivate } from './drawer-shared'

export type DrawerInput = DrawerPropsPrivate & {
  children: VDom[]
  ariaLabel: TranslatedText
  ctx: {
    t: Translator
  }
  testId?: string
}

export const Drawer = (input: DrawerInput): VDom => {
  return h(DrawerComponent, input)
}
