import Spotifier from './spotifier'
import Crawler from './crawler'

const consola = require('consola')

const SPOTIFY_API = 'https://api.spotify.com/v1'

export class Migrator {
  spotifier: Spotifier = new Spotifier()
  crawler: Crawler = new Crawler()

  public async playlist(
    url: string,
    stoken: string,
    queries: Array<string>,
    filters: Array<Array<string>>,
    titleQuery: string,
    name?: string,
    open?: boolean
  ) {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters)
    const title = await this.crawler.getQueryText(page, titleQuery)
    await browser.close()

    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    this.spotifier.setAxios(stoken)
    const ids = await this.spotifier.nameToSpotifyId(all, 'track')
    if (ids.length === 0) return

    // Step 3. Migrate Playlist
    const sid = (await this.spotifier.axios.get(`${SPOTIFY_API}/me`)).data.id
    const playlist = (
      await this.spotifier.axios.post(`${SPOTIFY_API}/users/${sid}/playlists`, {
        name: name ? name : title,
        description: `Migrated from ${title} by Seonglae's To Spotify`,
        public: open,
      })
    ).data
    const uris = []
    for (const id of ids) uris.push(`spotify:track:${id}`)
    const res = await this.spotifier.axios.post(`${SPOTIFY_API}/playlists/${playlist.id}/tracks`, { uris })
    if (res.status === 201) consola.success(`${ids.length} tracks added`)
    else consola.error(`Something Wrong with code ${res.status}`)
  }

  public async likedArtists(
    url: string,
    stoken: string,
    queries: Array<string>,
    filters: Array<Array<string>>
  ): Promise<void> {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters)
    await browser.close()

    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    this.spotifier.setAxios(stoken)
    const ids = await this.spotifier.nameToSpotifyId(all, 'artist')
    if (ids.length === 0) return

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.spotifier.axios.put(`${SPOTIFY_API}/me/following?type=artist&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 204)) consola.success(`${ids.length} artists followed`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likedAlbums(
    url: string,
    stoken: string,
    queries: Array<string>,
    filters: Array<Array<string>>
  ): Promise<void> {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters)
    await browser.close()

    // Step 2. Search Spotify Album ids
    if (all.length === 0) return
    this.spotifier.setAxios(stoken)
    const ids = await this.spotifier.nameToSpotifyId(all, 'album')
    if (ids.length === 0) return

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.spotifier.axios.put(`${SPOTIFY_API}/me/albums?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} album liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likedTracks(
    url: string,
    stoken: string,
    queries: Array<string>,
    filters: Array<Array<string>>
  ): Promise<void> {
    const { page, browser } = await this.crawler.goToPage(url)
    // Step 1. Crawl Lists
    const all = await this.crawler.getList(page, queries, filters)
    await browser.close()

    // Step 2. Search Spotify Track ids
    if (all.length === 0) return
    this.spotifier.setAxios(stoken)
    const ids = await this.spotifier.nameToSpotifyId(all, 'track')
    if (ids.length === 0) return

    // Step 3. Like Tracks
    const promises = []
    for (const id of ids) promises.push(this.spotifier.axios.put(`${SPOTIFY_API}/me/tracks?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} tracks liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }
}

export default Migrator
