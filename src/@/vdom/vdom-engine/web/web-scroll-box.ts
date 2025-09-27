import { h } from '~/@/vdom/h'
import { ScrollBoxProps } from '../../primitives/scroll-box'
import { BOX_TAG } from '../../tags'

export const WebScrollBox = (props: ScrollBoxProps) => {
  const { contentContainerStyle, ...restProps } = props

  return h(
    BOX_TAG,
    {
      ...restProps,
      style: {
        ...props.style,
        'overflow-y': 'scroll',
        flex: 1,
        gap: contentContainerStyle?.rowGap,
        columnGap: contentContainerStyle?.columnGap,
      },
    },
    props.children,
  )
}
