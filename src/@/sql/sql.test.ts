import { describe, expect, test } from '~/@/test-runner'
import { Uuid } from '../id/uuid'
import { UnixMs } from '../time/unix-ms'
import * as Sql from './sql'

describe('SQL', () => {
  test('should replace named parameter with number', async () => {
    const expected = 'SELECT * FROM users WHERE id = 1'
    const actual = Sql.to('SELECT * FROM users WHERE id = :id', { id: 1 })
    expect(actual).toEqual(expected)
  })

  test('should replace named parameter with string', async () => {
    const expected = "SELECT * FROM users WHERE name = 'John'"
    const actual = Sql.to('SELECT * FROM users WHERE name = :name', {
      name: 'John',
    })
    expect(actual).toEqual(expected)
  })

  test('should handle SQL injection attempt', async () => {
    const expected = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'"
    const actual = Sql.to('SELECT * FROM users WHERE id = :id', {
      id: "1' OR '1' = '1",
    })
    expect(actual).toEqual(expected)
  })

  test('should prevent SQL injection', async () => {
    const expected = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'"
    const actual = Sql.to('SELECT * FROM users WHERE id = :id', {
      id: "1' OR '1' = '1",
    })
    expect(actual).toEqual(expected)
  })

  test('should handle multiple variables', async () => {
    const expected = "SELECT * FROM users WHERE id = 2 AND name = 'John'"
    const actual = Sql.to('SELECT * FROM users WHERE id = :id AND name = :name', {
      id: 2,
      name: 'John',
    })
    expect(actual).toEqual(expected)
  })

  test('should handle variables not in query', async () => {
    const expected = 'SELECT * FROM users'
    const actual = Sql.to('SELECT * FROM users', {
      id: 3,
    })
    expect(actual).toEqual(expected)
  })

  test('should handle no variables', async () => {
    const expected = 'SELECT * FROM users'
    const actual = Sql.to('SELECT * FROM users', {})
    expect(actual).toEqual(expected)
  })

  test('should handle missing parameter', async () => {
    const expected = 'SELECT * FROM users WHERE id = :id'
    const actual = Sql.to('SELECT * FROM users WHERE id = :id', {})
    expect(actual).toEqual(expected)
  })

  test('should handle non-string parameter values', async () => {
    const expected = 'SELECT * FROM users WHERE age > 30'
    const actual = Sql.to('SELECT * FROM users WHERE age > :age', {
      age: 30,
    })
    expect(actual).toEqual(expected)
  })

  test('should handle non-string parameter names', async () => {
    const expected = 'SELECT * FROM users WHERE age > 30'
    const actual = Sql.to('SELECT * FROM users WHERE age > :age', {
      age: 30,
    })
    expect(actual).toEqual(expected)
  })

  test('should handle parameter names with underscores', async () => {
    const expected = "SELECT * FROM users WHERE first_name = 'John'"
    const actual = Sql.to('SELECT * FROM users WHERE first_name = :first_name', {
      first_name: 'John',
    })
    expect(actual).toEqual(expected)
  })

  test('should handle parameter with overlapping names', async () => {
    const expected = "SELECT * FROM users WHERE phone_number = '555-555-5003' AND phone_number_country = 'US'"
    const actual = Sql.to(
      'SELECT * FROM users WHERE phone_number = :phone_number AND phone_number_country = :phone_number_country',
      {
        phone_number: '555-555-5003',
        phone_number_country: 'US',
      },
    )
    expect(actual).toEqual(expected)
  })

  test('should handle json columns', async () => {
    expect(
      Sql.to("SELECT * FROM users WHERE meta->>'email' = :email", {
        email: 'it@email.com',
      }),
    ).toEqual("SELECT * FROM users WHERE meta->>'email' = 'it@email.com'")
  })

  test('should handle inserting JSON column correctly', async () => {
    const jsonData = {
      key: 'value',
      nested: {
        anotherKey: 'anotherValue',
      },
    }

    const sqlQuery = 'INSERT INTO users_data (user_id, data) VALUES (:user_id, :data)'

    const variables: Sql.Vars = {
      user_id: 1,
      data: Sql.json(jsonData),
    }

    const expectedResult = `INSERT INTO users_data (user_id, data) VALUES (1, '{"key":"value","nested":{"anotherKey":"anotherValue"}}')`

    const built = Sql.to(sqlQuery, variables)

    expect(built === expectedResult).toEqual(true)
  })

  test('should be safe against SQL injection', async () => {
    const sqlQuery = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: "1' OR '1' = '1",
    }

    const expectedResult = "SELECT * FROM users WHERE id = '1'' OR ''1'' = ''1'"

    const built = Sql.to(sqlQuery, variables)

    expect(built === expectedResult).toEqual(true)
  })

  test('should handle second-order SQL injection', async () => {
    const maliciousInput = "1'; DELETE FROM users --"
    const query = 'SELECT * FROM users WHERE name = :name'
    const variables: Sql.Vars = {
      name: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)

    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle tautologies', async () => {
    const maliciousInput = "1' OR '1' = '1"
    const query = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle union attacks', async () => {
    const maliciousInput = '1 UNION SELECT password, 1, 2, 3 FROM admins --'
    const query = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle batch injection attempts', async () => {
    const maliciousInput = '1; DELETE FROM users'
    const query = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle null byte injection', async () => {
    const maliciousInput = 'admin%00'
    const query = 'SELECT * FROM users WHERE username = :username'
    const variables: Sql.Vars = {
      username: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle type mismatch exploits', async () => {
    const maliciousInput = 1
    const query = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle comment injection', async () => {
    const maliciousInput = '1 --'
    const query = 'SELECT * FROM users WHERE id = :id'
    const variables: Sql.Vars = {
      id: maliciousInput,
    }

    const safeQuery = Sql.to(query, variables)
    expect(Sql.to(query, variables)).toEqual(safeQuery)
  })

  test('should handle array column data type', async () => {
    const expected = "INSERT INTO users (name, emails) VALUES ('John', ARRAY['email@email.com', 'email@email.com'])"

    const actual = Sql.to('INSERT INTO users (name, emails) VALUES (:name, ARRAY[:emails])', {
      name: 'John',
      emails: Sql.commas(['email@email.com', 'email@email.com']),
    })

    expect(actual).toEqual(expected)
  })

  test('should be able to handle "IN" clause', async () => {
    const expected = 'SELECT * FROM users WHERE id IN (1, 2, 3)'
    const actual = Sql.to('SELECT * FROM users WHERE id IN (:ids)', {
      ids: Sql.commas([1, 2, 3]),
    })
    expect(actual).toEqual(expected)
  })

  test('work with strings with semi colons in them', async () => {
    const expected = `SELECT * FROM users WHERE id IN ('user:1', 'user:2', 'user:3') OR id IN ('user:4', 'user:5', 'user:6')`
    const actual = Sql.to(`SELECT * FROM users WHERE id IN (:user1, :user2, :user3) OR id IN (:ids)`, {
      ids: Sql.commas(['user:4', 'user:5', 'user:6']),
      user1: 'user:1',
      user2: 'user:2',
      user3: 'user:3',
    })
    expect(actual).toEqual(expected)
  })

  test('edge cases with semi colons', async () => {
    const sql = `INSERT INTO user_session (id, session_id, client_session_id, user_id, created_at_unix_ms) VALUES (:id, :session_id, :client_session_id, :user_id, :created_at_unix_ms)`
    const userSessionId = `user-session:${Uuid.generate()}`
    const sessionId = `session:${Uuid.generate()}`
    const clientSessionId = `client-session:${Uuid.generate()}`
    const userId = `user:${Uuid.generate()}`
    const createdAtUnixMs = UnixMs.now()
    const vars = {
      id: userSessionId,
      session_id: sessionId,
      client_session_id: clientSessionId,
      user_id: userId,
      created_at_unix_ms: createdAtUnixMs,
    }
    const actual = Sql.to(sql, vars)
    const expected = `INSERT INTO user_session (id, session_id, client_session_id, user_id, created_at_unix_ms) VALUES ('${userSessionId}', '${sessionId}', '${clientSessionId}', '${userId}', ${createdAtUnixMs})`
    expect(actual).toEqual(expected)
  })
})
