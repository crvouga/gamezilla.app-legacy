import { describe, expect, test } from '~/@/test-runner'
import { FileSystem } from '../file-system'
import { DotEnv } from './dotenv'

describe('DotEnv', () => {
  test('should load environment variables from a file', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const envContent = 'TEST_KEY=test_value\nANOTHER_KEY="quoted value"\n'
    await fs.write('.env', envContent)

    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    expect(env.TEST_KEY).toEqual('test_value')
    expect(env.ANOTHER_KEY).toEqual('quoted value')
  })

  test('should handle empty files', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    await fs.write('.env', '')

    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    // Should not throw
  })

  test('should handle comments and empty lines', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const envContent = `
      # This is a comment
      TEST_KEY=test_value

      # Another comment
      ANOTHER_KEY=another_value
    `
    await fs.write('.env', envContent)

    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    expect(env.TEST_KEY).toEqual('test_value')
    expect(env.ANOTHER_KEY).toEqual('another_value')
  })

  test('should respect precedence when preserving env', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const env: Record<string, string | undefined> = {
      EXISTING_KEY: 'original_value',
    }

    await fs.write('.env', 'EXISTING_KEY=new_value')

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'preserve',
      cwd: '/test',
      env,
    })

    expect(env.EXISTING_KEY).toEqual('original_value')
  })

  test('should override env when configured', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const env: Record<string, string | undefined> = {
      EXISTING_KEY: 'original_value',
    }

    await fs.write('.env', 'EXISTING_KEY=new_value')

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    expect(env.EXISTING_KEY).toEqual('new_value')
  })

  test('should handle multiple env files', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    await fs.write('.env', 'FIRST_KEY=first_value')
    await fs.write('.env.local', 'SECOND_KEY=second_value')

    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env', '.env.local'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    expect(env.FIRST_KEY).toEqual('first_value')
    expect(env.SECOND_KEY).toEqual('second_value')
  })

  test('should handle non-existent files gracefully', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/test',
      env,
    })

    // Should not throw
  })

  test('should work with custom working directory', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    await fs.write('/custom/path/.env', 'CUSTOM_KEY=custom_value')

    const env: Record<string, string | undefined> = {}

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override',
      cwd: '/custom/path',
      env,
    })

    expect(env.CUSTOM_KEY).toEqual('custom_value')
  })
})
