export const createShaderProgram = (gl: WebGLRenderingContext) => {
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
