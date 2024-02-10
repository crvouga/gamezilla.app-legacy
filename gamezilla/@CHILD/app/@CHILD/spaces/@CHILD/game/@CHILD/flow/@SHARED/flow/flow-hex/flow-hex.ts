import { Flow } from ".."

type HexPosition = {
  x: number
  y: number
  z: number
}

export type Model = {
  flow: Flow.Model
  positions: Record<Flow.NodeId, HexPosition>
}
