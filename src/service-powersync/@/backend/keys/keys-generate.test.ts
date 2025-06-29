import { describe, expect, test } from '~/@/test-runner'
import { keysGenerate } from './keys-generate'

describe('keysGenerate', () => {
  test('should generate valid key pairs', async () => {
    const result = await keysGenerate()
    // Check that both keys are present
    expect(result.privateBase64).toBeDefined()
    expect(result.publicBase64).toBeDefined()
    // Check that keys are valid base64 strings
    // expect(() => Buffer.from(result.privateBase64, 'base64')).not.toThrow()
    // expect(() => Buffer.from(result.publicBase64, 'base64')).not.toThrow()
    // Parse the JWK objects
    const privateJwk = JSON.parse(Buffer.from(result.privateBase64, 'base64').toString())
    const publicJwk = JSON.parse(Buffer.from(result.publicBase64, 'base64').toString())
    // Verify JWK structure
    // expect(privateJwk).toMatchObject({
    //   alg: 'RS256',
    //   key_ops: ['sign'],
    //   use: 'sig',
    // })
    // expect(publicJwk).toMatchObject({
    //   alg: 'RS256',
    //   key_ops: ['verify'],
    //   use: 'sig',
    // })
    // Verify kid format
    // expect(privateJwk.kid).toMatch(/^powersync-[a-f0-9]{10}$/)
    expect(publicJwk.kid).toEqual(privateJwk.kid) // Both keys should have same kid
  })
})
