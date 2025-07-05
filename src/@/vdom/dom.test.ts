import { expect, test } from '~/@/test-runner'

test.skip('dom test', () => {
  document.body.innerHTML = '<button>My button</button>'
  const button = document.querySelector('button')
  expect(button?.innerText).toEqual('My button')
})
