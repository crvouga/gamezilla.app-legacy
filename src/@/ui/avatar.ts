import { h } from '~/@/vdom/h'
import { Box } from '../vdom/primitives/box'
import { Image } from '../vdom/primitives/image'
import { Path } from '../vdom/primitives/svg/path'
import { Svg } from '../vdom/primitives/svg/svg'
import { sx } from './theme/theme'

type AvatarProps = {
  src?: string | null | undefined
  alt?: string | null | undefined

  onPress?: () => void
  style?: Record<string, unknown>
}

const isImage = (src: string | null | undefined): boolean => {
  return typeof src === 'string' && src.startsWith('http')
}

export const Avatar = (props: AvatarProps) => {
  if (isImage(props.src)) {
    return h(Image, {
      onPress: props.onPress,

      src: props.src ?? '',
      alt: props.alt ?? 'user avatar',
      style: {
        ...sx({
          aspectRatio: 1,
          flexShrink: 0,
          overflow: 'hidden',
          rounded: 'full',
          backgroundColor: 'white/40',
        }),
        ...props.style,
      },
    })
  }

  return h(
    Box,
    {
      onPress: props.onPress,
      style: {
        ...sx({
          aspectRatio: 1,
          flexShrink: 0,
          overflow: 'hidden',
          rounded: 'full',
          backgroundColor: 'white/40',
        }),
        ...props.style,
      },
    },
    [
      h(
        Svg,
        {
          style: sx({ width: 'full', height: 'full', textColor: 'neutral-300' }),
          fill: '#ffffffcc',
          viewBox: '0 0 24 24',
        },
        [
          h(Path, {
            d: 'M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z',
          }),
        ],
      ),
    ],
  )
}
