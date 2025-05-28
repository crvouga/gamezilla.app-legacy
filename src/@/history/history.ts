import { p } from '~/@/schema'

/**
 * `History` is a data structure that allows you to keep track of the state of
 * an object over time. It is useful for implementing undo/redo functionality.
 *
 */

export type History<T> = {
  _past: T[]
  _present: T
  _future: T[]
}

/**
 * Creates a new history with the given present state.
 */
const init = <T>(present: T): History<T> => ({
  _past: [],
  _present: present,
  _future: [],
})

/**
 * Pushes a new state onto the history.
 */
const push = <T>(history: History<T>, newPresent: T): History<T> => {
  return {
    _past: [...history._past, history._present],
    _present: newPresent,
    _future: [],
  }
}

/**
 * Changes the current state of the history to the previous state.
 */
const undo = <T>(history: History<T>): History<T> => {
  const newPresent = history._past[history._past.length - 1]

  if (!newPresent) return history

  const newPast = history._past.slice(0, history._past.length - 1)
  const newFuture = [history._present, ...history._future]

  return {
    _past: newPast,
    _present: newPresent,
    _future: newFuture,
  }
}

/**
 * Changes the current state of the history to the next state.
 */
const redo = <T>(history: History<T>): History<T> => {
  const newPresent = history._future[0]

  if (!newPresent) return history

  const newFuture = history._future.slice(1)
  const newPast = [...history._past, history._present]

  return {
    _past: newPast,
    _present: newPresent,
    _future: newFuture,
  }
}

/**
 * Returns the current state of the history.
 */
const present = <T>(history: History<T>): T => {
  return history._present
}

/**
 * Returns true if the history can be redone.
 */
const canRedo = <T>(history: History<T>): boolean => {
  return history._future.length > 0
}

/**
 * Returns true if the history can be undone.
 */
const canUndo = <T>(history: History<T>): boolean => {
  return history._past.length > 0
}

const parser = <T>(value: p.Parser<T>): p.Parser<History<T>> => {
  return p.obj({
    _past: p.arr(value),
    _present: value,
    _future: p.arr(value),
  })
}

export const History = {
  parser,
  init,
  push,
  undo,
  redo,
  present,
  canRedo,
  canUndo,
}
