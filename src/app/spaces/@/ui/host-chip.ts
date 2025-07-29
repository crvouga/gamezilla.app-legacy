import { Chip } from '~/@/ui/chip'
import { IconCrown } from '~/@/ui/icon'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export const ViewHostChip = (input: { ctx: AppFrontendCtxBase }) => {
  return h(Chip, {
    size: 'sm',
    renderStartIcon: (startIconInput) =>
      h(IconCrown, {
        ...startIconInput,
        style: {
          ...startIconInput.style,
          ...theme({ textColor: 'yellow-300' }),
        },
      }),
    label: input.ctx.t('host'),
  })
}
