import axios, { AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import * as rax from 'retry-axios'

import Musicface from './musicface'

const consola = require('consola')

const SPOTIFY_API = 'https://api.spotify.com/v1'

type Search = {
  res: Promise<AxiosResponse>
  name: string
  results: Array<any>
}

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
        if (err.response?.status !== 429) console.log(err.response)
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
    const res = await this.axios.post(`${SPOTIFY_API}/playlists/${playlist.id}/tracks`, { uris })
    if (res.status === 201) consola.success(`${ids.length} tracks added`)
    else consola.error(`Something Wrong with code ${res.status}`)
  }

  public async likedArtists(all: Array<string>): Promise<void> {
    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'artist')
    if (ids.length === 0) return

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/following?type=artist&ids=${id}`))
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
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/albums?&ids=${id}`))
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
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/tracks?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} tracks liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  async nameToSpotifyId(all: Array<string>, type: string): Promise<Array<string>> {
    const reqs = []
    for (const name of all) {
      const res = this.axios.get(`${SPOTIFY_API}/search?q=${encodeURI(name)}&type=${type}`).catch(err => err.response)
      const search: Search = { res, name, results: [] }
      reqs.push(search)
    }
    const responses = await Promise.all(reqs.map(req => req.res))
    if (responses.every(res => res.status === 401)) {
      consola.error('Token Expired!')
      return []
    }
    reqs.map((req, i) => (req.results = responses[i].data[`${type}s`].items))

    const faileds = reqs.filter(req => req.results.length === 0).map(req => req.name)
    console.log(faileds.join('\n'))
    if (faileds.length > 0) consola.error(`Not Resolved ${faileds.length}`)
    return reqs.filter(req => req.results.length !== 0).map(res => res.results[0].id)
  }
}

export default Spotifier
