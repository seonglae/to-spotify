#!/usr/bin/env node

import { Command, Option } from 'commander'

import g2s from '../index'

const consola = require('consola')
const { version, description }: { version: string; description: string } = require('../../package.json')
const program = new Command()

async function main() {
  // set version
  program.version(version, '-v, --version').description(description)

  // make options
  const genieID = new Option('--gid <gid>', 'bool genie account id number').default(false)
  const spotifyToken = new Option('--stoken <stoken>, --spotify-token <stoken>', 'spotify token').default('')

  // Run file command
  program
    .command('like <command>')
    .alias('r')
    .description('G2S Migrate genie liked artist to spotify follow artist')
    .addOption(genieID)
    .addOption(spotifyToken)
    .action(async (command, options): Promise<void> => {
      if (command === 'artists') g2s.likeArtist(options.gid, options.stoken)
      else if (command === 'albums') g2s.likeAlbums(options.gid, options.stoken)
      else if (command === 'tracks') g2s.likeTracks(options.gid, options.stoken)
    })

  program.parse(process.argv)
}

main().catch((e: Error) => consola.error(e))
