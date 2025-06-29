import { describe, expect, test } from '~/@/test-runner'
import { RenderToString } from './render-to-string'
import { VDom } from './vdom'

describe('RenderToString', () => {
  test('should be able to render to string', async () => {
    const renderToString = await RenderToString()

    const vDom: VDom = (
      <div>
        <div>hello</div>
      </div>
    )

    const string = renderToString(vDom)

    expect(string).toEqual('<div><div>hello</div></div>')
  })
})
