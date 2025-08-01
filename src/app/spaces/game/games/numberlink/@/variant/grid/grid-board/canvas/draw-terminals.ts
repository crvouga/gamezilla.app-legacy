// import { VariantGrid } from '../..'

// export const drawTerminals = (input: {
//   gl: WebGLRenderingContext
//   program: WebGLProgram
//   model: VariantGrid.Model
// }) => {
//   const TERMINAL_NODE_RADIUS = 0.33
//   const vertices = []

//   // For each terminal, create a circle of vertices
//   for (const terminal of Object.values(input.model.terminalsByGroupId)) {
//     const start = input.model.nodes[terminal.startId]!
//     if (!start) continue

//     const end = terminal.endId ? input.model.nodes[terminal.endId] : undefined

//     // Create circle vertices for start terminal
//     const startX = (start.nodeId.value / input.gl.canvas.width) * 2 - 1
//     const startY = (start.nodeId.value / input.gl.canvas.height) * 2 - 1

//     // Add vertices for circle approximation (12 segments)
//     for (let i = 0; i < 12; i++) {
//       const angle = (i / 12) * Math.PI * 2
//       const nextAngle = ((i + 1) / 12) * Math.PI * 2

//       vertices.push(
//         startX,
//         startY,
//         startX + Math.cos(angle) * TERMINAL_NODE_RADIUS,
//         startY + Math.sin(angle) * TERMINAL_NODE_RADIUS,
//         startX + Math.cos(nextAngle) * TERMINAL_NODE_RADIUS,
//         startY + Math.sin(nextAngle) * TERMINAL_NODE_RADIUS,
//       )
//     }

//     // If end terminal exists, create circle for it too
//     if (end) {
//       const endX = (end.nodeId.value / input.gl.canvas.width) * 2 - 1
//       const endY = (end.nodeId.value / input.gl.canvas.height) * 2 - 1

//       for (let i = 0; i < 12; i++) {
//         const angle = (i / 12) * Math.PI * 2
//         const nextAngle = ((i + 1) / 12) * Math.PI * 2

//         vertices.push(
//           endX,
//           endY,
//           endX + Math.cos(angle) * TERMINAL_NODE_RADIUS,
//           endY + Math.sin(angle) * TERMINAL_NODE_RADIUS,
//           endX + Math.cos(nextAngle) * TERMINAL_NODE_RADIUS,
//           endY + Math.sin(nextAngle) * TERMINAL_NODE_RADIUS,
//         )
//       }
//     }
//   }

//   // Create and bind vertex buffer
//   const vertexBuffer = input.gl.createBuffer()
//   input.gl.bindBuffer(input.gl.ARRAY_BUFFER, vertexBuffer)
//   input.gl.bufferData(input.gl.ARRAY_BUFFER, new Float32Array(vertices), input.gl.STATIC_DRAW)

//   // Set up attribute
//   const positionLocation = input.gl.getAttribLocation(input.program, 'position')
//   input.gl.enableVertexAttribArray(positionLocation)
//   input.gl.vertexAttribPointer(positionLocation, 2, input.gl.FLOAT, false, 0, 0)

//   // Draw triangles for filled circles
//   input.gl.drawArrays(input.gl.TRIANGLES, 0, vertices.length / 2)
// }
