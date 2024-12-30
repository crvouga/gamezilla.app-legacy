import type { VDom } from './vdom'

export type CreatePortal = (vDom: VDom, container: Element) => VDom

export let createPortal: CreatePortal | null = null

export const setCreatePortal = (fn: CreatePortal) => {
  createPortal = fn
}
