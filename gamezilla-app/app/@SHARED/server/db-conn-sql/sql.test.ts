import { describe, expect, it } from "bun:test";
import { toSql } from "./sql";

describe(import.meta.file, () => {
	it("should replace named parameter with number", async () => {
		const expected = "SELECT * FROM users WHERE id = 1";
		const actual = toSql("SELECT * FROM users WHERE id = :id", { id: 1 });
		expect(actual).toBe(expected);
	});

	it("should replace named parameter with string", async () => {
		const expected = "SELECT * FROM users WHERE name = 'John'";
		const actual = toSql("SELECT * FROM users WHERE name = :name", {
			name: "John",
		});
		expect(actual).toBe(expected);
	});

	it("should handle SQL injection attempt", async () => {
		const expected = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'";
		const actual = toSql("SELECT * FROM users WHERE id = :id", {
			id: "1' OR '1' = '1",
		});
		expect(actual).toBe(expected);
	});

	it("should prevent SQL injection", async () => {
		const expected = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'";
		const actual = toSql("SELECT * FROM users WHERE id = :id", {
			id: "1' OR '1' = '1",
		});
		expect(actual).toBe(expected);
	});

	it("should handle multiple parameters", async () => {
		const expected = "SELECT * FROM users WHERE id = 2 AND name = 'John'";
		const actual = toSql(
			"SELECT * FROM users WHERE id = :id AND name = :name",
			{
				id: 2,
				name: "John",
			},
		);
		expect(actual).toBe(expected);
	});

	it("should handle parameters not in query", async () => {
		const expected = "SELECT * FROM users";
		const actual = toSql("SELECT * FROM users", { id: 3 });
		expect(actual).toBe(expected);
	});

	it("should handle no parameters", async () => {
		const expected = "SELECT * FROM users";
		const actual = toSql("SELECT * FROM users", {});
		expect(actual).toBe(expected);
	});

	it("should handle missing parameter", async () => {
		const expected = "SELECT * FROM users WHERE id = :id";
		const actual = toSql("SELECT * FROM users WHERE id = :id", {});
		expect(actual).toBe(expected);
	});

	it("should handle non-string parameter values", async () => {
		const expected = "SELECT * FROM users WHERE age > 30";
		const actual = toSql("SELECT * FROM users WHERE age > :age", { age: 30 });
		expect(actual).toBe(expected);
	});

	it("should handle non-string parameter names", async () => {
		const expected = "SELECT * FROM users WHERE age > 30";
		const actual = toSql("SELECT * FROM users WHERE age > :age", { age: 30 });
		expect(actual).toBe(expected);
	});

	it("should handle parameter names with underscores", async () => {
		const expected = "SELECT * FROM users WHERE first_name = 'John'";
		const actual = toSql("SELECT * FROM users WHERE first_name = :first_name", {
			first_name: "John",
		});
		expect(actual).toBe(expected);
	});

	it("should handle parameter with overlapping names", async () => {
		const expected =
			"SELECT * FROM users WHERE phone_number = '555-555-5555' AND phone_number_country = 'US'";
		const actual = toSql(
			"SELECT * FROM users WHERE phone_number = :phone_number AND phone_number_country = :phone_number_country",
			{ phone_number: "555-555-5555", phone_number_country: "US" },
		);
		expect(actual).toBe(expected);
	});

	it("should handle json columns", async () => {
		expect(
			toSql("SELECT * FROM users WHERE meta->>'email' = :email", {
				email: "it@email.com",
			}),
		).toBe("SELECT * FROM users WHERE meta->>'email' = 'it@email.com'");
	});

	it("should handle inserting JSON column correctly", async () => {
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

	it("should be safe against SQL injection", async () => {
		const sqlQuery = "SELECT * FROM users WHERE id = :id";
		const parameters = {
			id: "1' OR '1' = '1",
		};

		const expectedResult =
			"SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'";

		const built = toSql(sqlQuery, parameters);

		expect(built === expectedResult).toBe(true);
	});

	it("should handle second-order SQL injection", async () => {
		const maliciousInput = "1'; DELETE FROM users --";
		const query = "SELECT * FROM users WHERE name = :name";
		const params = { name: maliciousInput };

		const safeQuery = toSql(query, params);

		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle tautologies", async () => {
		const maliciousInput = "1' OR '1' = '1";
		const query = "SELECT * FROM users WHERE id = :id";
		const params = { id: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle union attacks", async () => {
		const maliciousInput = "1 UNION SELECT password, 1, 2, 3 FROM admins --";
		const query = "SELECT * FROM users WHERE id = :id";
		const params = { id: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle batch injection attempts", async () => {
		const maliciousInput = "1; DELETE FROM users";
		const query = "SELECT * FROM users WHERE id = :id";
		const params = { id: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle null byte injection", async () => {
		const maliciousInput = "admin%00";
		const query = "SELECT * FROM users WHERE username = :username";
		const params = { username: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle type mismatch exploits", async () => {
		const maliciousInput = 1;
		const query = "SELECT * FROM users WHERE id = :id";
		const params = { id: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});

	it("should handle comment injection", async () => {
		const maliciousInput = "1 --";
		const query = "SELECT * FROM users WHERE id = :id";
		const params = { id: maliciousInput };

		const safeQuery = toSql(query, params);
		expect(toSql(query, params)).toBe(safeQuery);
	});
});
