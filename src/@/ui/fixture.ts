import { TestClient } from '~/@/test-client'
import { Render } from '~/@/vdom/render'
import { VDom } from '../vdom/vdom'

export const BaseFixture = async () => {
  const client = await TestClient({ t: 'happydom' })

  document.body.innerHTML = '<div id="root"></div>'

  const root = document.getElementById('root')!

  const render = await Render('react', root)

  return {
    client,
    async render(node: VDom) {
      render(node)
      await new Promise((resolve) => setTimeout(resolve, 10))
    },
  }
}
