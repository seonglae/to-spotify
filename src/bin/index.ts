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
  const genieUser = new Option('-bgsq <bgsq>', 'bool genie account id number').default('')
  const spotifyToken = new Option('--stoken <stoken>, --spotify-token <stoken>', 'spotify token').default('')
  const geniePlaylist = new Option('--mxnm <mxnm>, --axnm <mxnm>', 'genie playlist id').default('')
  const playlistName = new Option('--name <name>, --name <name>', 'new name').default(undefined)
  const playlistPublic = new Option('--public').default(false)

  // Run file command
  program
    .command('liked <command>')
    .description('G2S Migrate genie liked artist to spotify follow artist')
    .addOption(genieUser)
    .addOption(spotifyToken)
    .action(async (command: string, options: { bgsq: string; stoken: string }): Promise<void> => {
      if (command === 'artists') g2s.likeArtist(options.bgsq, options.stoken)
      else if (command === 'albums') g2s.likeAlbums(options.bgsq, options.stoken)
      else if (command === 'tracks') g2s.likeTracks(options.bgsq, options.stoken)
    })

  // Run file command
  program
    .command('playlist <command>')
    .description('G2S Migrate genie playlist to Spotify playlist')
    .addOption(genieUser)
    .addOption(spotifyToken)
    .addOption(playlistName)
    .addOption(geniePlaylist)
    .addOption(playlistPublic)
    .action(
      async (
        _: string,
        options: { bgsq: string; stoken: string; mxnm: string; name?: string; public?: boolean }
      ): Promise<void> => {
        g2s.migratePlaylist(options.bgsq, options.mxnm, options.stoken, options.name, options.public)
      }
    )

  program.parse(process.argv)
}

main().catch((e: Error) => consola.error(e))
