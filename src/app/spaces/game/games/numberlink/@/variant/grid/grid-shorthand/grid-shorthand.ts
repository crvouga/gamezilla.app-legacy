import { NonEmpty } from '~/@/array/non-empty'
import { Flow } from '../../../numberlink'
import { GroupId } from '../../../numberlink/group-id'
import { NodeId } from '../../../numberlink/node-id'
import { Terminal as FlowTerminal } from '../../../numberlink/terminal'
import * as VariantGrid from '../grid'
import * as VariantGridDimensions from '../grid-dimensions'

//
//
//
// Model
//
//
//

type Terminal = GroupId

type Pipe = Lowercase<GroupId>

type AppendLowercase<T extends string> = T extends `${infer U}${infer _L}` ? `${U}${Lowercase<U>}` : never

type TerminalWithPipe = AppendLowercase<GroupId>

type Empty = ' '

export type Element = Empty | Terminal | Pipe | TerminalWithPipe

export type Model = NonEmpty<NonEmpty<Element>>

export const transpose = (model: Model): Model => {
  return model[0].map((_, i) => model.map((row) => row[i])) as Model
}

export const rotateClockwise = (model: Model): Model => {
  return transpose(model).map((row) => row.reverse()) as Model
}

export const reflectHorizontally = (model: Model): Model => {
  return model.map((row) => row.reverse()) as Model
}

export const isModel = (maybeModel: Element[][]): maybeModel is Model =>
  NonEmpty.is(maybeModel) &&
  maybeModel.every((row) => NonEmpty.is(row) && row.every((element) => typeof element === 'string'))

//
//
//
//
//
//

const isLowercase = (string: string): boolean => string === string.toLowerCase()

const isTerminal = (element: string): element is Terminal => GroupId.is(element)

const isPipe = (element: string): element is Pipe => isLowercase(element) && GroupId.is(element.toUpperCase())

const isTerminalWithPipe = (element: string): element is TerminalWithPipe =>
  Boolean(element[0] && isTerminal(element[0]) && element[1] && isPipe(element[1]))

export const isEmpty = (element: string): element is Empty => element === ' '

const pipeToGroupId = (pipe: Pipe): GroupId => {
  const uppercase = pipe.toUpperCase()
  if (GroupId.is(uppercase)) {
    return uppercase
  }
  return 'A'
}
const groupIdToPipe = (groupId: GroupId): Pipe => {
  const lowercase = groupId.toLowerCase()
  if (isPipe(lowercase)) {
    return lowercase
  }
  return 'a'
}

const groupIdToTerminalWithPipe = (groupId: GroupId): TerminalWithPipe => {
  const terminalWithPipe = `${groupId.toUpperCase()}${groupId.toLowerCase()}`
  if (isTerminalWithPipe(terminalWithPipe)) {
    return terminalWithPipe
  }
  return 'Aa'
}

const terminalWithPipeToGroupId = (terminalWithPipe: TerminalWithPipe): GroupId => {
  const groupId = terminalWithPipe[0]
  if (GroupId.is(groupId)) {
    return groupId
  }
  return 'A'
}

const elementToGroupId = (element: Element): GroupId | null => {
  if (isPipe(element)) {
    return pipeToGroupId(element)
  }

  if (isTerminal(element)) {
    return element
  }

  if (isTerminalWithPipe(element)) {
    return terminalWithPipeToGroupId(element)
  }

  return null
}

//
//
//
// Init
//
//
//

export const init = (model: Model): Model => {
  return model
}

//
//
//
//
//
//
//

type DraftTerminal = {
  groupId: GroupId
  startId: NodeId
  endId: NodeId | null
}

const toTerminalsByGroupId = (model: Model): VariantGrid.Model['terminalsByGroupId'] => {
  const terminalsByGroupId: VariantGrid.Model['terminalsByGroupId'] = {}

  for (let y = 0; y < model.length; y++) {
    const row = model[y]

    if (!row) {
      continue
    }

    for (let x = 0; x < row.length; x++) {
      const position = {
        x,
        y,
      }

      const elementNodeId = VariantGrid.toNodeId(position)

      const element = row[x]

      if (!element) {
        continue
      }

      if (!isTerminal(element) && !isTerminalWithPipe(element)) {
        continue
      }

      const elementGroupId = elementToGroupId(element)

      if (!elementGroupId) {
        continue
      }

      const draftTerminal = terminalsByGroupId[elementGroupId]

      if (!draftTerminal) {
        const draftTerminalNew: DraftTerminal = {
          groupId: elementGroupId,
          startId: elementNodeId,
          endId: null,
        }
        terminalsByGroupId[elementGroupId] = draftTerminalNew
        continue
      }

      terminalsByGroupId[elementGroupId] = {
        ...draftTerminal,
        endId: elementNodeId,
      }
    }
  }

  return terminalsByGroupId
}

const DELTAS = [
  {
    x: 0,
    y: -1,
  },
  {
    x: 1,
    y: 0,
  },
  {
    x: 0,
    y: 1,
  },
  {
    x: -1,
    y: 0,
  },
] as const

/**
 * Returns a list of all possible pipes for a terminal.
 * @exmaple ```ts
 *  // See how this can have multiple different paths for terminal A.
 *	const shorthand = VariantGridShorthand.init([
 * 		["A", "a", "a"],
 * 		["a", "a", "a"],
 * 		["a", "a", "A"],
 * 	]);
 */
const toPipesBySourceIdForTerminalList = (input: {
  model: Model
  grid: VariantGrid.Model
  terminal: FlowTerminal
}): VariantGrid.Model['pipesBySourceId'][] => {
  const allPaths: VariantGrid.Model['pipesBySourceId'][] = []
  const visitedNodeIds = new Set<NodeId>()

  const groupId = input.terminal.groupId

  const findPaths = (currentNodeId: NodeId, path: VariantGrid.Model['pipesBySourceId']) => {
    if (visitedNodeIds.has(currentNodeId)) {
      return
    }

    visitedNodeIds.add(currentNodeId)

    const currentNode = VariantGrid.toNode(input.grid, currentNodeId)
    if (!currentNode) {
      visitedNodeIds.delete(currentNodeId)
      return
    }

    const currentElement = input.model[currentNode.y]?.[currentNode.x]
    if (!currentElement) {
      visitedNodeIds.delete(currentNodeId)
      return
    }

    // Special case for terminal with pipe.
    if (isTerminalWithPipe(currentElement)) {
      let adjacentTerminalNode: Flow.Node | null = null
      for (const delta of DELTAS) {
        const adjacentPosition = {
          x: currentNode.x + delta.x,
          y: currentNode.y + delta.y,
        }
        const adjacentNodeId = VariantGrid.toNodeId(adjacentPosition)
        const adjacentNode = VariantGrid.toNode(input.grid, adjacentNodeId)

        if (!adjacentNode) {
          continue
        }

        const adjacentElement = input.model[adjacentPosition.y]?.[adjacentPosition.x]
        if (!adjacentElement) {
          continue
        }

        const adjacentElementGroupId = elementToGroupId(adjacentElement)
        if (!adjacentElementGroupId) {
          continue
        }

        if (adjacentElementGroupId !== groupId) {
          continue
        }

        if (isTerminal(adjacentElement)) {
          adjacentTerminalNode = adjacentNode
          break
        }
      }

      if (adjacentTerminalNode) {
        const edgeId = Flow.toEdgeId({
          sourceId: currentNodeId,
          targetId: adjacentTerminalNode.nodeId,
        })
        path[currentNodeId] = {
          edgeId,
          groupId,
        }
        allPaths.push({
          ...path,
        })
      }
      visitedNodeIds.delete(currentNodeId)
      return
    }

    const validAdjacent: {
      adjacentNodeId: NodeId
      adjacentElement: Element
    }[] = []

    for (const delta of DELTAS) {
      const adjacentPosition = {
        x: currentNode.x + delta.x,
        y: currentNode.y + delta.y,
      }
      const adjacentNodeId = VariantGrid.toNodeId(adjacentPosition)

      if (visitedNodeIds.has(adjacentNodeId)) {
        continue
      }

      const adjacentNode = VariantGrid.toNode(input.grid, adjacentNodeId)

      if (!adjacentNode) {
        continue
      }

      const adjacentElement = input.model[adjacentPosition.y]?.[adjacentPosition.x]

      if (!adjacentElement) {
        continue
      }

      const adjacentGroupId = elementToGroupId(adjacentElement)
      if (!adjacentGroupId || adjacentGroupId !== groupId) {
        continue
      }

      validAdjacent.push({
        adjacentNodeId,
        adjacentElement,
      })
    }

    for (const { adjacentNodeId, adjacentElement } of validAdjacent) {
      const edgeId = Flow.toEdgeId({
        sourceId: currentNodeId,
        targetId: adjacentNodeId,
      })
      const newPath = {
        ...path,
      }
      newPath[currentNodeId] = {
        edgeId,
        groupId,
      }

      if (adjacentNodeId === input.terminal.endId) {
        if (isPipe(currentElement) || isTerminalWithPipe(currentElement) || isTerminalWithPipe(adjacentElement)) {
          allPaths.push(newPath)
        }
        continue
      }
      findPaths(adjacentNodeId, newPath)
    }

    if (validAdjacent.length === 0) {
      allPaths.push(path)
    }

    visitedNodeIds.delete(currentNodeId)
  }
  findPaths(input.terminal.startId, {})
  return allPaths
}

/**
 * Returns a list of all possible pipes for a grid.
 * It will return solutions with the longest pipelines.
 */
const toPipesBySourceIdList = (
  model: Model,
  grid: VariantGrid.Model,
): NonEmpty<VariantGrid.Model['pipesBySourceId']> => {
  const pipesBySourceIdListByGroupId: {
    [groupId in GroupId]?: VariantGrid.Model['pipesBySourceId'][]
  } = {}
  for (const groupId in grid.terminalsByGroupId) {
    const terminal = grid.terminalsByGroupId[groupId as GroupId]

    if (!terminal) {
      continue
    }

    const pipesBySourceIdForTerminal = toPipesBySourceIdForTerminalList({
      grid,
      model,
      terminal,
    })

    pipesBySourceIdListByGroupId[terminal.groupId] = [
      ...(pipesBySourceIdListByGroupId[terminal.groupId] ?? []),
      ...pipesBySourceIdForTerminal,
    ]
  }

  const pipeCombinations = combinations(...Object.values(pipesBySourceIdListByGroupId)).map((combination) =>
    combination.reduce(
      (acc, curr) => ({
        ...acc,
        ...curr,
      }),
      {},
    ),
  )

  if (NonEmpty.is(pipeCombinations)) {
    return pipeCombinations
  }

  return [{}]
}

const toTotalPipelineLength = (model: Flow.Model): number => {
  let total = 0
  for (const terminal of Flow.yieldTerminals(model)) {
    for (const _ of Flow.yieldPipeline(model, terminal.startId)) {
      total += 1
    }
  }
  return total
}

/**
 * Generates all combinations where each combination includes one element from each array within the given array of arrays.
 * @param arrays - An array of arrays.
 * @returns An array of combinations.
 */
const combinations = <T>(...arrays: T[][]): T[][] => {
  const result: T[][] = []

  const helper = (currentIndex: number, currentCombination: T[]) => {
    if (currentIndex === arrays.length) {
      result.push([...currentCombination])
      return
    }

    for (const element of arrays[currentIndex] ?? []) {
      currentCombination.push(element)
      helper(currentIndex + 1, currentCombination)
      currentCombination.pop()
    }
  }

  helper(0, [])
  return result
}

const uniqueWith = <T>(arr: T[], fn: (left: T, right: T) => boolean): T[] => {
  const unique: T[] = []
  for (const left of arr) {
    if (!unique.some((right) => fn(left, right))) {
      unique.push(left)
    }
  }
  return unique
}

const maxAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
  let max = -Infinity
  for (const item of arr) {
    const value = fn(item)
    if (value > max) {
      max = value
    }
  }
  return arr.filter((item) => fn(item) === max)
}

export const toDimensions = (model: Model): VariantGridDimensions.Model => {
  let maxWidth = 0

  for (let y = 0; y < model.length; y++) {
    const row = model[y]
    if (!row) {
      continue
    }
    maxWidth = Math.max(maxWidth, row.length)
  }

  return VariantGridDimensions.init({
    width: maxWidth,
    height: model.length,
  })
}

export const toGrid = (model: Model): VariantGrid.Model => {
  return toGrids(model)[0]
}

/**
 * Returns a list of all possible grids for inputted shorthand grid.
 * @exmaple ```ts
 *  // See how this can have multiple different paths for terminal A.
 *	const shorthand = VariantGridShorthand.init([
 * 		["A", "a", "a"],
 * 		["a", "a", "a"],
 * 		["a", "a", "A"],
 * 	]);
 */
export const toGrids = (model: Model): NonEmpty<VariantGrid.Model> => {
  const dimensions = toDimensions(model)
  const grid = VariantGrid.init({
    dimensions,
    terminalsByGroupId: toTerminalsByGroupId(model),
  })
  const solutions = NonEmpty.map(
    toPipesBySourceIdList(model, grid),
    (pipesBySourceId): VariantGrid.Model => ({
      ...grid,
      pipesBySourceId,
    }),
  )

  const flippedGrid = Flow.flipAllTerminals(grid)
  const flippedSolutions = NonEmpty.map(
    toPipesBySourceIdList(model, flippedGrid),
    (pipesBySourceId): VariantGrid.Model => ({
      ...flippedGrid,
      pipesBySourceId,
    }),
  )

  const allGrid = NonEmpty.concat(solutions, flippedSolutions)

  const maxGrids = maxAllBy(allGrid, toTotalPipelineLength)
  const deduplicated = uniqueWith(maxGrids, Flow.isSame)

  if (NonEmpty.is(deduplicated)) {
    return deduplicated
  }
  return solutions
}

const isValid = (maybeModel: Element[][]): maybeModel is Model => {
  return NonEmpty.is(maybeModel) && maybeModel.every((row) => NonEmpty.is(row))
}

export const fromGrid = (grid: VariantGrid.Model): Model => {
  const shorthand: Element[][] = []

  for (let y = 0; y < grid.height; y++) {
    const row: Element[] = []
    for (let x = 0; x < grid.width; x++) {
      row.push(' ')
    }
    shorthand.push(row)
  }

  for (const terminal of Flow.toTerminals(grid)) {
    const start = grid.positions[terminal.startId]
    if (start) {
      const row = shorthand[start.y]
      if (row) {
        row[start.x] = terminal.groupId
      }
    }

    const end = terminal.endId ? grid.positions[terminal.endId] : null

    if (end) {
      const row = shorthand[end.y]
      if (row) {
        row[end.x] = terminal.groupId
      }
    }
  }

  for (const pipelines of Flow.yieldPipelines(grid)) {
    for (const pipe of pipelines) {
      const edge = grid.edges[pipe.edgeId]

      if (!edge) {
        continue
      }

      const groupId = Flow.toGroupId(grid, edge.sourceId)
      const terminal = groupId ? Flow.toTerminalByGroupId(grid, groupId) : null
      const isSourceTerminal = terminal?.startId === edge.sourceId || terminal?.endId === edge.sourceId
      const isTargetTerminal = terminal?.startId === edge.targetId || terminal?.endId === edge.targetId

      const sourcePosition = grid.positions[edge.sourceId]

      if (!sourcePosition) {
        continue
      }

      const row = shorthand[sourcePosition.y]

      if (!row) {
        continue
      }

      if (isSourceTerminal && isTargetTerminal) {
        row[sourcePosition.x] = groupIdToTerminalWithPipe(pipe.groupId)
        continue
      }

      if (!isSourceTerminal) {
        row[sourcePosition.x] = groupIdToPipe(pipe.groupId)
        continue
      }
    }
  }

  if (isValid(shorthand)) {
    return shorthand
  }

  return [[' ']]
}
