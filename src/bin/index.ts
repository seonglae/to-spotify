#!/usr/bin/env node

import { Command, Option } from 'commander'
import { basher } from '../index'
import type Auto from '../auto'

const consola = require('consola')
const { version, description } = require('../../package.json')
const program = new Command()

async function main() {
  // set version
  program.version(version, '-v, --version').description(description)

  // make options
  const resetOption = new Option('-r, --reset', 'remake if exist')
  const shortOption = new Option('--short', 'not uuid, use short name')
  const separateOption = new Option('-s, --separate', 'separate basher per file')
  const inputOption = new Option('-i, --input <input>', 'file elative input path')
  const outputOption = new Option('-o, --output <output>', 'file relative output path')

  // Run Folder command
  program
    .command('folder <command>')
    .alias('s')
    .description('Basher run folder')
    .addOption(inputOption)
    .addOption(outputOption)
    .addOption(resetOption)
    .addOption(separateOption)
    .action(async (command, options) => {
      await basher.runFolder(command, <Auto.BasherOption>options)
      consola.info('After Jobs')
    })

  // Run file command
  program
    .command('file <command>')
    .alias('r')
    .description('Basher run file')
    .addOption(inputOption)
    .addOption(outputOption)
    .addOption(shortOption)
    .addOption(resetOption)
    .addOption(separateOption)
    .action(async (command, options) => {
      await basher.runFile(command, <Auto.BasherOption>options)
      consola.info('After Jobs')
    })

  program.parse(process.argv)
}

main().catch(e => consola.error(e))
