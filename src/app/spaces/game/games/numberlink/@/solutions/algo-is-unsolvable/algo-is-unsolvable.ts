import { Flow } from '../../numberlink'
import { Variant } from '../../variant'
import { NodeId } from '../../numberlink/node-id'
import { Terminal } from '../../numberlink/terminal'
import { GroupId } from '../../numberlink/group-id'
import { TerminalFull } from '../../numberlink/terminal-full'

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
const hasSmotheredTerminal = (model: Variant.Model): boolean => {
  return Array.from(Flow.yieldFullTerminals(model)).some((terminal) => isSmotheredTerminal(model, terminal))
}

const isSmotheredTerminal = (model: Variant.Model, terminal: TerminalFull): boolean => {
  return (
    isSmotheredTerminalNode(model, terminal.groupId, terminal.startId) ||
    isSmotheredTerminalNode(model, terminal.groupId, terminal.endId)
  )
}

const isSmotheredTerminalNode = (model: Variant.Model, groupId: GroupId, nodeId: NodeId): boolean => {
  return Array.from(Flow.yieldAdjacentNodes(model, nodeId)).every((adjacentNodeId) => {
    const adjacentNodeGroup = Flow.toGroupId(model, adjacentNodeId)
    return adjacentNodeGroup !== groupId && adjacentNodeGroup !== null
  })
}

export const isUnsolvable = (model: Variant.Model): boolean => {
  if (isUnsolvableDueToSplittingTerminal(model)) {
    return true
  }

  if (hasSmotheredTerminal(model)) {
    return true
  }

  return false
}
