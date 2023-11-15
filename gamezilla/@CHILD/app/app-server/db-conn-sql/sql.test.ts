import { toSql } from "./sql";
import { expect, test } from "bun:test";

test("sql - replaces named parameter with number", () => {
  expect(toSql("SELECT * FROM users WHERE id = :id", { id: 1 })).toBe(
    "SELECT * FROM users WHERE id = 1"
  );
});

test("sql - replaces named parameter with string", () => {
  expect(toSql("SELECT * FROM users WHERE id = :id", { id: "1" })).toBe(
    "SELECT * FROM users WHERE id = '1'"
  );
});

test("sql - handles SQL injection attempt", () => {
  expect(
    toSql("SELECT * FROM users WHERE id = :id", { id: "1' OR '1' = '1" })
  ).toBe("SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'");
});

test("sql - handles multiple parameters", () => {
  expect(
    toSql("SELECT * FROM users WHERE id = :id AND name = :name", {
      id: 2,
      name: "John",
    })
  ).toBe("SELECT * FROM users WHERE id = 2 AND name = 'John'");
});

test("sql - handles parameters not in query", () => {
  expect(toSql("SELECT * FROM users", { id: 3 })).toBe("SELECT * FROM users");
});

test("sql - handles no parameters", () => {
  expect(toSql("SELECT * FROM users WHERE id = 4", {})).toBe(
    "SELECT * FROM users WHERE id = 4"
  );
});

test("sql - handles missing parameter", () => {
  expect(toSql("SELECT * FROM users WHERE id = :id", { name: "Jane" })).toBe(
    "SELECT * FROM users WHERE id = :id"
  );
});

test("sql - handles non-string parameter values", () => {
  expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
    "SELECT * FROM users WHERE age > 30"
  );
});
