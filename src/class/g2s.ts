import axios, { AxiosResponse, AxiosError } from 'axios'
import * as rax from 'retry-axios'
import { chromium as engine, Page } from 'playwright'

const consola = require('consola')

const GENIE = 'https://www.genie.co.kr'
const SPOTIFY_API = 'https://api.spotify.com/v1'

type Search = {
  res: Promise<AxiosResponse>
  name: string
  results: Array<any>
}

export class G2S {
  axios = axios.create()

  setAxios(stoken: string) {
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

  public async playlist(bgsq: string, mxnm: string, stoken: string, name?: string, open?: boolean) {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await engine.launch()
    const context = await browser.newContext()
    const page: Page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/profileRecommandDetail?axnm=${mxnm}&bgsq=${bgsq}`)
    const all = await this.getGenieLists(page, ['a.artist', 'a.title'])
    const title = await this.getGenieTitle(page)
    await browser.close()

    // Step 2. Search Spotify Artist ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'track')
    if (ids.length === 0) return

    // Step 3. Migrate Playlist
    const sid = (await this.axios.get(`${SPOTIFY_API}/me`)).data.id
    const playlist = (
      await this.axios.post(`${SPOTIFY_API}/users/${sid}/playlists`, {
        name: name ? name : title,
        description: `Migrated from Genie ${title} by Seonglae's To Spotify`,
        public: open,
      })
    ).data
    const uris = []
    for (const id of ids) uris.push(`spotify:track:${id}`)
    const res = await this.axios.post(`${SPOTIFY_API}/playlists/${playlist.id}/tracks`, { uris })
    if (res.status === 201) consola.success(`${ids.length} tracks added`)
    else consola.error(`Something Wrong with code ${res.status}`)
  }

  public async likedArtists(bgsq: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await engine.launch()
    const context = await browser.newContext()
    const page: Page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeArtist?mltp=artist&bgsq=${bgsq}`)
    const all = await this.getGenieLists(page, ['.artist-name'])
    await browser.close()

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

  public async likedAlbums(bgsq: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await engine.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeAlbum?mltp=album&bgsq=${bgsq}`)
    const all = await this.getGenieLists(page, ['dt.ellipsis', '.album-artist'])
    await browser.close()

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

  public async likedTracks(bgsq: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await engine.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeSong?mltp=song&bgsq=${bgsq}`)
    const all = await this.getGenieLists(page, ['a.artist', 'a.title'])
    await browser.close()

    // Step 2. Search Spotify Track ids
    if (all.length === 0) return
    const ids = await this.nameToSpotifyId(all, 'track')

    // Step 3. Like Tracks
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/tracks?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} tracks liked`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  async getGenieLists(page: Page, queries: Array<string>) {
    const all: Array<string> = []
    let pg = 1
    while (true) {
      const { lists, href } = await page.evaluate((queries): { href?: string; lists: Array<string> } => {
        const nameSets: Array<Array<string>> = []
        for (const query of queries) {
          const elements: NodeListOf<HTMLElement> = document.querySelectorAll(query)
          elements.forEach((element: HTMLElement, index: number) => {
            const name = element.innerText.replace('19금 ', '').replace('TITLE ', '').replace('#', '')
            if (nameSets[index]) nameSets[index].push(name)
            else nameSets[index] = [name]
          })
        }
        const lists: Array<string> = nameSets.map(nameSet => nameSet.join(' '))
        const nextBtn = <HTMLAnchorElement>document.querySelectorAll('.page-nav .next')[0]
        return { href: nextBtn?.onclick ? undefined : nextBtn.href, lists }
      }, queries)
      all.push(...lists)
      consola.success(`Page ${pg++} Added`)
      if (href) await page.goto(href)
      else break
    }
    consola.info('\nGenie Lists\n')
    console.log(all.join('\n'))
    return all
  }

  async getGenieTitle(page: Page): Promise<string> {
    return await page.evaluate((): string => {
      const element = <HTMLElement>document.querySelector('.info__title')
      const title: string = element.innerText
      return title
    })
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
    consola.error(`Not Resolved\n` + faileds.join('\n'))
    return reqs.filter(req => req.results.length !== 0).map(res => res.results[0].id)
  }
}

export default G2S
