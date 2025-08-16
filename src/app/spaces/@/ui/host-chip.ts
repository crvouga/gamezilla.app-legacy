import { Chip } from '~/@/ui/chip'
import { IconCrown } from '~/@/ui/icon'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export const ViewHostChip = (props: { ctx: AppFrontendCtxBase }) => {
  return h(Chip, {
    size: 'sm',
    renderStartIcon: (iconProps) =>
      h(IconCrown, {
        ...iconProps,
        style: { ...iconProps.style, ...sx({ textColor: 'yellow-300' }) },
      }),
    label: props.ctx.t('host'),
  })
}
