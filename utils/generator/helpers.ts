import { INITIAL_HEIGHT, INITIAL_WIDTH } from '@/utils/generator/constants'
import gm from 'gm'
import tempy from 'tempy'
import { join, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

export const projectPath = resolve(process.cwd())

export const composite = (a: string, b: string, out: string) =>
  new Promise((resolve, reject) =>
    gm(a)
      .composite(b)
      .write(out, function (err: any) {
        if (err) return reject(err)
        return resolve(out)
      })
  )

export function skip(songNbr: string, prop: string, value: string) {
  throw new Error(
    `Error in song ${songNbr} because ${prop} ${value} layer isn't available!`
  )
}

export function tempBackgroundColor(color: string): Promise<string> {
  const path = tempy.file({ extension: 'png' })
  return new Promise((resolve, reject) =>
    gm(INITIAL_WIDTH, INITIAL_HEIGHT, color).write(path, (err) => {
      if (err) return reject(err)
      return resolve(path)
    })
  )
}

const nameFromKey = (prefix: string, key: string) =>
  `${prefix}_${key.toLowerCase()}.png`

export const pathFromKey = (year: number, prefix: string, key: string) =>
  join(projectPath, `/layers/${year}/${nameFromKey(prefix, key)}`)

export const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}
