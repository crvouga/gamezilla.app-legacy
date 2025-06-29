import { describe, expect, test } from '~/@/test-runner'
import { SecretString } from './secret-string'

describe('SecretString', () => {
  const name = 'TestName'
  const value = 'TestValue'

  test('should hide the value in toString', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(secret.toString()).toEqual(`SecretString.of(${name})`)
  })

  test('should return the value from dangerouslyReadValue', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(secret.dangerouslyReadValue()).toEqual(value)
  })

  test('should hide the value in JSON serialization', () => {
    const secret = SecretString.init(name, value)
    if (!secret) {
      throw new Error('SecretString is null')
    }
    expect(JSON.stringify(secret)).toEqual(`"SecretString.of(${name})"`)
  })
})
