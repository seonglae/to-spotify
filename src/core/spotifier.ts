import axios, { AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import * as progress from 'cli-progress'
import * as rax from 'retry-axios'
import * as colors from 'colors'

import Musicface from './musicface'

type Search = {
  res: Promise<AxiosResponse>
  name: string
  results: Array<any>
}

const SPOTIFY_API = 'https://api.spotify.com/v1'
const consola = require('consola')

export class Spotifier implements Musicface {
  axios: AxiosInstance = axios.create()
  nextQueries: string = ''

  constructor(stoken: string) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${stoken}`
    const raxConfig = {
      retryDelay: 1000,
      retry: Infinity,
      instance: this.axios,
      onRetryAttempt: (err: AxiosError) => {
        if (err.response?.status === 429) return
        else console.log(err)
      },
    }
    this.axios.defaults.raxConfig = raxConfig
    this.axios.defaults.raxConfig.backoffType = 'linear'
    rax.attach(this.axios)
  }

  public async playlist(all: Array<string>, title: string, name?: string, open?: boolean) {
    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'track')
    if (ids.length === 0) return

    // Step 3. Migrate Playlist
    const sid = (await this.axios.get(`${SPOTIFY_API}/me`)).data.id
    const playlist = (
      await this.axios.post(`${SPOTIFY_API}/users/${sid}/playlists`, {
        name: name ? name : title,
        description: `Migrated from ${title} by Seonglae's To Spotify`,
        public: open,
      })
    ).data

    const uris = []
    for (const id of ids) uris.push(`spotify:track:${id}`)
    const reses = await this.asyncChunkRequest<string, AxiosResponse>(uris, async (uris): Promise<Array<AxiosResponse>> => {
      return await this.axios.post(`${SPOTIFY_API}/playlists/${playlist.id}/tracks`, { uris }).catch(err => err.response)
    })
    if (reses.every(res => res.status === 201)) consola.success(`${ids.length} tracks added`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likedArtists(all: Array<string>): Promise<void> {
    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'artist')
    if (ids.length === 0) return

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids)
      promises.push(this.axios.put(`${SPOTIFY_API}/me/following?type=artist&ids=${id}`).catch(err => err.response))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 204)) consola.success(`${ids.length} artists followed`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likedAlbums(all: Array<string>): Promise<void> {
    // Step 2. Search Spotify Album ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'album')
    if (ids.length === 0) return

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/albums?&ids=${id}`).catch(err => err.response))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} album liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likedTracks(all: Array<string>): Promise<void> {
    // Step 2. Search Spotify Track ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'track')
    if (ids.length === 0) return

    // Step 3. Like Tracks
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/tracks?&ids=${id}`).catch(err => err.response))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} tracks liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  async nameToSpotifyId(all: Array<string>, type: string): Promise<Array<string>> {
    const reqs = []
    for (const name of all) {
      const res = this.axios
        .get(`${SPOTIFY_API}/search?limit=1&q=${encodeURI(name)}&type=${type}`)
        .catch(err => err.response)
      const search: Search = { res, name, results: [] }
      reqs.push(search)
    }
    const responses = await this.progressPromises(
      reqs.map(req => req.res),
      'Searching'
    )
    if (responses.some(res => res.status === 401)) {
      consola.error('Token Expired!')
      return []
    }
    reqs.map((req, i) => (req.results = responses[i].data[`${type}s`].items))

    // Failed
    const faileds = reqs.filter(req => req.results.length === 0).map(req => req.name)
    console.log(faileds.join('\n'))
    if (faileds.length > 0) consola.error(`위 ${faileds.length}개 아이템은 검색하지 못했습니다.`)

    const successes = reqs.filter(req => req.results.length !== 0).map(res => res.results[0].id)
    consola.success(`Resolved ${successes.length}`)
    return successes
  }

  async asyncChunkRequest<Input, Output>(
    inputs: Array<Input>,
    method: (inputs: Array<Input>, ...args: unknown[]) => Array<Output> | Promise<Array<Output>>,
    args: unknown[] = [],
    chunkSize: number = 100
  ): Promise<Array<Output>> {
    const results: Array<Output> = []
    for (const index in Array.from({ length: Math.ceil(inputs.length / chunkSize) })) {
      const chunk = inputs.slice(Number(index) * chunkSize, (Number(index) + 1) * chunkSize)
      const chunkResult = await method(chunk, ...args)
      results.push(...chunkResult)
    }
    return results
  }

  async progressPromises<T>(promises: Array<Promise<T>>, title: string): Promise<Array<T>> {
    const bar = new progress.Bar({
      format: title + ' |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    })
    bar.start(promises.length, 0, { speed: 'N/A' })
    let started = new Date().getTime()
    let finished = 0
    for (const promise of promises)
      promise.then(() => {
        const interval: number = (new Date().getTime() - started) / (1000 * (finished + 1))
        bar.update(++finished, { speed: `${String(interval).slice(0, 5)} 초/검색` })
      })
    const results = await Promise.all(promises)
    bar.stop()
    console.log()
    return results
  }
}

export default Spotifier
