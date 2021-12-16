import { reverse, dropWhile } from "./list";

describe("list utility", () => {
  test("dropWhile", () => {
    expect(dropWhile((_) => _ === "a", ["a", "a", "b", "a"])).toEqual([
      "b",
      "a",
    ]);
  });

  test("reverse", () => {
    expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
  });
});
