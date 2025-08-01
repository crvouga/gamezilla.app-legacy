import { Sub } from '~/@/sub'
import { BoardProps } from '../../../../ui/board'
import { VariantGrid } from '../../grid'
import { createShaderProgram } from './create-shader-program'
import { drawGrid } from './draw-grid'
// import { drawTerminals } from './draw-terminals'

export const onCreateContext = (gl: WebGLRenderingContext, props: Sub<BoardProps<VariantGrid>>) => {
  const program = createShaderProgram(gl)
  gl.useProgram(program)

  props.sub((props) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    drawGrid({
      gl,
      program,
      columnCount: props.model.width,
      rowCount: props.model.height,
    })

    // drawTerminals({
    //   gl,
    //   program,
    //   model: props.model,
    // })

    if ('endFrameEXP' in gl && typeof gl.endFrameEXP === 'function') {
      gl.endFrameEXP()
    }
  })
}
