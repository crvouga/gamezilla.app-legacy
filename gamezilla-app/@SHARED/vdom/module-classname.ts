import { VNode, VNodeData, Module } from "snabbdom"

export type Classes = Record<string, boolean>

function updateClass(oldVnode: VNode, vnode: VNode): void {
  const elm: Element = vnode.elm as Element
  const oldClassName =
    (oldVnode.data as VNodeData & { className?: string })?.className || ""
  const newClassName =
    (vnode.data as VNodeData & { className?: string })?.className || ""

  if (oldClassName === newClassName) {
    return
  }

  const oldClasses = oldClassName.split(" ").filter(Boolean)
  const newClasses = newClassName.split(" ").filter(Boolean)

  const classesToRemove = oldClasses.filter((cls) => !newClasses.includes(cls))
  const classesToAdd = newClasses.filter((cls) => !oldClasses.includes(cls))

  classesToRemove.forEach((cls) => elm.classList.remove(cls))
  classesToAdd.forEach((cls) => elm.classList.add(cls))
}

export const classNameModule: Module = {
  create: updateClass,
  update: updateClass,
}
