import { Flow } from '../../flow'
import { Variant } from '../../variant'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'

const isSplittingTerminal = (model: Variant.Model, terminal: Terminal): boolean => {
  if (!terminal.endId) {
    return false
  }

  const nodeIds = new Set(Object.values(model.nodes).map((node) => node.nodeId))
  nodeIds.delete(terminal.startId)
  nodeIds.delete(terminal.endId)

  const connected = new Set<NodeId>()
  const stack = [terminal.startId]

  while (stack.length > 0) {
    const nodeId = stack.pop()!
    connected.add(nodeId)

    const pipe = model.pipesBySourceId[nodeId]
    if (pipe && pipe.groupId === terminal.groupId) {
      const targetId = Flow.toTargetId(model, pipe.edgeId)
      if (targetId && targetId !== terminal.endId && !connected.has(targetId)) {
        stack.push(targetId)
      }
    }

    for (const [sourceId, sourcePipe] of Object.entries(model.pipesBySourceId)) {
      if (sourcePipe.groupId === terminal.groupId) {
        const targetId = Flow.toTargetId(model, sourcePipe.edgeId)
        if (targetId === nodeId && !connected.has(sourceId as NodeId)) {
          stack.push(sourceId as NodeId)
        }
      }
    }
  }

  if (connected.size === nodeIds.size) return false

  const otherTerminals = Flow.toTerminals(model).filter((t) => t.groupId !== terminal.groupId)
  for (const otherTerminal of otherTerminals) {
    if (!otherTerminal.endId) {
      continue
    }
    const startConnected = connected.has(otherTerminal.startId)
    const endConnected = connected.has(otherTerminal.endId)
    if (startConnected !== endConnected) {
      return true
    }
  }

  return false
}

const isUnsolvableDueToSplittingTerminal = (model: Variant.Model): boolean => {
  const terminals = Flow.toTerminals(model)
  for (const terminal of terminals) {
    if (isSplittingTerminal(model, terminal)) {
      return true
    }
  }
  return false
}

/**
 * Returns true when a terminal
 */
export const hasSmotheredTerminal = (model: Variant.Model): boolean => {
  const terminals = Flow.toTerminals(model)
  for (const terminal of terminals) {
    if (isSmotheredTerminal(model, terminal)) {
      return true
    }
  }
  return false
}

const isSmotheredTerminal = (model: Variant.Model, terminal: Terminal): boolean => {
  const terminals = Flow.toTerminals(model)
  for (const otherTerminal of terminals) {
    if (otherTerminal.groupId === terminal.groupId) {
      continue
    }
  }
  return false
}

export const isUnsolvable = (model: Variant.Model): boolean => {
  if (isUnsolvableDueToSplittingTerminal(model)) {
    return true
  }

  return false
}
