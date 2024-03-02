import { describe, expect, it } from "bun:test"
import { toSql } from "./sql"

describe(import.meta.file, () => {
  it("should replace named parameter with number", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: 1 })).toBe(
      "SELECT * FROM users WHERE id = 1",
    )
  })

  it("should replace named parameter with string", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: "1" })).toBe(
      "SELECT * FROM users WHERE id = '1'",
    )
  })

  it("should handle SQL injection attempt", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", {
        id: "1' OR '1' = '1",
      }),
    ).toBe("SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'")
  })

  it("should prevent SQL injection", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", {
        id: "DROP DATABASE;",
      }),
    ).toBe("SELECT * FROM users WHERE id = 'DROP DATABASE;'")
  })

  it("should handle multiple parameters", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id AND name = :name", {
        id: 2,
        name: "John",
      }),
    ).toBe("SELECT * FROM users WHERE id = 2 AND name = 'John'")
  })

  it("should handle parameters not in query", () => {
    expect(toSql("SELECT * FROM users", { id: 3 })).toBe("SELECT * FROM users")
  })

  it("should handle no parameters", () => {
    expect(toSql("SELECT * FROM users WHERE id = 4", {})).toBe(
      "SELECT * FROM users WHERE id = 4",
    )
  })

  it("should handle missing parameter", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { name: "Jane" })).toBe(
      "SELECT * FROM users WHERE id = :id",
    )
  })

  it("should handle non-string parameter values", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle non-string parameter names", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle parameter names with underscores", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle parameter with overlapping names", () => {
    expect(
      toSql(
        "SELECT * FROM users WHERE phone_number = :phone_number AND phone_number_country = :phone_number_country",
        { phone_number: "555-555-5555", phone_number_country: "US" },
      ),
    ).toBe(
      "SELECT * FROM users WHERE phone_number = '555-555-5555' AND phone_number_country = 'US'",
    )
  })

  it("should handle json columns", () => {
    expect(
      toSql("SELECT * FROM users WHERE meta->>'email' = :email", {
        email: "it@email.com",
      }),
    ).toBe("SELECT * FROM users WHERE meta->>'email' = 'it@email.com'")
  })

  it("should handle inserting JSON column correctly", () => {
    const jsonData = {
      key: "value",
      nested: {
        anotherKey: "anotherValue",
      },
    }

    const sqlQuery =
      "INSERT INTO users_data (user_id, data) VALUES (:user_id, :data)"

    const parameters = {
      user_id: 1,
      data: jsonData,
    }

    const expectedResult = `INSERT INTO users_data (user_id, data) VALUES (1, '{"key":"value","nested":{"anotherKey":"anotherValue"}}')`

    const built = toSql(sqlQuery, parameters)

    expect(built === expectedResult).toBe(true)
  })
})
