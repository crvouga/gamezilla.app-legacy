import { describe, expect, test } from '~/@/test-runner'
import { h } from '~/@/vdom/h'
import { RenderToString } from './render-to-string'
import { VDom } from './vdom'

describe('RenderToString', () => {
  test('should be able to render to string', async () => {
    const renderToString = await RenderToString()

    const vDom: VDom = h('div', {}, [h('div', {}, ['hello'])])

    const string = renderToString(vDom)

    expect(string).toEqual('<div><div>hello</div></div>')
  })
})
