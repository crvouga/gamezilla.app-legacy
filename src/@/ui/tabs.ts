import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '../vdom/primitives/text'
import { ClickableTransparent } from './clickable'
import { sx } from './theme/theme'

export const Tabs = <TTab extends string>({
  tabs,
  selected,
  onSelect,
  labels,
}: {
  tabs: TTab[]
  selected: TTab
  labels: { [tab in TTab]: TranslatedText }
  onSelect: (tab: TTab) => void
}) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
      }),
    },
    tabs.map((tab, index) =>
      h(
        Box,
        {
          key: tab,
          style: sx({
            flex: 1,
            flexShrink: 0,
          }),
        },
        [
          h(
            ClickableTransparent,
            {
              onPress: () => onSelect(tab),
              style: {
                ...sx({
                  flexDirection: 'row',
                  height: 'full',
                  width: 'full',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingY: 3,
                  fontSize: 'xl',
                }),
                fontWeight: 'bold',
                ...(index !== tabs.length - 1 && {
                  borderRightWidth: 2,
                }),
                ...(selected === tab
                  ? {
                      borderBottomColor: 'blue-500',
                      textColor: 'blue-500',
                    }
                  : {
                      textColor: 'neutral-300',
                    }),
              },
            },
            [h(Text, { text: labels[tab] })],
          ),
        ],
      ),
    ),
  )
}
