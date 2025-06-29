import { describe, expect, test } from '~/@/test-runner'
import { History } from './history'

describe('History', () => {
  test('init should create empty history with given present state', () => {
    const history = History.init(5)
    expect(history._past).toEqual([])
    expect(history._present).toEqual(5)
    expect(history._future).toEqual([])
  })

  test('push should add current state to past and set new present', () => {
    const history = History.init(1)
    const updated = History.push(history, 2)
    expect(updated._past).toEqual([1])
    expect(updated._present).toEqual(2)
    expect(updated._future).toEqual([])
  })

  test('push should clear future states', () => {
    let history = History.init(1)
    history = History.push(history, 2)
    history = History.undo(history)
    history = History.push(history, 3)
    expect(history._past).toEqual([1])
    expect(history._present).toEqual(3)
    expect(history._future).toEqual([])
  })

  test('undo should move present to future and restore previous state', () => {
    let history = History.init(1)
    history = History.push(history, 2)
    history = History.undo(history)
    expect(history._past).toEqual([])
    expect(history._present).toEqual(1)
    expect(history._future).toEqual([2])
  })

  test('undo should do nothing if no past states exist', () => {
    const history = History.init(1)
    const updated = History.undo(history)
    expect(updated).toEqual(history)
  })

  test('redo should restore previously undone state', () => {
    let history = History.init(1)
    history = History.push(history, 2)
    history = History.undo(history)
    history = History.redo(history)
    expect(history._past).toEqual([1])
    expect(history._present).toEqual(2)
    expect(history._future).toEqual([])
  })

  test('redo should do nothing if no future states exist', () => {
    const history = History.init(1)
    const updated = History.redo(history)
    expect(updated).toEqual(history)
  })

  test('present should return current state', () => {
    const history = History.init(5)
    expect(History.present(history)).toEqual(5)
  })

  test('canUndo should return true if past states exist', () => {
    let history = History.init(1)
    expect(History.canUndo(history)).toEqual(false)
    history = History.push(history, 2)
    expect(History.canUndo(history)).toEqual(true)
  })

  test('canRedo should return true if future states exist', () => {
    let history = History.init(1)
    history = History.push(history, 2)
    expect(History.canRedo(history)).toEqual(false)
    history = History.undo(history)
    expect(History.canRedo(history)).toEqual(true)
  })
})
