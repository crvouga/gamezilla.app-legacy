import { Numberlink } from '../../numberlink'

const isSolved = (model: Numberlink.Model): boolean => {
  for (const terminal of Numberlink.yieldTerminals(model)) {
    if (!terminal.endId) {
      continue
    }
    if (!Numberlink.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
      return false
    }
  }
  return true
}

export const AlgoIsSolved = {
  isSolved,
}
