import { p } from "gamezilla-app/@shared/core/parser"
import * as Flow from "../flow/flow"
import { AlgoDrawPipes } from "../flow/flow-algo"
import * as FlowVariant from "./flow-variant"
import * as FlowVariantUI from "./flow-variant-ui"

//
//
//
// Model
//
//
//

type Idle = {
  t: "idle"
}

type Dragging = {
  t: "dragging"
  activeGroupId: Flow.GroupId
  autocompleteEdge?: Flow.Edge | null
}

type Status = Idle | Dragging

export type Model = {
  pipesBySourceId: Flow.Model["pipesBySourceId"]
  terminalsByGroupId: Flow.Model["terminalsByGroupId"]
  status: Status
}

//
//
//
//
//
//

export const Msg = p.or(
  p.obj({
    t: p.l("pressed-down"),
    nodeId: Flow.NodeId,
  }),
  p.obj({
    t: p.l("pressed-up"),
    nodeId: Flow.NodeId,
  }),
  p.obj({
    t: p.l("dragged-over"),
    nodeId: Flow.NodeId,
  }),
  p.obj({
    t: p.l("left"),
  }),
)

export type Msg = p.Infer<typeof Msg>

export const init = ({ flow }: { flow: Flow.Model }): Model => {
  return {
    pipesBySourceId: flow.pipesBySourceId,
    terminalsByGroupId: flow.terminalsByGroupId,
    status: { t: "idle" },
  }
}

export const update = ({
  msg,
  model,
  flow,
}: {
  msg: Msg
  model: Model
  flow: FlowVariant.Model
}): Model => {
  switch (model.status.t) {
    case "dragging": {
      return updateDragging({ flow, msg, model, modelSync: model.status })
    }

    case "idle": {
      return updateIdle({ flow, msg, model })
    }
  }
}

const updateIdle: typeof update = ({ msg, model, flow }) => {
  switch (msg.t) {
    case "pressed-down": {
      const current = {
        ...flow,
        pipesBySourceId: model.pipesBySourceId,
        terminalsByGroupId: model.terminalsByGroupId,
      }

      const groupId = Flow.toGroupId(current, msg.nodeId)

      if (!groupId) {
        return model
      }

      const started = AlgoDrawPipes.startDrawPipes(
        FlowVariant.distance(current),
        current,
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
  flow,
}: {
  msg: Msg
  model: Model
  modelSync: Dragging
  flow: FlowVariant.Model
}): Model => {
  switch (msg.t) {
    case "dragged-over": {
      const { nodeId } = msg

      const current: FlowVariant.Model = {
        ...flow,
        pipesBySourceId: model.pipesBySourceId,
        terminalsByGroupId: model.terminalsByGroupId,
      }

      const extended = AlgoDrawPipes.drawPipes(
        FlowVariant.distance(current),
        current,
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

export const toCurrentFlow = ({
  model,
  flow,
}: {
  flow: FlowVariant.Model
  model: Model
}): FlowVariant.Model => {
  return {
    ...flow,
    pipesBySourceId: model.pipesBySourceId,
    terminalsByGroupId: model.terminalsByGroupId,
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
  flow,
}: {
  flow: FlowVariant.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
}) => {
  return (
    <FlowVariantUI.View
      disabled={disabled}
      model={{
        ...flow,
        pipesBySourceId: model.pipesBySourceId,
        terminalsByGroupId: model.terminalsByGroupId,
      }}
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
      isGroupActive={(groupId) =>
        model.status.t === "dragging" && model.status.activeGroupId === groupId
      }
    />
  )
}
