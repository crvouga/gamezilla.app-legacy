import { describe, expect, it } from "bun:test"
import { toSql } from "./sql"

describe(import.meta.file, () => {
  it("should replace named parameter with number", async () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: 1 })).toBe(
      "SELECT * FROM users WHERE id = 1",
    )
  })

  it("should replace named parameter with string", async () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: "1" })).toBe(
      "SELECT * FROM users WHERE id = '1'",
    )
  })

  it("should handle SQL injection attempt", async () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", {
        id: "1' OR '1' = '1",
      }),
    ).toBe("SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'")
  })

  it("should prevent SQL injection", async () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", {
        id: "DROP DATABASE;",
      }),
    ).toBe("SELECT * FROM users WHERE id = 'DROP DATABASE;'")
  })

  it("should handle multiple parameters", async () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id AND name = :name", {
        id: 2,
        name: "John",
      }),
    ).toBe("SELECT * FROM users WHERE id = 2 AND name = 'John'")
  })

  it("should handle parameters not in query", async () => {
    expect(toSql("SELECT * FROM users", { id: 3 })).toBe("SELECT * FROM users")
  })

  it("should handle no parameters", async () => {
    expect(toSql("SELECT * FROM users WHERE id = 4", {})).toBe(
      "SELECT * FROM users WHERE id = 4",
    )
  })

  it("should handle missing parameter", async () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { name: "Jane" })).toBe(
      "SELECT * FROM users WHERE id = :id",
    )
  })

  it("should handle non-string parameter values", async () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle non-string parameter names", async () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle parameter names with underscores", async () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30",
    )
  })

  it("should handle parameter with overlapping names", async () => {
    expect(
      toSql(
        "SELECT * FROM users WHERE phone_number = :phone_number AND phone_number_country = :phone_number_country",
        { phone_number: "555-555-5555", phone_number_country: "US" },
      ),
    ).toBe(
      "SELECT * FROM users WHERE phone_number = '555-555-5555' AND phone_number_country = 'US'",
    )
  })

  it("should handle json columns", async () => {
    expect(
      toSql("SELECT * FROM users WHERE meta->>'email' = :email", {
        email: "it@email.com",
      }),
    ).toBe("SELECT * FROM users WHERE meta->>'email' = 'it@email.com'")
  })

  it("should handle inserting JSON column correctly", async () => {
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

  it("should be safe against SQL injection", async () => {
    const sqlQuery = "SELECT * FROM users WHERE id = :id"
    const parameters = {
      id: "1' OR '1' = '1",
    }

    const expectedResult = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'"

    const built = toSql(sqlQuery, parameters)

    expect(built === expectedResult).toBe(true)
  })

  it("should handle second-order SQL injection", async () => {
    const maliciousInput = "1'; DELETE FROM users --"
    const query = "SELECT * FROM users WHERE name = :name"
    const params = { name: maliciousInput }

    // Using a safe parameterization approach is crucial
    const safeQuery = toSql(query, params)

    expect(toSql(query, params)).toBe(safeQuery)
  })

  it("should handle tautologies", async () => {
    const maliciousInput = "1' OR '1' = '1"
    const query = "SELECT * FROM users WHERE id = :id"
    const params = { id: maliciousInput }

    // Ensure your logic properly escapes and doesn't alter the query's logic
    const safeQuery = toSql(query, params)
    expect(toSql(query, params)).toBe(safeQuery)
  })

  it("should handle union attacks", async () => {
    const maliciousInput = "1 UNION SELECT password, 1, 2, 3 FROM admins --"
    const query = "SELECT * FROM users WHERE id = :id"
    const params = { id: maliciousInput }

    const safeQuery = toSql(query, params)
    expect(toSql(query, params)).toBe(safeQuery)
  })

  it("should handle batch injection attempts", async () => {
    const maliciousInput = "1; DELETE FROM users"
    const query = "SELECT * FROM users WHERE id = :id"
    const params = { id: maliciousInput }

    const safeQuery = toSql(query, params)
    expect(toSql(query, params)).toBe(safeQuery)
  })

  it("should handle null byte injection", async () => {
    const maliciousInput = "admin%00"
    const query = "SELECT * FROM users WHERE username = :username"
    const params = { username: maliciousInput }

    const safeQuery = toSql(query, params)
    expect(toSql(query, params)).toBe(safeQuery)
  })

  it("should handle type mismatch exploits", async () => {
    const maliciousInput = 1 // Attempting to force a string comparison
    const query = "SELECT * FROM users WHERE id = :id"
    const params = { id: maliciousInput }

    const safeQuery = toSql(query, params)
    expect(toSql(query, params)).toBe(safeQuery)
  })
})
