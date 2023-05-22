import {
  Edge,
  EdgeFull,
  EdgeId,
  GroupId,
  Model,
  NodeId,
  nodeIdToTerminal,
  setEdgeGroup,
  toEdgeId,
  toGroup,
  toNode,
  toStartNodeId,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
} from './flow';

export const startPath = <T extends Model>(model: T, nodeId: NodeId): T => {
  const terminal = nodeIdToTerminal(model, nodeId);

  if (!terminal) {
    return model;
  }

  const cleared = clearEdges(model, terminal.groupId);

  return {
    ...cleared,
    terminals: {
      ...cleared.terminals,
      [terminal.groupId]: {
        groupId: terminal.groupId,
        start: nodeId,
      },
    },
  };
};

const clearEdges = <T extends Model>(model: T, groupId: GroupId): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.groupId === groupId) {
      modelNew = setEdgeGroup(modelNew, toEdgeId(edge), null);
    }
  }
  return modelNew;
};

//
//
//
// Extend Path
//
//
//

export const extendPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  targetNodeId: NodeId
): T => {
  const targetNodeGroupId = toGroup(model, targetNodeId);

  if (targetNodeGroupId && targetNodeGroupId !== groupId) {
    return model;
  }

  const node = toNode(model, targetNodeId);

  if (!node) {
    return model;
  }

  const terminal = nodeIdToTerminal(model, targetNodeId);

  if (terminal && terminal.groupId !== groupId) {
    return model;
  }

  const startNode = toStartNodeId(model, groupId);

  if (!startNode) {
    return model;
  }

  const modelWithoutPath = clearEdges(model, groupId);

  const walked = extendPathWalk({
    targetNodeId,
    groupId,
    modelWithPath: model,
    model: modelWithoutPath,
    currentNodeId: startNode,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  targetNodeId,
  groupId,
  modelWithPath,
  model,
  currentNodeId,
}: {
  targetNodeId: NodeId;
  groupId: GroupId;
  modelWithPath: T;
  model: T;
  currentNodeId: NodeId;
}): T => {
  if (currentNodeId === targetNodeId) {
    return model;
  }

  const terminal = nodeIdToTerminal(modelWithPath, currentNodeId);

  if (terminal?.pair[1] === currentNodeId) {
    return model;
  }

  const edge = findOutEdgeByGroupId({
    model: modelWithPath,
    nodeId: currentNodeId,
    groupId: groupId,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      start: currentNodeId,
      target: targetNodeId,
    });

    const updated = shortestPath.reduce(
      (acc, edgeId) => setEdgeGroup(acc, edgeId, groupId),
      model
    );

    return updated;
  }

  if (isInGroup(model, edge.to)) {
    return model;
  }

  const edgeId = toEdgeId({ from: currentNodeId, to: edge.to });

  const updated = setEdgeGroup(model, edgeId, groupId);

  return extendPathWalk({
    modelWithPath,
    groupId: groupId,
    targetNodeId,
    currentNodeId: edge.to,
    model: updated,
  });
};

const findShortestEmptyPath = ({
  model,
  start,
  target,
}: {
  model: Model;
  start: NodeId;
  target: NodeId;
}): EdgeId[] => {
  //
  //
  // Construct the breadth first tree
  //
  //
  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: { [id: NodeId]: { parent?: NodeId } } = {};

  visited.add(start);
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    visited.add(current);

    if (current === target) {
      break;
    }

    for (const outEdge of yieldOutEdges(model, current)) {
      const adjacentId = outEdge.to;

      if (visited.has(adjacentId)) {
        continue;
      }

      if (isInGroup(model, adjacentId)) {
        continue;
      }

      const terminal = nodeIdToTerminal(model, adjacentId);

      if (terminal && terminal.groupId === toGroup(model, start)) {
        continue;
      }

      queue.push(adjacentId);
      tree[adjacentId] = { parent: current };
    }
  }

  //
  // Construct the path from the breadth first tree
  //

  let current = target;
  const nodePath: NodeId[] = [current];

  while (current !== start) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  //
  // Convert node path to edge path
  //

  const path: EdgeId[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i];
    if (!from) {
      continue;
    }
    const to = nodePath[i + 1];
    if (!to) {
      continue;
    }
    path.push(toEdgeId({ from, to }));
  }

  //
  // Done
  //

  return path;
};

export const isInGroup = (model: Model, nodeId: NodeId): boolean => {
  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.groupId) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.groupId) {
      return true;
    }
  }

  return false;
};

const findOutEdgeByGroupId = <T extends Model>({
  model,
  nodeId,
  groupId,
}: {
  model: T;
  nodeId: NodeId;
  groupId: GroupId;
}): EdgeFull | null => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId === groupId) {
      return outEdge;
    }
  }
  return null;
};

export const findPathEndNode = (
  model: Model,
  groupId: GroupId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId !== groupId) {
      continue;
    }

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, groupId, outEdge.to);
  }

  return nodeId;
};

//
//
//
// Autocomplete path
//
//
//

export const toAutocompleteEdge = (
  model: Model,
  groupId: GroupId
): Edge | null => {
  const startId = toStartNodeId(model, groupId);

  if (!startId) {
    return null;
  }

  const endId = findPathEndNode(model, groupId, startId);

  if (!endId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, endId)) {
    const terminal = nodeIdToTerminal(model, edge.to);
    if (terminal && terminal.groupId === groupId) {
      return edge;
    }
  }

  return null;
};
