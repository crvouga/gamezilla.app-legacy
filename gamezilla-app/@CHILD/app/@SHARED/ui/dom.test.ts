import { test, expect, describe } from "bun:test"

describe(import.meta.file, () => {
  test("dom test", () => {
    document.body.innerHTML = `<button>My button</button>`
    const button = document.querySelector("button")
    expect(button?.innerText).toEqual("My button")
  })
})
