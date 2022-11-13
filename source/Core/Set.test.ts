import { Set } from "./Set"

const { size, toArray, fromArray, union, intersect, diff } = Set



describe("Set data structure", () => {
    it("only allows unique elements", () => {
        const set = fromArray(element => String(element), [1, 2, 2, 3, 3, 3, 4, 4, 4, 4])
        const expectation = [1, 2, 3, 4]
        const actual = toArray(set)
        expect(expectation).toEqual(actual)
    })

    it("union", () => {
        const toKey = (element: number) => String(element)
        const a = fromArray(toKey, [1, 2, 3])
        const b = fromArray(toKey, [2, 3, 4])
        const c = union(a, b)
        const expectation = [1, 2, 3, 4]
        const actual = toArray(c)
        expect(expectation).toEqual(actual)
    })

    it("intersection", () => {
        const toKey = (element: number) => String(element)
        const a = fromArray(toKey, [1, 2, 3])
        const b = fromArray(toKey, [2, 3, 4])
        const c = intersect(a, b)
        const expectation = [2, 3]
        const actual = toArray(c)
        expect(expectation).toEqual(actual)
    })

    it("difference", () => {
        const toKey = (element: number) => String(element)
        const a = fromArray(toKey, [1, 2, 3])
        const b = fromArray(toKey, [2, 3, 4])
        const c = diff(a, b)
        const expectation = [1]
        const actual = toArray(c)
        expect(expectation).toEqual(actual)
    })

    it("size", () => {
        const toKey = (element: string) => String(element)
        const a = fromArray(toKey, ['a'])
        const b = fromArray(toKey, ['a', 'a'])
        const c = fromArray(toKey, ['a', 'b', 'c'])

        expect(size(a)).toEqual(1)
        expect(size(b)).toEqual(1)
        expect(size(c)).toEqual(3)
    })

})