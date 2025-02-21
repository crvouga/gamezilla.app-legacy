import { Flow } from '../../flow'

const isSolved = (model: Flow.Model): boolean => {
  for (const terminal of Flow.yieldTerminals(model)) {
    if (!terminal.endId) {
      continue
    }
    if (!Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
      return false
    }
  }
  return true
}

export const AlgoIsSolved = {
  isSolved,
}
