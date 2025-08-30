import { FileSystem } from '~/@/file-system'
import { describe, expect, test } from '~/@/test-runner'
import { Result, isErr } from '~/@/result'

const Fixture = async (config: FileSystem) => {
  const fs = FileSystem.init(config)
  return {
    fs,
  }
}

const Fixtures = async () => {
  const configs: FileSystem[] = []
  configs.push({ t: 'in-memory' })
  configs.push({ t: 'node' })

  return Promise.all(configs.map(Fixture))
}

describe('FileSystem', () => {
  test('write and read file', async () => {
    for (const { fs } of await Fixtures()) {
      const path = 'test.txt'
      const data = 'Hello World'

      const writeResult = await fs.write(path, data)
      expect(isErr(writeResult)).toEqual(false)

      const existsResult = await fs.exists(path)
      expect(isErr(existsResult)).toEqual(false)
      expect(Result.unwrap(existsResult)).toEqual(true)

      const readResult = await fs.read(path)
      expect(isErr(readResult)).toEqual(false)

      const stream = Result.unwrap(readResult)
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let contents = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const uint8Array = value instanceof Uint8Array ? value : new Uint8Array(value as ArrayBuffer)
        contents += decoder.decode(uint8Array, { stream: true })
      }
      contents += decoder.decode()

      expect(contents).toEqual(data)

      // Clean up
      await fs.delete(path)
      const existsAfterDeleteResult = await fs.exists(path)
      expect(isErr(existsAfterDeleteResult)).toEqual(false)
      expect(Result.unwrap(existsAfterDeleteResult)).toEqual(false)
    }
  })

  test('delete file', async () => {
    for (const { fs } of await Fixtures()) {
      const path = 'test.txt'

      const writeResult = await fs.write(path, 'test')
      expect(isErr(writeResult)).toEqual(false)

      const existsResult = await fs.exists(path)
      expect(isErr(existsResult)).toEqual(false)
      expect(Result.unwrap(existsResult)).toEqual(true)

      const deleteResult = await fs.delete(path)
      expect(isErr(deleteResult)).toEqual(false)

      const existsAfterDeleteResult = await fs.exists(path)
      expect(isErr(existsAfterDeleteResult)).toEqual(false)
      expect(Result.unwrap(existsAfterDeleteResult)).toEqual(false)
    }
  })

  test('list directory', async () => {
    for (const { fs } of await Fixtures()) {
      const files = ['test1.txt', 'test2.txt', 'test3.txt']

      for (const file of files) {
        const writeResult = await fs.write(file, 'test')
        expect(isErr(writeResult)).toEqual(false)
      }

      const listResult = await fs.listDirectory('')
      expect(isErr(listResult)).toEqual(false)
      const listed = Result.unwrap(listResult)
      expect(listed.sort()).toEqual(files.sort())

      // Clean up
      for (const file of files) {
        await fs.delete(file)
      }

      const listAfterDeleteResult = await fs.listDirectory('')
      expect(isErr(listAfterDeleteResult)).toEqual(false)
      expect(Result.unwrap(listAfterDeleteResult)).toEqual([])
    }
  })

  test('get file info', async () => {
    for (const { fs } of await Fixtures()) {
      const path = 'test.txt'

      const writeResult = await fs.write(path, 'test')
      expect(isErr(writeResult)).toEqual(false)

      const infoResult = await fs.getFileInfo(path)
      expect(isErr(infoResult)).toEqual(false)
      const info = Result.unwrap(infoResult)
      expect(info.isDirectory()).toEqual(false)

      // Clean up
      await fs.delete(path)
      const existsAfterDeleteResult = await fs.exists(path)
      expect(isErr(existsAfterDeleteResult)).toEqual(false)
      expect(Result.unwrap(existsAfterDeleteResult)).toEqual(false)
    }
  })
})
