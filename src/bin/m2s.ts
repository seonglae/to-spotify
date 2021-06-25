#!/usr/bin/env node

import { Command, Option } from 'commander'

import M2S from '../worker/m2s'

type LikedOption = { stoken: string; mkey: string }
type PlayListOption = { stoken: string; pseq: string; name?: string; public?: boolean }

const consola = require('consola')
const { version, description }: { version: string; description: string } = require('../../package.json')
const program = new Command()

function main() {
  // Necessary Options
  const spotifyToken = new Option('-s, --stoken <stoken>', 'spotify token').default('')

  // Optional Options
  const memberKey = new Option('-m, --mkey <mkey>', 'melon member key').default('')
  const playlistSeq = new Option('-p --pseq <pseq>', 'melon playlist sequence').default('')
  const playlistName = new Option('--name <name>', 'new name').default(undefined)
  const playlistPublic = new Option('--public').default(false)

  // Commands
  program.version(version, '-v, --version').description(`Melon ${description}`)
  program
    .command('liked <command>')
    .description('G2S Migrate melon liked artist to spotify follow artist')
    .addOption(memberKey)
    .addOption(spotifyToken)
    .action(async (command: string, options: LikedOption): Promise<void> => {
      if (!options.stoken) return consola.error('No Spotify Token')
      if (!options.mkey) return consola.error('No Melon User ID')
      const m2s = new M2S(options.stoken, options)
      if (command === 'artists') m2s.likedArtists()
      else if (command === 'albums') m2s.likedAlbums()
      else if (command === 'tracks') m2s.likedTracks()
      else consola.error(`No ${command} Option, artists or albums or tracks`)
    })
  program
    .command('playlist')
    .description('M2S Migrate melon playlist to Spotify playlist')
    .addOption(spotifyToken)
    .addOption(playlistName)
    .addOption(playlistSeq)
    .addOption(playlistPublic)
    .action(async (options: PlayListOption): Promise<void> => {
      if (!options.stoken) return consola.error('No Spotify Token')
      if (!options.pseq) return consola.error('No Melon Playlist ID')
      const m2s = new M2S(options.stoken, options)
      m2s.playlist(options.name, options.public)
    })
  program.parse(process.argv)
}

try {
  main()
} catch (err) {
  consola.error(err)
}
