import { toSql } from "./sql";
import { describe, expect, test } from "bun:test";

describe("toSql", () => {
  test("replaces named parameter with number", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: 1 })).toBe(
      "SELECT * FROM users WHERE id = 1"
    );
  });

  test("replaces named parameter with string", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { id: "1" })).toBe(
      "SELECT * FROM users WHERE id = '1'"
    );
  });

  test("handles SQL injection attempt", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", { id: "1' OR '1' = '1" })
    ).toBe("SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'");
  });

  test("prmsgEvts SQL injection", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id", { id: "DROP DATABASE;" })
    ).toBe("SELECT * FROM users WHERE id = 'DROP DATABASE;'");
  });

  test("handles multiple parameters", () => {
    expect(
      toSql("SELECT * FROM users WHERE id = :id AND name = :name", {
        id: 2,
        name: "John",
      })
    ).toBe("SELECT * FROM users WHERE id = 2 AND name = 'John'");
  });

  test("handles parameters not in query", () => {
    expect(toSql("SELECT * FROM users", { id: 3 })).toBe("SELECT * FROM users");
  });

  test("handles no parameters", () => {
    expect(toSql("SELECT * FROM users WHERE id = 4", {})).toBe(
      "SELECT * FROM users WHERE id = 4"
    );
  });

  test("handles missing parameter", () => {
    expect(toSql("SELECT * FROM users WHERE id = :id", { name: "Jane" })).toBe(
      "SELECT * FROM users WHERE id = :id"
    );
  });

  test("handles non-string parameter values", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30"
    );
  });

  test("handles non-string parameter names", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30"
    );
  });

  test("handles parameter names with underscores", () => {
    expect(toSql("SELECT * FROM users WHERE age > :age", { age: 30 })).toBe(
      "SELECT * FROM users WHERE age > 30"
    );
  });

  test("handles parameter with overlapping names", () => {
    expect(
      toSql(
        "SELECT * FROM users WHERE phone_number = :phone_number AND phone_number_country = :phone_number_country",
        { phone_number: "555-555-5555", phone_number_country: "US" }
      )
    ).toBe(
      "SELECT * FROM users WHERE phone_number = '555-555-5555' AND phone_number_country = 'US'"
    );
  });

  test("handles json columns", () => {
    expect(
      toSql("SELECT * FROM users WHERE meta->>'email' = :email", {
        email: "test@email.com",
      })
    ).toBe("SELECT * FROM users WHERE meta->>'email' = 'test@email.com'");
  });

  test("handles inserting JSON column correctly", () => {
    const jsonData = {
      key: "value",
      nested: {
        anotherKey: "anotherValue",
      },
    };

    const sqlQuery =
      "INSERT INTO users_data (user_id, data) VALUES (:user_id, :data)";

    const parameters = {
      user_id: 1,
      data: jsonData,
    };

    const expectedResult = `INSERT INTO users_data (user_id, data) VALUES (1, '{"key":"value","nested":{"anotherKey":"anotherValue"}}')`;

    const built = toSql(sqlQuery, parameters);

    expect(built === expectedResult).toBe(true);
  });
});
