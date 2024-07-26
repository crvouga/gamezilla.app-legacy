import { Flow, FlowVariant } from '../..'
import { FlowNodeId } from '../../flow/flow-node-id'
import { FlowTerminal } from '../../flow/flow-terminal'

const isSplittingTerminal = (model: FlowVariant.Model, terminal: FlowTerminal): boolean => {
  if (!terminal.endId) {
    return false
  }

  const nodeIds = new Set(Object.values(model.nodes).map((node) => node.nodeId))
  nodeIds.delete(terminal.startId)
  nodeIds.delete(terminal.endId)

  const connected = new Set<FlowNodeId>()
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
        if (targetId === nodeId && !connected.has(sourceId as FlowNodeId)) {
          stack.push(sourceId as FlowNodeId)
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

const isUnsolvableDueToSplittingTerminal = (model: FlowVariant.Model): boolean => {
  const terminals = Flow.toTerminals(model)
  for (const terminal of terminals) {
    if (isSplittingTerminal(model, terminal)) {
      return true
    }
  }
  return false
}

export const isUnsolvable = (model: FlowVariant.Model): boolean => {
  if (isUnsolvableDueToSplittingTerminal(model)) {
    return true
  }

  return false
}
