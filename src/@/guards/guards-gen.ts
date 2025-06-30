import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

//
//
//
//
//
//
//

const DIR_PATH = path.join(fileURLToPath(import.meta.url), '..', '..')
const TARGET_FILE_SUFFIX = '.type.ts'

//
//
//
//
//
//

async function generateGuardFiles(files: string[]) {
  for (const file of files) {
    const COMMAND = `npx ts-auto-guard ${file}`

    exec(COMMAND, (error, stdout, stderr) => {
      console.log(stdout)
      if (error) {
        console.error('Error running ts-auto-guard:', stderr)
        return
      }
      console.log(`Generated type guards for ${file}`)
    })
  }
}

async function main() {
  const files = await scanFiles({
    dir: DIR_PATH,
    targetFileSuffix: TARGET_FILE_SUFFIX,
  })

  await generateGuardFiles(files)
}

main().catch(console.error)

//
//
//
//
// Utils
//
//
//
//

async function scanFiles(input: { dir: string; targetFileSuffix: string }): Promise<string[]> {
  const files: string[] = []

  const filesAndDirectories = await fs.readdir(input.dir, {
    withFileTypes: true,
  })

  for (const file of filesAndDirectories) {
    const res = path.resolve(input.dir, file.name)

    if (file.isDirectory()) {
      const children = await scanFiles({
        dir: res,
        targetFileSuffix: input.targetFileSuffix,
      })
      files.push(...children)
      continue
    }

    if (file.name.endsWith(input.targetFileSuffix)) {
      files.push(res)
    }
  }

  return files
}
