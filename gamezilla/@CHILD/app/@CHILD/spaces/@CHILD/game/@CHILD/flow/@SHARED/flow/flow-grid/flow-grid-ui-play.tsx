import { AlgoDrawPipes } from "../algo"
import * as Flow from "../flow"
import * as FlowGrid from "./flow-grid"
import * as FlowGridUI from "./flow-grid-ui"

//
//
//
// Model
//
//
//

type Idle = { t: "idle" }

type Dragging = {
  t: "dragging"
  activeGroupId: Flow.GroupId
  autocompleteEdge?: FlowGrid.Edge | null
}

type Status = Idle | Dragging

export type Model = {
  pipesBySourceId: FlowGrid.Model["pipesBySourceId"]
  terminalsByGroupId: FlowGrid.Model["terminalsByGroupId"]
  status: Status
}

//
//
//
//
//
//

export type Msg =
  | {
      t: "pressed-down"
      nodeId: Flow.NodeId
    }
  | {
      t: "pressed-up"
      nodeId: Flow.NodeId
    }
  | {
      t: "dragged-over"
      nodeId: Flow.NodeId
    }
  | {
      t: "left"
    }

export const init = ({ grid }: { grid: FlowGrid.Model }): Model => {
  return {
    pipesBySourceId: grid.pipesBySourceId,
    terminalsByGroupId: grid.terminalsByGroupId,
    status: { t: "idle" },
  }
}

export const update = ({
  msg,
  model,
  grid,
}: {
  msg: Msg
  model: Model
  grid: FlowGrid.Model
}): Model => {
  switch (model.status.t) {
    case "dragging": {
      return updateDragging({ grid, msg, model, modelSync: model.status })
    }

    case "idle": {
      return updateIdle({ grid, msg, model })
    }
  }
}

export const toCurrentGrid = ({
  model,
  grid,
}: {
  grid: FlowGrid.Model
  model: Model
}): FlowGrid.Model => {
  return {
    ...grid,
    pipesBySourceId: model.pipesBySourceId,
    terminalsByGroupId: model.terminalsByGroupId,
  }
}

const updateIdle: typeof update = ({ msg, model, grid }) => {
  switch (msg.t) {
    case "pressed-down": {
      const currentGrid = toCurrentGrid({ model, grid })

      const groupId = Flow.toGroupId(currentGrid, msg.nodeId)

      if (!groupId) {
        return model
      }

      const started = AlgoDrawPipes.startDrawPipes(
        FlowGrid.distance(currentGrid),
        currentGrid,
        groupId,
        msg.nodeId,
      )

      return {
        terminalsByGroupId: started.terminalsByGroupId,
        pipesBySourceId: started.pipesBySourceId,
        status: {
          t: "dragging",
          activeGroupId: groupId,
        },
      }
    }

    case "dragged-over": {
      return model
    }

    case "pressed-up": {
      return model
    }

    case "left": {
      return model
    }
  }
}

const updateDragging = ({
  msg,
  modelSync,
  model,
  grid,
}: {
  msg: Msg
  model: Model
  modelSync: Dragging
  grid: FlowGrid.Model
}): Model => {
  switch (msg.t) {
    case "dragged-over": {
      const { nodeId } = msg

      const currentGrid = toCurrentGrid({ model, grid })

      const extended = AlgoDrawPipes.drawPipes(
        FlowGrid.distance(currentGrid),
        currentGrid,
        modelSync.activeGroupId,
        nodeId,
      )

      const modelNew: Model = {
        status: model.status,
        terminalsByGroupId: extended.terminalsByGroupId,
        pipesBySourceId: extended.pipesBySourceId,
      }

      return modelNew
    }

    case "pressed-down": {
      return model
    }

    case "pressed-up": {
      return { ...model, status: { t: "idle" } }
    }

    case "left": {
      return { ...model, status: { t: "idle" } }
    }
  }
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
  disabled,
  grid,
}: {
  grid: FlowGrid.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
}) => {
  return (
    <FlowGridUI.View
      disabled={disabled}
      model={toCurrentGrid({ model, grid })}
      showCoordinates={false}
      isDragging={model.status.t === "dragging"}
      onDraggedOver={(nodeId) => dispatch({ t: "dragged-over", nodeId })}
      onPressDown={(nodeId) => dispatch({ t: "pressed-down", nodeId })}
      onPressUp={(nodeId) => dispatch({ t: "pressed-up", nodeId })}
      onLeave={() => dispatch({ t: "left" })}
      autocompleteEdge={
        model.status.t === "dragging" && model.status.autocompleteEdge
          ? {
              ...model.status.autocompleteEdge,
              groupId: model.status.activeGroupId,
            }
          : null
      }
      isActive={({ groupId }) =>
        model.status.t === "dragging" && model.status.activeGroupId === groupId
      }
    />
  )
}
