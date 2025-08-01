export const drawGrid = (input: {
  gl: WebGLRenderingContext
  program: WebGLProgram
  columnCount: number
  rowCount: number
}) => {
  // Create grid vertices
  const vertices = []

  // Vertical lines
  for (let i = 0; i <= input.columnCount; i++) {
    const x = (i / input.columnCount) * 2 - 1 // Scale to [-1, 1]
    vertices.push(x, -1, x, 1)
  }

  // Horizontal lines
  for (let i = 0; i <= input.rowCount; i++) {
    const y = (i / input.rowCount) * 2 - 1 // Scale to [-1, 1]
    vertices.push(-1, y, 1, y)
  }

  // Create and bind vertex buffer
  const vertexBuffer = input.gl.createBuffer()
  input.gl.bindBuffer(input.gl.ARRAY_BUFFER, vertexBuffer)
  input.gl.bufferData(input.gl.ARRAY_BUFFER, new Float32Array(vertices), input.gl.STATIC_DRAW)

  // Set up attribute
  const positionLocation = input.gl.getAttribLocation(input.program, 'position')
  input.gl.enableVertexAttribArray(positionLocation)
  input.gl.vertexAttribPointer(positionLocation, 2, input.gl.FLOAT, false, 0, 0)

  // Draw
  input.gl.lineWidth(1.0)
  input.gl.drawArrays(input.gl.LINES, 0, vertices.length / 2)
}
