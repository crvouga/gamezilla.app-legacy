import { AlgoSolve } from '../algo-solve/index'
import { MsgToWorker } from './types'

declare let self: Worker

self.onmessage = (event: MessageEvent<unknown>) => {
  const parsed = MsgToWorker.parse(event.data)
  if (parsed.t === 'err') {
    self.postMessage({
      t: 'found-solution',
      model: null,
    })
    return
  }
  switch (parsed.value.t) {
    case 'find-solution': {
      const model = parsed.value.model
      const solution = AlgoSolve.solve(model)
      self.postMessage({
        t: 'found-solution',
        model: solution,
      })
    }
  }
}
