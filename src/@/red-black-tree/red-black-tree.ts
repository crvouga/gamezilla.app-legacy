import { s } from '~/@/schema'

export const Color = s.enumeration(['red', 'black'])
export type Color = s.Infer<typeof Color>

export const RedBlackTree = <TK, TV>(K: s.Parser<TK>, V: s.Parser<TV>) => {
  return s.or(
    s.obj({
      t: s.l('empty'),
    }),
    s.obj({
      t: s.l('node'),
      color: Color,
      key: K,
      value: V,
      //   left: p.recur(() => RedBlackTree(K, V)),
      //   right: p.recur(() => RedBlackTree(K, V)),
    }),
  )
}

export type RedBlackTree<TK, TV> = s.Infer<ReturnType<typeof RedBlackTree<TK, TV>>>
