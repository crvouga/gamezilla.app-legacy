const createShaderProgram = (gl: WebGLRenderingContext) => {
  // Create vertex shader for grid lines
  const vert = gl.createShader(gl.VERTEX_SHADER)
  if (!vert) throw new Error('Failed to create vertex shader')
  gl.shaderSource(
    vert,
    `
    attribute vec2 position;
    void main(void) {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `,
  )
  gl.compileShader(vert)

  // Create fragment shader for green color
  const frag = gl.createShader(gl.FRAGMENT_SHADER)
  if (!frag) throw new Error('Failed to create fragment shader')
  gl.shaderSource(
    frag,
    `
    void main(void) {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green color
    }
  `,
  )
  gl.compileShader(frag)

  // Link shaders into program
  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create program')
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)

  return program
}

const drawGrid = (gl: WebGLRenderingContext, program: WebGLProgram, gridSize: number) => {
  // Create grid vertices
  const vertices = []

  // Vertical lines
  for (let i = 0; i <= gridSize; i++) {
    const x = (i / gridSize) * 2 - 1
    vertices.push(x, -1, x, 1)
  }

  // Horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    const y = (i / gridSize) * 2 - 1
    vertices.push(-1, y, 1, y)
  }

  // Create and bind vertex buffer
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // Set up attribute
  const positionLocation = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  // Draw
  gl.lineWidth(1.0)
  gl.drawArrays(gl.LINES, 0, vertices.length / 2)
}

export const paint = (gl: WebGLRenderingContext) => {
  console.log('paint', gl)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0, 0, 0, 1) // Black background
  gl.clear(gl.COLOR_BUFFER_BIT)

  const program = createShaderProgram(gl)
  gl.useProgram(program)

  drawGrid(gl, program, 10)

  gl.flush()

  if ('endFrameEXP' in gl && typeof gl.endFrameEXP === 'function') {
    gl.endFrameEXP()
  }
}

export const WebglPaint = {
  paint,
}
