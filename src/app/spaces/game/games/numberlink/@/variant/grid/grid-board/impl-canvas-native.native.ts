import { GLView } from 'expo-gl'
import { h } from '~/@/vdom'

export default function App() {
  return h(
    // @ts-ignore
    GLView,
    { style: { width: 300, height: 300 }, onContextCreate },
  )
}

function onContextCreate(gl: WebGLRenderingContext) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0, 1, 1, 1)

  // Create vertex shader (shape & position)
  const vert = gl.createShader(gl.VERTEX_SHADER)
  if (!vert) throw new Error('Failed to create vertex shader')
  gl.shaderSource(
    vert,
    `
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 150.0;
    }
  `,
  )
  gl.compileShader(vert)

  // Create fragment shader (color)
  const frag = gl.createShader(gl.FRAGMENT_SHADER)
  if (!frag) throw new Error('Failed to create fragment shader')
  gl.shaderSource(
    frag,
    `
    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `,
  )
  gl.compileShader(frag)

  // Link together into a program
  const program = gl.createProgram()
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.useProgram(program)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, 1)

  gl.flush()

  if ('endFrameEXP' in gl && typeof gl.endFrameEXP === 'function') {
    gl.endFrameEXP()
  }
}
