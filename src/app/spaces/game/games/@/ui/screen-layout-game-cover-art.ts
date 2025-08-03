import { Paper } from '~/@/ui/paper'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Path } from '~/@/vdom/primitives/svg/path'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import type { VDom } from '~/@/vdom/vdom'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutProps } from '~/app/@/ui/screen/layout/screen-layout-props'

export const ScreenLayoutGameCoverArt = (
  input: ScreenLayoutProps & {
    renderCoverArt?: (input: { style: Record<string, unknown> }) => VDom
  },
) => {
  const renderCoverArt = input.renderCoverArt || renderDefaultCoverArt
  return h(ScreenLayout, {
    ...input,
    renderBody: () =>
      h(
        Box,
        {
          style: theme({
            width: 'full',
            flexDirection: 'col',
            items: 'center',
            justify: 'flex-start',
            gap: 6,
            py: 4,
          }),
        },
        [
          renderCoverArt({
            style: theme({
              size: 32,
              overflow: 'hidden',
              rounded: 'lg',
            }),
          }),
          input.renderBody(),
        ],
      ),
  })
}

const renderDefaultCoverArt = (input: { style: Record<string, unknown> }) => {
  return h(
    Paper,
    {
      style: {
        ...theme({
          flexDirection: 'row',
          items: 'center',
          justify: 'center',
          overflow: 'hidden',
          rounded: 'lg',
          p: 4,
        }),
        ...input.style,
      },
    },
    [
      h(
        Svg,
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 640 512',
          style: theme({
            size: 16,
          }),
          fill: 'currentColor',
          stroke: 'currentColor',
        },
        [
          h(Path, {
            d: 'M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z',
          }),
        ],
      ),
    ],
  )
}
