import { TestClient } from '~/@/test-client'
import { Render } from '~/@/vdom/render'

export const BaseFixture = async () => {
  const driver = await TestClient({ t: 'happydom' })

  document.body.innerHTML = ''

  const root = document.createElement('div')

  document.body.appendChild(root)

  const render = await Render('preact', root)

  return {
    driver,
    render,
  }
}
