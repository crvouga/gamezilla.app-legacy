import { describe, expect, test } from 'vitest'
import { SecretString } from './secret-string'

describe('SecretString', () => {
  const name = 'TestName'
  const value = 'TestValue'

  test('should return an object with the expected methods and properties', () => {
    const secret = SecretString.init(name, value)

    expect(secret).toHaveProperty('dangerouslyReadValue')
    expect(secret).toHaveProperty('toString')
    expect(secret).toHaveProperty('toJSON')
  })

  test('should hide the value in toString', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(secret.toString()).toBe(`SecretString.of(${name})`)
  })

  test('should return the value from dangerouslyReadValue', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(secret.dangerouslyReadValue()).toBe(value)
  })

  test('should hide the value in JSON serialization', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(JSON.stringify(secret)).toBe(`"SecretString.of(${name})"`)
  })
})
