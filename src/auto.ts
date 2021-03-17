import { existsSync, promises as fsPromises } from 'fs'
import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'

const consola = require('consola')
const chalk = require('chalk')
const { v4 } = require('uuid')
const { copy, move } = require('fs-extra')
const uuid = v4

namespace Auto {
  export type BasherOption = {
    readonly input: string
    readonly output: string
    readonly separate?: boolean
    readonly reset?: boolean
    readonly short?: boolean
  }

  export class Basher {
    /**
     * Run Folder basher
     * @param {string} path - file path
     * @param {BasherOption} options - basher make run option
     * @example
     * ```ts
     * basher.runFolder(path, option)
     * ```
     * @return {Promise<void>}
     */
    public async runFolder(command: string, options: BasherOption): Promise<void> {
      // check input
      const input = options.input
      const output = options.output
      if (!existsSync(input)) throw new Error('Path not exists')
      let files = await fsPromises.readdir(input)

      // make temp folder path
      const copied: string =
        process.platform === 'win32' ? join('/', 'tmp', options.short ? 'i' : uuid()) : join(tmpdir(), uuid())
      const converted: string =
        process.platform === 'win32' ? join('/', 'tmp', options.short ? 'o' : uuid()) : join(tmpdir(), uuid())
      consola.info('Temp Copy Path', copied, '\n')
      consola.info('Temp Convert Path', converted, '\n')

      if (options.separate) for (const file of files) await this.runFile(join(input, file), options)
      // make file merged basher
      else {
        if (!options.reset) if (existsSync(output)) return consola.info('Already exists')
        consola.info('Copy File\n')
        await copy(input, copied)
        consola.info('Reduce File names\n')
        await Promise.all(files.map((file, i) => fsPromises.rename(join(copied, file), join(copied, String(i)))))
        files = await fsPromises.readdir(copied)
        await this.callCommand(
          command,
          [...files.map(file => join(copied, file)), '-o', converted],
          'Convert file to basher'
        )
        if (existsSync(output)) {
          consola.info('\n', chalk.inverse('Remove If folder exist'), '\n')
          await fsPromises.rmdir(output, { recursive: true })
        }
        fsPromises.rmdir(copied, { recursive: true })
        move(converted, output)
        consola.success(chalk.inverse('End Folder'), output, '\n')
      }
    }


    /**
     * Run File basher
     * @param {string} path - file path
     * @param {BasherOption} options - basher make run option
     * @example
     * ```ts
     * basher.runFile(path, option)
     * ```
     * @return {Promise<void>}
     */
    public async runFile(command: string, options: BasherOption): Promise<void> {
      const input = options.input
      if (!existsSync(input)) throw new Error('Path not exists')
      consola.success(`Start File ${command}`, input)
      if (options.separate) throw new Error('Separated format not yet supported')
      else throw new Error('Merged fomat with file target not allowed')
    }


    /**
     * Spawn command by program and args
     * @param {string} program - bash program
     * @param {string[]} args - bash program args
     * @param {string} message -  console message
     * @example
     * ```ts
     * callCommand('ls', '-al', 'show all current folder file/folders')
     * ```
     * @return {Promise} process promise
     */
    private async callCommand(program: string, args: string[], message?: string) {
      return new Promise((resolve, reject) => {
        consola.info(message, '\n')
        const process = spawn(program, args, { stdio: 'inherit', shell: true })
        process.on('close', code => resolve(code))
        process.on('error', err => reject(err))
      })
    }
  }
}

export default Auto
