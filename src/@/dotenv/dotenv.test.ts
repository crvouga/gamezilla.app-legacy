import { describe, expect, test } from '~/@/test-runner'
import { FileSystem } from '../file-system'
import { DotEnv } from './dotenv'

describe('DotEnv', () => {
  test('should load environment variables from a file', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    const envContent = 'TEST_KEY=test_value\nANOTHER_KEY="quoted value"\n'
    await fs.write('.env', envContent)

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override-process-env',
    })

    expect(process.env.TEST_KEY).toEqual('test_value')
    expect(process.env.ANOTHER_KEY).toEqual('quoted value')
  })

  test('should handle empty files', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    await fs.write('.env', '')

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override-process-env',
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

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override-process-env',
    })

    expect(process.env.TEST_KEY).toEqual('test_value')
    expect(process.env.ANOTHER_KEY).toEqual('another_value')
  })

  test('should respect precedence when preserving process env', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    process.env.EXISTING_KEY = 'original_value'

    await fs.write('.env', 'EXISTING_KEY=new_value')

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'preserve-process-env',
    })

    expect(process.env.EXISTING_KEY).toEqual('original_value')
  })

  test('should override process env when configured', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    process.env.EXISTING_KEY = 'original_value'

    await fs.write('.env', 'EXISTING_KEY=new_value')

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override-process-env',
    })

    expect(process.env.EXISTING_KEY).toEqual('new_value')
  })

  test('should handle multiple env files', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })
    await fs.write('.env', 'FIRST_KEY=first_value')
    await fs.write('.env.local', 'SECOND_KEY=second_value')

    await DotEnv.load({
      fs,
      paths: ['.env', '.env.local'],
      precedence: 'override-process-env',
    })

    expect(process.env.FIRST_KEY).toEqual('first_value')
    expect(process.env.SECOND_KEY).toEqual('second_value')
  })

  test('should handle non-existent files gracefully', async () => {
    const fs = FileSystem.init({ t: 'in-memory' })

    await DotEnv.load({
      fs,
      paths: ['.env'],
      precedence: 'override-process-env',
    })

    // Should not throw
  })
})
