import { describe, expect, it } from 'bun:test'
import { SecretString } from './secret-string'

describe('SecretString', () => {
  const name = 'TestName'
  const value = 'TestValue'

  it('should return an object with the expected methods and properties', () => {
    const secret = SecretString(name, value)

    expect(secret).toHaveProperty('dangerouslyReadValue')
    expect(secret).toHaveProperty('toString')
    expect(secret).toHaveProperty('toJSON')
  })

  it('should hide the value in toString', () => {
    const secret = SecretString(name, value)
    expect(secret.toString()).toBe(`SecretString(${name})`)
  })

  it('should return the value from dangerouslyReadValue', () => {
    const secret = SecretString(name, value)
    expect(secret.dangerouslyReadValue()).toBe(value)
  })

  it('should hide the value in JSON serialization', () => {
    const secret = SecretString(name, value)
    expect(JSON.stringify(secret)).toBe(`"SecretString(${name})"`)
  })
})
