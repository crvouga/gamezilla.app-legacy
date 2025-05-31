import { runSaga, Saga, stdChannel } from 'redux-saga'

export const go = (saga: Saga) => {
  const io = {
    channel: stdChannel<any>(),
    dispatch(msg: unknown) {
      this.channel.put(msg)
    },
    getState() {
      return {}
    },
  }
  runSaga(io, saga)
}
