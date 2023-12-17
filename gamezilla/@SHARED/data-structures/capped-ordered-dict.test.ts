import { expect, test } from "bun:test";
import { CappedOrderedDict } from "./capped-ordered-dict";

test("adding stuff", () => {
  const initial = CappedOrderedDict.init<string, string>({
    maxSize: 3,
  });

  const added = CappedOrderedDict.add(initial, "1", "1");

  const before = CappedOrderedDict.get(initial, "1");
  const after = CappedOrderedDict.get(added, "1");
  expect(before).toBe(null);
  expect(after).toBe("1");
});

test("adding stuff then removing stuff", () => {
  const initial = CappedOrderedDict.init<string, string>({
    maxSize: 3,
  });

  const added = CappedOrderedDict.add(initial, "1", "1");

  const removed = CappedOrderedDict.remove(initial, "1");

  expect(CappedOrderedDict.get(initial, "1")).toBe(null);
  expect(CappedOrderedDict.get(added, "1")).toBe("1");
  expect(CappedOrderedDict.get(removed, "1")).toBe(null);
});

test("remove oldest on max capacity", () => {
  const initial = CappedOrderedDict.init<string, string>({
    maxSize: 3,
  });
  const dict1 = CappedOrderedDict.add(initial, "1", "1");
  const dict2 = CappedOrderedDict.add(dict1, "2", "2");
  const dict3 = CappedOrderedDict.add(dict2, "3", "3");
  const dict4 = CappedOrderedDict.add(dict3, "4", "4");

  //
  expect(CappedOrderedDict.get(dict3, "1")).toBe("1");
  expect(CappedOrderedDict.get(dict3, "2")).toBe("2");
  expect(CappedOrderedDict.get(dict3, "3")).toBe("3");
  expect(CappedOrderedDict.get(dict3, "4")).toBe(null);
  //
  expect(CappedOrderedDict.get(dict4, "1")).toBe(null);
  expect(CappedOrderedDict.get(dict4, "2")).toBe("2");
  expect(CappedOrderedDict.get(dict4, "3")).toBe("3");
  expect(CappedOrderedDict.get(dict4, "4")).toBe("4");
});
