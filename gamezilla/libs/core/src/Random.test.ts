import { Random } from "./random"

describe("random", () => {
  it("same seed generates same numbers", () => {
    const seed = "some arbitrary seed"
    const genA = Random.generator(seed)
    const genB = Random.generator(seed)

    for (let i = 0; i < 10; i++) {
      const a = genA()
      const b = genB()

      expect(a).toEqual(b)
    }
  })

  it("different seeds generator different numbers", () => {
    const genA = Random.generator("some arbitrary seed")
    const genB = Random.generator("some different arbitrary seed")

    for (let i = 0; i < 10; i++) {
      const a = genA()
      const b = genB()

      expect(a).not.toEqual(b)
    }
  })
})
