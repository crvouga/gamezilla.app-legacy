import { describe, expect, test } from '~/@/test-runner'
import { v } from '~/@/vdom/v'
import { RenderToString } from './render-to-string'
import { VDom } from './vdom'

describe('RenderToString', () => {
  test('should be able to render to string', async () => {
    const renderToString = await RenderToString()

    const vDom: VDom = v('div', {}, [v('div', {}, ['hello'])])

    const string = renderToString(vDom)

    expect(string).toEqual('<div><div>hello</div></div>')
  })
})
