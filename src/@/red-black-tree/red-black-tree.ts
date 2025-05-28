import { p } from '~/@/schema'

export const Color = p.enumeration(['red', 'black'])
export type Color = p.Infer<typeof Color>

export const RedBlackTree = <TK, TV>(K: p.Parser<TK>, V: p.Parser<TV>) => {
  return p.or(
    p.obj({
      t: p.l('empty'),
    }),
    p.obj({
      t: p.l('node'),
      color: Color,
      key: K,
      value: V,
      //   left: p.recur(() => RedBlackTree(K, V)),
      //   right: p.recur(() => RedBlackTree(K, V)),
    }),
  )
}

export type RedBlackTree<TK, TV> = p.Infer<ReturnType<typeof RedBlackTree<TK, TV>>>
